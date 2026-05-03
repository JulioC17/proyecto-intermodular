const pool = require("../database/conection")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const transporter = {
    sendMail: async (msg) => {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: {email: msg.from, name: "HOSTECH"},
                to: [{email: msg.to}],
                subject: msg.subject,
                htmlContent:msg.html
            })
        })
        if(!response.ok){
            const errorText = await response.text()
            console.error("Error de la Api Brevo", errorText)
            throw new Error("No se pudo enviar el correo")
        }

        return true
    }
}

//controlador para el registro de usuarios, el registro solo sera para "propietarios"
const register = async(req, res) => {
    const {usuario, empresa} = req.body
    const {nombre, apellidos, email, password, dni, telefono, sueldo} = usuario
    const {nombre: empresaNombre, email:empresaEmail} = empresa //seleccion de lo que  envia el front
    
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

    await pool.query("BEGIN")

    const newUser = await pool.query(//insertamos todos los datos en la bbdd
        "INSERT INTO usuarios (nombre, apellidos, email, password, verification_code, code_expire_at, rol_id, password_changed, dni, telefono, sueldo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id",
        [nombre, apellidos, normalizedEmail, hashedPassword, verificationCode, expiry, 1, true, dni, telefono, sueldo]
    )

    const newCompany = await pool.query(
        "INSERT INTO empresas(nombre, email) VALUES ($1, $2) RETURNING id",
        [empresaNombre, empresaEmail || null]
    )

    const date = new Date()
    await pool.query(
        "INSERT INTO usuarios_empresas(usuario_id, empresa_id, init_date) VALUES($1, $2, $3)",
        [newUser.rows[0].id, newCompany.rows[0].id, date]
    )

    await pool.query("COMMIT")

    const emailHtml = `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <!-- Contenido principal -->
        <div style="padding: 40px;">
            <h1 style="color: #0072FF; font-size: 24px; margin-bottom: 20px;">¡Bienvenido a la familia, ${nombre}!</h1>
            
            <p style="font-size: 16px; color: #555;">
                Estamos encantados de tenerte con nosotros. Tu empresa <strong>"${empresaNombre}"</strong> ya está casi lista para empezar a optimizar sus turnos y fichajes.
            </p>
            <div style="margin: 35px 0; padding: 25px; background-color: #f0f7ff; border-radius: 8px; text-align: center; border: 1px dashed #0072FF;">
                <p style="margin: 0; font-size: 14px; color: #0072FF; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Tu código de verificación</p>
                <h2 style="margin: 10px 0 0; font-size: 42px; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center;">
                Introduce este código en la aplicación para activar tu cuenta de propietario.
            </p>
        </div>
        <!-- Footer estilizado tipo Header (Azul Degradado) -->
        <div style="background: linear-gradient(135deg, #0072FF 0%, #00C6FF 100%); padding: 30px; text-align: center;">
            <p style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 3px; font-family: 'Arial Black', sans-serif;">HOSTECH</p>
            <p style="margin: 5px 0 0; color: rgba(255,255,255,0.8); font-size: 12px; letter-spacing: 1px;">Innovando en la gestión hostelera</p>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #aaa;">
        © 2026 Hostech. Todos los derechos reservados.
    </div>
</div>
`

    const msg = {//creamos email con codigo de verificacion
        to:normalizedEmail,
        from: "juliocsreyes94@gmail.com",
        subject: "Activa tu cuenta HOSTECH",
        html: emailHtml,
    }

    try {
        await transporter.sendMail(msg)//enviamos email con el codigo
    } catch (mailError) {
        console.error("Error al enviar el email de verificación:", mailError.response?.body || mailError);
        // No lanzamos el error para que el registro de la DB se mantenga
    }

    return res.status(201).json({message:"Usuario creado correctamente, revise su email para verificar"})//confirmamos que todo salio ok

   
    }catch(error){
        await pool.query("ROLLBACK")
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})//manejo de errores ajenos al cliente
    }
}


