const pool = require("../database/conection")
const {ROLES} = require("../utils/roles")


//controlador para crear empresas, solo los propietarios pueden crear empresas
const createCompany = async(req, res) => {
    const {nombre, email} = req.body //obtenemos nombre y email del front
    const {rol_id} = req.user // obtenemos el ide del rol del token

    if(!nombre){
        return res.status(400).json({error:"Tu empresa debe tener un Nombre"})// comprobamos que no haya campos vacios
    }

    
    try{
        if(Number(rol_id) === ROLES.PROPIETARIO){//comprobamos que el rol que esta intentando crear la empresa sea correcta
            
            const newCompany = await pool.query(
                "INSERT INTO empresas(nombre, email) VALUES($1, $2) RETURNING *",//creamos la nueva empresa con email(opcional) y nombre(obligatorio)
                [nombre, email]
            )

            const now = new Date() 

            await pool.query(
                "INSERT INTO usuarios_empresas(init_date, usuario_id, empresa_id) VALUES($1, $2, $3)",//actualizamos la tabla intermedia 
                [now, req.user.id, newCompany.rows[0].id]
            )

            return res.status(200).json({
                message: "empresa creada correctamente",//devolvemos los datos nuevos
                company:{
                    id:newCompany.rows[0].id,
                    nombre:nombre
                }
            })
        
        }else{
            return res.status(403).json({error: "No tienes permisos"})//manejamos aqui los errores de autenticacion
        }
    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})//manejamos errores del servidor
    }

}


//controlador para ver las empresas de un propietario
const viewCompany = async (req, res) => {
    const {id, rol_id} = req.user//obtenemos el id y el rol del usuario que esta intentando hacer esta peticion

    if(!id || Number(rol_id) !== 1){
        return res.status(403).json({error: "No tienes permisos"})//comprobamos que el usuario tenga permisos pera ver las empresas
    }

    try{
       
        const companys = await pool.query(//obtenemos las empresas que son propiedad el usuario que hace la peticion
            "SELECT empresas.nombre, empresas.id FROM empresas JOIN usuarios_empresas ON usuarios_empresas.empresa_id = empresas.id WHERE usuarios_empresas.usuario_id = $1",
            [id]
        )

        return res.status(200).json({//devolvemos las empresas obtenidas en la consulta
            message: "Datos traidos correctamente",
            companys: companys.rows
        })
    
    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejamos errores del servidor
    }
}

//controlador para modificar empresas
const updateCompany = async(req, res) => {
    const{id, rol_id} = req.user//obtenmos id y rol del usuario desde el token
    const {id_empresa, nombre, email} = req.body//obtenemos datos desde el body de la peticion

    if(Number(rol_id) !== 1 || !id || !id_empresa){
        return res.status(403).json("No tienes Permisos")//comprobamos que los datos que vienen desde el token y desde el body sean correctos
    }

    if(!nombre && !email){
        return res.status(400).json({error: "Faltan datos por rellenar"})//comprobamos que no esten vacios email y nombre al mismo tiempo
    }

    try{
        
        const checkOwner = await pool.query(
            "SELECT * FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de que las empresas pertenezcan al usuario que las quiere modificar
            [id,id_empresa]
        )

        if(checkOwner.rows.length === 0){
            return res.status(403).json({error:"No puedes modificar esta empresa"})//manejo del error que el usuario intenta modificar una empresa que no es suya
        }
            const values = [] //guia para saber los datos que modificara el usuario
            const setParts = []//partes de las consultas que luego si ejecutaran unidas de forma dinamica

            if(nombre){
                values.push(nombre)
                setParts.push(`nombre = $${values.length}`)
            }
            
            if(email){
                values.push(email)
                setParts.push(`email = $${values.length}`)
            }

            values.push(id_empresa)
            const query = `UPDATE empresas SET ${setParts.join(", ")} WHERE id = $${values.length} RETURNING *`//recuperamos valores de los arrays y completamos al consulta
            
            const updatedCompany = await pool.query(query, values)//actualizamos con la query completa, y los valores definidos

            return res.status(200).json({
            message: "Empresa modificada correctamente",//devolvemos los datos modificados
            update: updatedCompany.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejamos errores del servidor
    }
}

//controlador para eliminar una empresa
const deleteCompany = async(req, res) => {
    const {id, rol_id} = req.user//obtencion de datos desde el token
    const {id_empresa} = req.params//obtencion de datos desde la url

    

    if(!id || Number(rol_id) !== 1){
        return res.status(400).json({error: "No tienes permisos"})//comrpobacion de permisos
    }

    if(!id_empresa){
        return res.status(400).json({error: "Faltan campos por rellenar"})//comprobacion de datos existentes en url
    }

    try{

        const checkOwner = await pool.query(
            "SELECT * FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comrpobacion de propiedad del usuario que quiere eliminar
            [id, id_empresa]
        )

        

        if(checkOwner.rows.length === 0){
            return res.status(400).json({error: "No puedes modificar esta empresa"})//el usuario no tiene permisos o propiedad del la empresa que quiere eliminar
        }

        const deletedCompany = await pool.query(
            "DELETE FROM empresas WHERE id = $1 RETURNING *",//consulta para eliminar la empresa definida
            [Number(id_empresa)]
        )

        return res.status(200).json({
            message:"Empresa eliminada correctamente",//devolvemos datos de la empresa eliminada
            empresa: deletedCompany.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejamos errores del servidor
    }
}


module.exports = {createCompany, viewCompany, updateCompany, deleteCompany}