const pool = require("../database/conection")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)//api key de servicio de mensajeria

//controlador para el registro de usuarios, el registro solo sera para "propietarios"
const register = async(req, res) => {
    const {nombre, apellidos, email, password, dni, telefono, sueldo} = req.body //seleccion de lo que  envia el front
    

    if(!nombre || !apellidos || !email || !password || !dni){
        return res.status(400).json({error: "Faltan campos por rellenar"})//comprobacion de campos vacios
    }

    const normalizedEmail = email.toLowerCase().trim()

    try{
        const userExists = await pool.query(//buscar si el correo existe ya en la bbdd
        "SELECT id FROM usuarios WHERE email = $1", 
        [normalizedEmail]
    )
    
    if(userExists.rows.length > 0){
        return res.status(409).json({error: "Este usuario ya existe"})
    }

    const salt = await bcrypt.genSalt(10)//generacion de salt
    const hashedPassword = await bcrypt.hash(password, salt)//hasheo de password
    const verificationCode = Math.floor(100000 + Math.random() * 900000)//creacion de codigo de verificacion
    const now = new Date()
    const expiry = new Date(now.getTime() + 15 * 60000)//creacion de fecha de expiracion

    const newUser = await pool.query(//insertamos todos los datos en la bbdd
        "INSERT INTO usuarios (nombre, apellidos, email, password, verification_code, code_expire_at, rol_id, password_changed, dni, telefono, sueldo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
        [nombre, apellidos, normalizedEmail, hashedPassword, verificationCode, expiry, 1, true, dni, telefono, sueldo]
    )

    const msg = {//creamos email con codigo de verificacion
        to:email,
        from: "julio.cesar.santos.reyes@students.thepower.education",
        subject: "Código de Verificación",
        text: `Tu codigo de verificación es: ${verificationCode}`,
        html: `<strong>Tu codigo de verificación es: ${verificationCode}</strong>`,
        replyTo: "julio.cesar.santos.reyes@students.thepower.education"
    }

    await sgMail.send(msg)//enviamos email con el codigo

    return res.status(201).json({message:"Usuario creado correctamente, revise su email para verificar"})//confirmamos que todo salio ok

   
    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})//manejo de errores ajenos al cliente
    }
}


//controlador de login
const login = async(req, res) => {//extraemos email y password de la peticion
    const {email, password} = req.body

    if(!email || !password){
        return res.status(400).json({error: "Faltan campos por rellenar"})//comprobamos campos vacios
    }

    const normalizedEmail = email.toLowerCase().trim()

    try{
        const user = await pool.query(//buscamos usuario coincidente con el email
            "SELECT * FROM usuarios WHERE email = $1",
            [normalizedEmail]
        )

        if(user.rows.length == 0){//comprobacion de que existe usuario con ese email
            return res.status(401).json({error:"Usuario o contraseña incorrecta"})
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password)//comparamos password hasheado de la peticion con el password hasheado de la bbdd

        if(!validPassword){
            return res.status(401).json({error:"Usuario o contraseña incorrecta"})//password incorrecto
        }

        if(!user.rows[0].verified){
            return res.status(401).json({error: "Usuario no verificado"})//combprobacion de que el usuario ha sido verificado antes
        }

        if(!user.rows[0].password_changed){
           
            const tempToken = jwt.sign(
            {id:user.rows[0].id, rol_id:user.rows[0].rol_id, firstLogin:true},
            process.env.JWT_SECRET,
            {expiresIn:"10m"}
           )
           
           return res.status(200).json({
            message: "Debes reestablecer tu contraseña",
            tempToken,
            user:{
                id: user.rows[0].id,
                nombre: user.rows[0].nombre,
                rol:user.rows[0].rol_id
            }
            })
        }

        const token = jwt.sign(
            {id:user.rows[0].id, rol_id: user.rows[0].rol_id, firstLogin:false},//creamos token de sesion
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        )

        return res.status(200).json({//devolvemos token y datos relevantes pero no sensibles
            message: "Login correcto",
            token,
            user:{
                id: user.rows[0].id,
                nombre: user.rows[0].nombre,
                rol:user.rows[0].rol_id
            }
        })


    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})//manejos de errores que no son del cliente
    }
}



//contorlador para verificar al usuarios por email
const verifyEmail = async (req, res) => {
    const {email, verificationCode} = req.body//extraemos de la peticion email(vendra del front) y el codigo de verificacion

    if(!email || !verificationCode){
        return res.status(400).json({error: "Faltan campos por rellenar"})//comprobacion de campos vacios
    }

    try{
    const user = await pool.query(//buscamos al usuario en base a las coincidencias(email, codigo y estado)
        "SELECT * FROM usuarios WHERE email = $1 AND verification_code = $2 AND verified = false",
        [email, verificationCode]
    )

    if(user.rows.length == 0){
        return res.status(401).json({error: "Codigo invalido o expirado"})//comprobacion de que la consulta encuentre datos coincidentes
    }

    const now = new Date()

    if(now > user.rows[0].code_expire_at){
        return res.status(401).json({error: "Codigo de verificacion invalido o expirado"})//comprobacion de que no ha expirado el codigo
    }

    await pool.query(
        "UPDATE usuarios SET verified=true, verification_code = NULL, code_expire_at = NULL  WHERE email = $1",//actualizamod el estado de verificacion, y limpiamos campos innecesarios
        [email]
    )

    return res.status(200).json({message: "Usuario verificado correctamente"})//check

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de error del server
    }
}


