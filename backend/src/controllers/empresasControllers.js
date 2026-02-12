const pool = require("../database/conection")
const {ROLES} = require("../utils/roles")


//controlador para crear empresas, solo los propietarios pueden crear empresas
const createCompany = async(req, res) => {
    const {nombre, email} = req.body
    const {rol_id} = req.user
    console.log(rol_id)

    if(!nombre){
        return res.status(400).json({error:"Tu empresa debe tener un Nombre"})
    }

    
    try{
        if(Number(rol_id) === ROLES.PROPIETARIO){
            
            const newCompany = await pool.query(
                "INSERT INTO empresas(nombre, email) VALUES($1, $2) RETURNING *",
                [nombre, email]
            )

            const now = new Date() 

            await pool.query(
                "INSERT INTO usuarios_empresas(init_date, usuario_id, empresa_id) VALUES($1, $2, $3)",
                [now, req.user.id, newCompany.rows[0].id]
            )

            return res.status(200).json({
                message: "empresa creada correctamente",
                company:{
                    id:newCompany.rows[0].id,
                    nombre:nombre
                }
            })
        
        }else{
            return res.status(403).json({error: "No tienes permisos"})
        }
    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})
    }

}


//controlador para ver las empresas de un propietario
const viewCompany = async (req, res) => {
    const {id, rol_id} = req.user

    if(!id || Number(rol_id) !== 1){
        return res.status(403).json({error: "No tienes permisos"})
    }

    try{
       
        const companys = await pool.query(
            "SELECT empresas.nombre, empresas.id FROM empresas JOIN usuarios_empresas ON usuarios_empresas.empresa_id = empresas.id WHERE usuarios_empresas.usuario_id = $1",
            [id]
        )

        return res.status(200).json({
            message: "Datos traidos correctamente",
            companys: companys.rows
        })
    
    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

//controlador para modificar empresas
const updateCompany = async(req, res) => {
    const{id, rol_id} = req.user
    const {id_empresa, nombre, email} = req.body

    if(Number(rol_id) !== 1 || !id || !id_empresa){
        return res.status(403).json("No tienes Permisos")
    }

    if(!nombre && !email){
        return res.status(400).json({error: "Faltan datos por rellenar"})
    }

    try{
        
        const checkOwner = await pool.query(
            "SELECT * FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
            [id,id_empresa]
        )

        if(checkOwner.rows.length === 0){
            return res.status(403).json({error:"No puedes modificar esta empresa"})
        }
            const values = []
            const setParts = []

            if(nombre){
                values.push(nombre)
                setParts.push(`nombre = $${values.length}`)
            }
            
            if(email){
                values.push(email)
                setParts.push(`email = $${values.length}`)
            }

            values.push(id_empresa)
            const query = `UPDATE empresas SET ${setParts.join(", ")} WHERE id = $${values.length} RETURNING *`
            
            const updatedCompany = await pool.query(query, values)

            return res.status(200).json({
            message: "Empresa modificada correctamente",
            update: updatedCompany.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

//controlador para eliminar una empresa
const deleteCompany = async(req, res) => {
    const {id, rol_id} = req.user
    const {id_empresa} = req.params

    

    if(!id || Number(rol_id) !== 1){
        return res.status(400).json({error: "No tienes permisos"})
    }

    if(!id_empresa){
        return res.status(400).json({error: "Faltan campos por rellenar"})
    }

    try{

        const checkOwner = await pool.query(
            "SELECT * FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
            [id, id_empresa]
        )

        

        if(checkOwner.rows.length === 0){
            return res.status(400).json({error: "No puedes modificar esta empresa"})
        }

        const deletedCompany = await pool.query(
            "DELETE FROM empresas WHERE id = $1 RETURNING *",
            [Number(id_empresa)]
        )

        console.log(deleteCompany)

        return res.status(200).json({
            message:"Empresa eliminada correctamente",
            empresa: deletedCompany.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}


module.exports = {createCompany, viewCompany, updateCompany, deleteCompany}