const pool = require("../database/conection")
const generator = require("generate-password")
const bcrypt = require("bcryptjs")
const sgMail = require("@sendgrid/mail")
const { checkOwnerCompany } = require("../utils/functions")
const {ROLES} = require("../utils/roles")

const createUser = async(req, res) => {
    const {id, rol_id} = req.user//obtencion de datos desd el token
    const {nombre, apellidos, email, id_empresa, telefono, sueldo, dni} = req.body//recupracion de datos del body
         
    if(!id || Number(rol_id) == ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de permisos
    }

    if(!nombre || !apellidos || !email || !id_empresa || !dni){
        return res.status(400).json({error:"Faltan campos por rellenar"})//comprobacion de campos vacios
    }

    const emailNormalized = email.toLowerCase().trim()//para evitar que el correo se escape alguna letra en mayuscula o espacios

    try{

        const findUser = await pool.query(
            "SELECT id FROM usuarios WHERE email = $1",
            [emailNormalized]
        )

        if(findUser.rows.length > 0){
            return res.status(400).json({error:"Este usuario ya existe"})//comprobacion de existencia del usuario
        }

    const checkOwnerCompany = await pool.query(
        "SELECT id FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
        [id, id_empresa]
    )

    if(checkOwnerCompany.rows.length === 0){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de pertencencia del requester
    }

        const randomPassword = generator.generate({//generacion de contraseña aleatoria
            length:12,
            numbers:true,
            symbols:true,
            uppercase:true,
            lowercase:true,
            strict:true
        })
        const salt = await bcrypt.genSalt(10)
        const randomPasswordHashed = await bcrypt.hash(randomPassword, salt)//hasheao de la contraseña aleatoria

        

        const newUser = await pool.query(
            "INSERT INTO usuarios (nombre, apellidos, email, password, verified, rol_id, password_changed, dni, telefono, sueldo) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id",
            [nombre, apellidos, emailNormalized, randomPasswordHashed, true, 3, false, dni, telefono, sueldo]//actualizamos usuarios
        )

        const date = new Date()

         await pool.query(
            "INSERT INTO usuarios_empresas (usuario_id, empresa_id, init_date) VALUES ($1, $2, $3)",//actualizamos usuarios_empresas
            [newUser.rows[0].id, id_empresa, date]
        )

        const msg = {//creamos email con credenciales del usuario 
                to:email,
                from: "julio.cesar.santos.reyes@students.thepower.education",
                subject: "Credenciales de acceso a HosTech",
                text: `Bienvenido a HosTech. Su correo de acceso es ${emailNormalized} y su contraseña temporal es ${randomPassword}. Por favor reestablezca su contraseña en su primer acceso a la plataforma`,
                html: `<p>Bienvenido a HosTech.</p><p>Su correo: <b>${emailNormalized}</b></p><p>Contraseña temporal: <b>${randomPassword}</b></p><p>Por favor reestablezca su contraseña en su primer acceso.</p>`,
                replyTo: "julio.cesar.santos.reyes@students.thepower.education"
            }
        
            await sgMail.send(msg)//enviamos email

            return res.status(200).json({//todo OK
                message: "Usuario creado correctamente",
                nombre:nombre,
                email: emailNormalized,
                id_empresa: id_empresa
            })

    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})//manejamos otros errores
    }

}

const firstLogin = async (req, res) => {
    const {id, firstLogin} = req.user//recuperamos datos del token temporal
    const {newPassword} = req.body//recuperamos nuevo password

    if(!id || firstLogin == false){
        return res.status(400).json({error: "Ya ha sido reestablecida su contraseña por primera vez o el token ha expirado"})//comprobamos que ya el usuario no haya reestablecido su password previamente
    }
    
    if(!newPassword){
        return res.status(400).json({error: "Debes establecer una nueva contraseña"})//comprobacion de campos vacios

    }

    try{
        
        const salt = await bcrypt.genSalt(10)
        const passwordHashed = await bcrypt.hash(newPassword, salt)//haseho nuevo password

        await pool.query(
            "UPDATE usuarios SET password = $1, password_changed = $2 WHERE id = $3",
            [passwordHashed,true,id]
        )

        return res.status(200).json({
            message:"Contraseña reestablecida correctamente"//todo OK
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejamos errores 
    }
}

const userProfile = async (req, res) => {
    const {id} = req.user//traemos datos del token

    if(!id){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de token expirado, manipulado o mal formado
    }

    try{

        const results = await pool.query(
            "SELECT usuarios.nombre, usuarios.apellidos, usuarios.email, usuarios.telefono, usuarios.dni, usuarios.sueldo, roles.rol FROM usuarios JOIN roles ON usuarios.rol_id = roles.id WHERE usuarios.id=$1",
            [id]
        )

        if(results.rows.length === 0){
            return res.status(404).json({error: "Usuario no encontrado"})//comprobacion de que el usuario existe
        }

        return res.status(200).json({//todo OK
            user: results.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})//manejos de otros errores
    }
}

const ownersAndAdminsView = async (req, res) => {
    const {id, rol_id} = req.user//recuperacion de datos del token

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error:"No tienes permisos"})//comprobacion de permisos
    }

    try{
        const companysRows = await pool.query(
            "SELECT empresa_id FROM usuarios_empresas WHERE usuario_id = $1",
            [id]
        )

        if(companysRows.rows.length === 0){
            return res.status(404).json({error: "No tienes o perteneces a ninguna empresa"})//comprobacion de que el usuario pertence a alguna empresa
        }

        const companysID = companysRows.rows.map(ci => ci.empresa_id)//traemos 1 o mas empresas del usuario requester

        const findUsers = await pool.query(
            "SELECT DISTINCT u.nombre, u.apellidos, u.email, u.telefono, u.dni, u.sueldo, e.nombre AS empresa, r.rol AS rol FROM  usuarios_empresas ue JOIN usuarios u ON ue.usuario_id = u.id JOIN roles r ON u.rol_id = r.id JOIN empresas e ON ue.empresa_id = e.id WHERE ue.empresa_id = ANY($1) AND u.id <> $2",
            [companysID, id]
        )

        return res.status(200).json(findUsers.rows)//devolvemos 1 o mas trabajdores
    
    
    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})//manejo de otros errores
    }
}