//contgrolador para rrenviar codigo a usuario no verificado aun
const resendEmail = async (req, res) => {
    const {email} = req.body//extraemos email de la peticion

    try{

        const user = await pool.query(//buscamos usuarios coincidentes con estos campos en la bbdd
            "SELECT * FROM usuarios WHERE email = $1 AND verified = false",
            [email]
        )

        if(user.rows.length == 0){
            return res.status(400).json({error: "Usuario incorrecto o ya verificado"})//usuario inexistente
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000)//creacion de codigo nuevo de verificacion
        const now = new Date()
        const expiry = new Date(now.getTime() + 15 * 60000)//creacion de nueva fecha de expiracion

        await pool.query(
            "UPDATE usuarios SET verification_code = $1, code_expire_at = $2 WHERE email = $3",//insercion en bbdd de los nuevos datos
            [verificationCode, expiry, email]
        )

        const msg = {//creamos email con el nuevo codigo de verificacion
        to:email,
        from: "julio.cesar.santos.reyes@students.thepower.education",
        subject: "Código de Verificación",
        text: `Tu codigo de verificación es: ${verificationCode}`,
        html: `<strong>Tu codigo de verificación es: ${verificationCode}</strong>`,
        replyTo: "julio.cesar.santos.reyes@students.thepower.education"
    }

        await sgMail.send(msg)//reenviamos email con el codigo

        return res.status(200).json({message: "Ha sido enviado un nuevo codigo de verificacion"})//todo ok 
        

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de errores del servidor
    }
}


//controlador para pedir resetear el password
const requestPasswordReset = async (req, res) => {
    const {email} = req.body//extraccion del mail de la req

    if(!email){
        return res.status(400).json({error: "Faltan campos por rellenar"})//comprobacion de campos incompletos
    }

    try{

        const user = await pool.query(
            "SELECT id FROM usuarios WHERE email = $1",//busqueda de coincidencias en la bbdd
            [email]
        )

        if(user.rows.length == 0){
            return res.status(200).json({message: "Si existe este email, se enviara un codigo"})//usuario no existe
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000)//creacion  codigo nuevo de verificacion
        const now = new Date()
        const expiry = new Date(now.getTime() + 15 * 60000)//creacion de  fecha de expiracion

        await pool.query(
            "UPDATE usuarios SET verification_code = $1, code_expire_at = $2 WHERE email = $3",//insercion de los datos en la bbdd
            [verificationCode, expiry, email]
        )

        const msg = {//creamos email con el  codigo de recuperacion
        to:email,
        from: "julio.cesar.santos.reyes@students.thepower.education",
        subject: "Código de Recuperación",
        text: `Tu codigo de recuperación es: ${verificationCode}`,
        html: `<strong>Tu codigo de recuperación es: ${verificationCode}</strong>`,
        replyTo: "julio.cesar.santos.reyes@students.thepower.education"
        }

        await sgMail.send(msg)//enviamos email con el codigo

        return res.status(200).json({message: "Mensaje de recuperacion enviado"})//todo ok

    }catch(error){
        console.error(error)
        return res.status(400).json({error: "Error del servidor"})//manejo de errores del server
    }
}


//controlador para resetear el password
const resetPassword = async(req, res) => {
    const {email, newPassword, recoveryCode} = req.body//extraccion de datos necesarios de la request

    if(!email || !newPassword || !recoveryCode){
        return res.status(400).json({error: "Faltan campos por rellenar"})//comrpobacion de campos incompletos
    }

    
    try{
    const user = await pool.query(
        "SELECT * FROM usuarios WHERE email = $1 AND verification_code = $2",//busqueda del usuario coincidente
        [email, recoveryCode]
    )

    if(user.rows.length === 0){
        return res.status(400).json({error: "Usuario incorrecto o codigo expirado"})
    }

    const now = new Date()

    if(now > user.rows[0].code_expire_at){
        return res.status(400).json({error: "Usuario incorrecto o codigo expirado"})// manejo de errores si token expirado
    }
        
    const salt = await bcrypt.genSalt(10)//creamos salt para la nueva password
    const hashedNewPassword = await bcrypt.hash(newPassword, salt)//hasheamos nuevo password

    await pool.query(
        "UPDATE usuarios SET password = $1, verification_code = NULL, code_expire_at = NULL WHERE email = $2",//insertamos datos en la bbdd
        [hashedNewPassword, email]
    )
    

    return res.status(200).json({message: "Cuenta recuperada con exito"})//ok
    }catch(error){
        console.error(error)
       return res.status(500).json({error: "Error del servidor"})//manejo de errores del server
    }
}


module.exports = {register, login, verifyEmail, resendEmail, requestPasswordReset, resetPassword}