//controlador de login
const login = async(req, res) => {//extraemos email y password de la peticion
    const {email, password} = req.body

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

         if (user.rows[0].rol_id === 3) {
            const companyCheck = await pool.query(
                "SELECT e.is_active FROM empresas e JOIN usuarios_empresas ue ON e.id = ue.empresa_id WHERE ue.usuario_id = $1",
                [user.rows[0].id]
            );
            if (companyCheck.rows.length === 0 || companyCheck.rows[0].is_active === false) {
                return res.status(403).json({ error: "Tu empresa no está activa. Contacta con tu administrador." });
            }
        }

        const token = jwt.sign(
            {
                id:user.rows[0].id, 
                rol_id: user.rows[0].rol_id, 
                nombre: user.rows[0].nombre,
                firstLogin:false
            },
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        )

        return res.status(200).json({//devolvemos token y datos relevantes pero no sensibles
            message: "Login correcto",
            token,
            user:{
                id: user.rows[0].id,
                nombre: user.rows[0].nombre,
                apellidos: user.rows[0].apellidos,
                email: user.rows[0].email,
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

    const normalizedEmail = email.toLowerCase().trim()

    try{
    const user = await pool.query(//buscamos al usuario en base a las coincidencias(email, codigo y estado)
        "SELECT * FROM usuarios WHERE email = $1 AND verification_code = $2 AND verified = false",
        [normalizedEmail, verificationCode]
    )

    if(user.rows.length == 0){
        return res.status(401).json({error: "Codigo invalido o expirado"})//comprobacion de que la consulta encuentre datos coincidentes
    }

    const now = new Date()

    if(now > user.rows[0].code_expire_at){
        return res.status(401).json({error: "Codigo invalido o expirado"})//comprobacion de que no ha expirado el codigo
    }

    await pool.query(
        "UPDATE usuarios SET verified=true, verification_code = NULL, code_expire_at = NULL  WHERE email = $1",//actualizamod el estado de verificacion, y limpiamos campos innecesarios
        [normalizedEmail]
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

    const normalizedEmail = email.toLowerCase().trim()

    try{

        const user = await pool.query(//buscamos usuarios coincidentes con estos campos en la bbdd
            "SELECT * FROM usuarios WHERE email = $1 AND verified = false",
            [normalizedEmail]
        )

        if(user.rows.length == 0){
            return res.status(400).json({error: "Usuario incorrecto o ya verificado"})//usuario inexistente
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000)//creacion de codigo nuevo de verificacion
        const now = new Date()
        const expiry = new Date(now.getTime() + 15 * 60000)//creacion de nueva fecha de expiracion

        await pool.query(
            "UPDATE usuarios SET verification_code = $1, code_expire_at = $2 WHERE email = $3",//insercion en bbdd de los nuevos datos
            [verificationCode, expiry, normalizedEmail]
        )

        const resendHtml = `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <div style="padding: 40px;">
            <h1 style="color: #0072FF; font-size: 24px; margin-bottom: 20px;">Tu nuevo código de acceso</h1>
            
            <p style="font-size: 16px; color: #555;">
                Hola de nuevo. Has solicitado un nuevo código de verificación para tu cuenta en <strong>HOSTECH</strong>.
            </p>
            <div style="margin: 35px 0; padding: 25px; background-color: #f0f7ff; border-radius: 8px; text-align: center; border: 1px dashed #0072FF;">
                <p style="margin: 0; font-size: 14px; color: #0072FF; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Código de Verificación Actualizado</p>
                <h2 style="margin: 10px 0 0; font-size: 42px; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center;">
                Recuerda que este código caduca en 15 minutos por motivos de seguridad. 🛡️
            </p>
        </div>
        <div style="background: linear-gradient(135deg, #0072FF 0%, #00C6FF 100%); padding: 30px; text-align: center;">
            <p style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 3px; font-family: 'Arial Black', sans-serif;">HOSTECH</p>
        </div>
    </div>
</div>
`

        const msg = {//creamos email con el nuevo codigo de verificacion
        to:normalizedEmail,
        from: "juliocsreyes94@gmail.com",
        subject: "Su Nuevo Código de Verificación",
        html: resendHtml
    }

        await transporter.sendMail(msg)//reenviamos email con el codigo

        return res.status(200).json({message: "Ha sido enviado un nuevo codigo de verificacion"})//todo ok 
        

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de errores del servidor
    }
}


//controlador para pedir resetear el password
const requestPasswordReset = async (req, res) => {
    const {email} = req.body//extraccion del mail de la req

    const normalizedEmail = email.toLowerCase().trim()

     try{

        const user = await pool.query(
            "SELECT id FROM usuarios WHERE email = $1",//busqueda de coincidencias en la bbdd
            [normalizedEmail]
        )

        if(user.rows.length == 0){
            return res.status(200).json({message: "Si existe este email, se enviara un codigo"})//usuario no existe
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000)//creacion  codigo nuevo de verificacion
        const now = new Date()
        const expiry = new Date(now.getTime() + 15 * 60000)//creacion de  fecha de expiracion

        await pool.query(
            "UPDATE usuarios SET verification_code = $1, code_expire_at = $2 WHERE email = $3",//insercion de los datos en la bbdd
            [verificationCode, expiry, normalizedEmail]
        )

        const resetHtml = `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <div style="padding: 40px;">
            <h1 style="color: #FF4B2B; font-size: 24px; margin-bottom: 20px;">Recuperación de Contraseña</h1>
            
            <p style="font-size: 16px; color: #555;">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>HOSTECH</strong>.
            </p>
            <div style="margin: 35px 0; padding: 25px; background-color: #fff5f2; border-radius: 8px; text-align: center; border: 1px dashed #FF4B2B;">
                <p style="margin: 0; font-size: 14px; color: #FF4B2B; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Tu Código de Recuperación</p>
                <h2 style="margin: 10px 0 0; font-size: 42px; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center;">
                Si no has solicitado este cambio, puedes ignorar este correo con total seguridad.
            </p>
        </div>
        <div style="background: linear-gradient(135deg, #FF4B2B 0%, #FF8C00 100%); padding: 30px; text-align: center;">
            <p style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 3px; font-family: 'Arial Black', sans-serif;">HOSTECH</p>
        </div>
    </div>
</div>
`

        const msg = {//creamos email con el  codigo de recuperacion
        to:normalizedEmail,
        from: "juliocsreyes94@gmail.com",
        subject: "Su Código de Recuperación",
        html: resetHtml
        
        }

        await transporter.sendMail(msg)//enviamos email con el codigo

        return res.status(200).json({message: "Mensaje de recuperacion enviado"})//todo ok

    }catch(error){
        console.error(error)
        return res.status(400).json({error: "Error del servidor"})//manejo de errores del server
    }
}


//controlador para resetear el password
const resetPassword = async(req, res) => {
    const {email, newPassword, recoveryCode} = req.body//extraccion de datos necesarios de la request

    const normalizedEmail = email.toLowerCase().trim()
    try{
    const user = await pool.query(
        "SELECT * FROM usuarios WHERE email = $1 AND verification_code = $2",//busqueda del usuario coincidente
        [normalizedEmail, recoveryCode]
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
        [hashedNewPassword, normalizedEmail]
    )
    

    return res.status(200).json({message: "Cuenta recuperada con exito"})//ok
    }catch(error){
        console.error(error)
       return res.status(500).json({error: "Error del servidor"})//manejo de errores del server
    }
}


module.exports = {register, login, verifyEmail, resendEmail, requestPasswordReset, resetPassword}