const updateUsers = async(req, res) => {
    const {id, rol_id} = req.user//treamos fatos del token
    const {email, nombre, apellidos, telefono, sueldo} = req.body//datos para actualizar del body
    const {id_usuario} = req.params//usuario objetivo de cambios

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error:"No tienes permisos"})//comprobacion de permisos
    }

    if(!id_usuario){
        return res.status(404).json({error:"No hay seleccionado ningun usuario"})//comprobacion de seleccion correcta
    }

    try{

        const chekOwner = await pool.query(
            "SELECT empresa_id FROM usuarios_empresas WHERE usuario_id = $1",
            [id]
        )

        if(chekOwner.rows.length === 0){
            return res.status(403).json({error: "No tienes permisos"})//comprobacion de que el requester tiene alguna empresa
        }

        const companys = chekOwner.rows.map(c => c.empresa_id)
        const checkOwnerCompanys = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE empresa_id = ANY($1) AND usuario_id = $2",//comprobacion de que el usuario objetivo pertence a alguna empresa del requester
            [companys, id_usuario]
        )

        if(checkOwnerCompanys.rows.length === 0 ){
            return res.status(403).json({error: "No tienes permisos para modificar este usuario"})
        }

    if(!email && !nombre && !apellidos && !telefono && !sueldo){
        const noChanges = await pool.query(
            "SELECT nombre, apellidos, email FROM usuarios WHERE id=$1",//comprobacion de que no se hicieron cambios
            [id_usuario]
        )

        return res.status(200).json({
            message: "No se han realizado cambios",//devolucion de datos anteriores y mensaje explicativo
            user: noChanges.rows[0]
        })
    }

        //recuperacion de datos opcionales que puede ser sujetos de cambios y actualizaciones
        const values = []
        const setParts = []
        let query = "UPDATE usuarios SET "

        if(nombre){
            values.push(nombre)
            setParts.push(`nombre = $${values.length}`)
        }

        if(apellidos){
            values.push(apellidos)
            setParts.push(`apellidos = $${values.length}`)
        }

        if(email){
            values.push(email)
            setParts.push(`email = $${values.length}`)
        }

        if(telefono){
            values.push(telefono)
            setParts.push(`telefono = $${values.length}`)
        }

        if(sueldo){
            values.push(sueldo)
            setParts.push(`sueldo = $${values.length}`)
        }

        values.push(id_usuario)
        query += setParts.join(", ") + ` WHERE id = $${values.length} RETURNING nombre, apellidos, email, telefono, dni, sueldo`

        const updateUser = await pool.query(query, values)

        //UPDATE usuarios SET nombre = $1, apellidos = $2, email = $3 WHERE id = $4

        return res.status(200).json({
            message: "Usuario modificado con exito",//todo OK
            Actualizacion: updateUser.rows[0]
        })
    }catch(error){
    console.error(error)
    return res.status(500).json({error: "Error del servidor"})//maneejo de errores varios
    }
}

const deleteUser = async (req, res) => {
    const {id, rol_id} = req.user//treamos datos del token
    const {id_usuario} = req.params//traemos datos de la URL

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error:"No tienes permisos"})//comprobacion de permisos
    }

    if(!id_usuario){
        return res.status(404).json({error:"No hay seleccionado ningun usuario"})//comprobacion de campos vacios
    }

    try{

        await checkOwnerCompany(id, id_usuario)//comprobacion de pertenencia

        const deletedUser = await pool.query(
            "DELETE FROM usuarios WHERE id = $1 RETURNING nombre, apellidos",
            [id_usuario]
        )

        return res.status(200).json({
            message: "Usuario eliminado con exito",//todo OK
            userDeleted: deletedUser.rows[0]
        })

    }catch(error){
        //manejo de errores
        if(error.message === "SELF_ACTION_NOT_ALLOWED"){
            return res.status(403).json({error: "No puedes eliminar tu propio usuario"})
        }

        if(error.message === "NO_COMPANY_ACCESS"){
            return res.status(403).json({error:"No tienes permisos en esta empresa"})
        }

        if(error.message === "TARGET_NOT_ALLOWED"){
            return res.status(403).json({error: "No puedes modificar este usuario"})
        }

        return res.status(500).json({error: "Error del servidor"})
    }

}

module.exports = {createUser, firstLogin, userProfile, ownersAndAdminsView, updateUsers, deleteUser}