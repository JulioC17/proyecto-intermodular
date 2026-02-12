const jwt = require("jsonwebtoken")

const isAuth = (req, res, next) => {
    const authHeader = req.headers.authorization

    if(!authHeader){
        return res.status(401).json({
            error:"No hay token"
        })
    }

    const token = authHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({error: "tokenn mal formado"})
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = {
            id: decoded.id,
            rol_id:decoded.rol_id
        }
        next()
    }catch(err){
        console.error(err)
        return res.status(401).json({error: "Token invalido o expirado"})
    }
}

module.exports = isAuth