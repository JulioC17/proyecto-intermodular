const pool = require("../database/conection")

const createRole = async (req, res) => {
    const {rol} = req.body

    try{
        if(!rol){
            return res.status(400).json({error: "Rol requerido"})
        }

        const newRole = await pool.query(
            "INSERT INTO roles (rol) VALUES ($1) RETURNING *",
            [rol]
        )

        return res.status(201).json(newRole.rows[0])
    
    }catch (error) {
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})
    }

}

module.exports = {createRole}