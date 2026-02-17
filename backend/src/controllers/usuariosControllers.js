const pool = require("../database/conection")
const generator = require("generate-password")
const bcrypt = require("bcryptjs")
const sgMail = require("@sendgrid/mail")

const createUser = async(req, res) => {
    const {id, rol_id} = req.user
    const {nombre, apellidos, email, id_empresa} = req.body
         
    if(!id || Number(rol_id) == 3){
        return res.status(403).json({error: "No tienes permisos"})
    }

    if(!nombre || !apellidos || !email || !id_empresa){
        return res.status(400).json({error:"Faltan campos por rellenar"})
    }

    const emailNormalized = email.toLowerCase().trim()

    try{

        const findUser = await pool.query(
            "SELECT id FROM usuarios WHERE email = $1",
            [emailNormalized]
        )

        if(findUser.rows.length > 0){
            return res.status(400).json({error:"Este usuario ya existe"})
        }

    const checkOwnerCompany = await pool.query(
        "SELECT id FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
        [id, id_empresa]
    )

    if(checkOwnerCompany.rows.length === 0){
        return res.status(403).json({error: "No tienes permisos"})
    }

        const randomPassword = generator.generate({
            length:12,
            numbers:true,
            symbols:true,
            uppercase:true,
            lowercase:true,
            strict:true
        })
        const salt = await bcrypt.genSalt(10)
        const randomPasswordHashed = await bcrypt.hash(randomPassword, salt)

        

        const newUser = await pool.query(
            "INSERT INTO usuarios (nombre, apellidos, email, password, verified, rol_id, password_changed) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [nombre, apellidos, emailNormalized, randomPasswordHashed, true, 3, false]
        )

        const date = new Date()

        const AsignedCompany = await pool.query(
            "INSERT INTO usuarios_empresas (usuario_id, empresa_id, init_date) VALUES ($1, $2, $3)",
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
        
            await sgMail.send(msg)

            return res.status(200).json({
                message: "Usuario creado correctamente",
                nombre:nombre,
                email: emailNormalized,
                id_empresa: id_empresa
            })

    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})
    }

}

const firstLogin = async (req, res) => {
    const {id, firstLogin} = req.user
    const {newPassword} = req.body

    if(!id || firstLogin == false){
        return res.status(400).json({error: "Ya ha sido reestablecida su contraseña por primera vez o el token ha expirado"})
    }
    
    if(!newPassword){
        return res.status(400).json({error: "Debes establecer una nueva contraseña"})

    }

    try{
        
        const salt = await bcrypt.genSalt(10)
        const passwordHashed = await bcrypt.hash(newPassword, salt)

        await pool.query(
            "UPDATE usuarios SET password = $1, password_changed = $2 WHERE id = $3",
            [passwordHashed,true,id]
        )

        return res.status(200).json({
            message:"Contraseña reestablecida correctamente"
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

module.exports = {createUser, firstLogin}