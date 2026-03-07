const pool = require("../database/conection")
const { checkOwnerCompany } = require("../utils/functions")
const { ROLES } = require("../utils/roles")


//controlador para insertar los roles(ya estan predefinidos en la base de datos, en teoria este controlador no se usara nunca)
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

const chanegRole = async (req, res) => {
    const {rol_id, id} = req.user//requester
    const {usuario_id} =req.params//usuadio destino
    const {newRole} = req.body

    if(Number(rol_id) !== ROLES.PROPIETARIO){
        return res.status(403).json({error: "No tienes permisos"})
    }

    try{    
           await checkOwnerCompany(id, usuario_id)//funcion para comprobar relacion de empresa entre requester y usuario
            
            const userExists = await pool.query(
                "SELECT 1 FROM usuarios WHERE id = $1",
                [usuario_id]
            )

            if(userExists.rows.length === 0){
                return res.status(404).json({error: "Este usuario no existe"})
            }

            const updatedRole = await pool.query(
                "UPDATE usuarios SET rol_id = $1 WHERE id = $2 RETURNING nombre, apellidos, rol_id",
                [newRole, usuario_id]
            )

            if(updatedRole.rows.length === 0){
                return res.status(409).json({error: "No se puedo cambiar el rol del usuario"})
            }

            return res.status(200).json({
                message: "Rol de usuario cambiado con exito",
                data: updatedRole.rows[0]
            })
            

        }catch(error){
        console.error(error)
        if(error.message === "SELF_ACTION_NOT_ALLOWED"){
            return res.status(403).json({error: "No puedes cambiar el rol de tu propio usuario"})
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

module.exports = {createRole, chanegRole}