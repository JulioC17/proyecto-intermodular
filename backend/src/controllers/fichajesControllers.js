const pool = require("../database/conection")
const {ROLES} = require("../utils/roles")

//Controlador para creacion de fichaje
const createCheckIn = async (req, res) => {
    const {id, rol_id} = req.user//extraemos informacion del token

    if(Number(rol_id) === ROLES.PROPIETARIO){
        return res.status(403).json({error: "Eres el propietario, no necesitas fichar"})//comprobacion de permisos
    }

    try{

        const selectCompany = await pool.query(
            "SELECT empresa_id FROM usuarios_empresas WHERE usuario_id = $1",//comprobacion que el usuario pertence a la empresa en la que quiere fichar
            [id]
        )

        if(selectCompany.rows.length === 0){
            return res.status(404).json({error: "No perteneces a ninguna empresa"})
        }

        const userAlreadyCheckIn = await pool.query(
            "SELECT 1 FROM fichajes WHERE usuario_id = $1 AND hora_inicio IS NOT NULL AND hora_fin IS NULL",//comprobamos que no existan fichajes abiertos
            [id]
        )

        if(userAlreadyCheckIn.rows.length > 0){
            return res.status(409).json({error: "Ya estas fichado"})
        }

        const now = new Date()//nueva fecha para insertar en la base de datos
        const fecha = now
        const hora = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`//formateo de hora para insertar como horaa de entrada

        const checkIn = await pool.query(
            "INSERT INTO fichajes(hora_inicio, fecha, usuario_id, empresa_id) VALUES($1, $2, $3, $4) RETURNING *",//insercion en bbdd
            [hora, fecha, id, selectCompany.rows[0].empresa_id]
        )

        return res.status(200).json({
            message: "Usuario fichado correctamente",//respuesta de todo ok
            data: checkIn.rows[0]
        })
    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de errores
    }
}

//controlador para creacion de desfichaje
const createCheckOut = async(req, res) =>{
    const {id} =req.user//sacamos info del token

    try{

        const findRegister = await pool.query(
            "SELECT 1 FROM fichajes WHERE usuario_id = $1 AND hora_fin IS NULL",//buscamos usuario que quiere desfichar en base a que exista y la hora de salida este vacia
            [id]
        )

        if(findRegister.rows.length === 0){
            return res.status(409).json({error: "No tienes fichajes abiertos"})
        }

        const now = new Date()
        const hora = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`//formateamos hora para insertar su hora de salida


        const checkOut = await pool.query(
            "UPDATE fichajes SET hora_fin = $1 WHERE usuario_id = $2 AND hora_fin IS NULL RETURNING *",//actualizamos bbdd
            [hora, id]
        )

    return res.status(200).json({
            message: "Has desfichado correctamente",//respuestaa todo ok
            data: checkOut.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de errores
    }
}

//crontolador para obtener horas personales de trabajo
const getWorkedTime = async (req, res) =>{
    const {id} = req.user//obtenemos info del token
    const {from, to} = req.query//query dinamica para obtener un periodo concreto(puede estar o no)

    try{

        //variables dinamicas para hacer el GET en base a que vengaan en la request o no
        let query = "SELECT * FROM fichajes WHERE usuario_id = $1"
        let values = [id]

        if(from && to){
            query += " AND fecha BETWEEN $2 AND $3"
            values.push(from, to)
        }

        query += " ORDER BY fecha DESC"

        const consultTime = await pool.query(query, values)//consultaa a la bbdd
        return res.status(200).json({data: consultTime.rows})//respuesta todo ok

    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})//manejo de errores
    }
}

//controlador para la obtencion de horas de trabajo de todos los usuarios
const getAllWorkedTime = async (req, res) => {
    const {id, rol_id} =req.user//info del token
    const {id_empresa, from, to} = req.query//query dinamica en base a la empresa, y periodo de tiempo(puede venir o no)

    if(Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de permisos
    }

    try{

        const getCompanys = await pool.query(
            "SELECT empresa_id FROM usuarios_empresas WHERE usuario_id = $1",//comprobacion de que el requester pertenece a la empresa de la que quiere obtener la info
            [id]
        )

        if(getCompanys.rows.length === 0){
            return res.status(404).json({error: "No tienes ninguna empresa"})
        }

        const companyArray = getCompanys.rows.map(c => c.empresa_id)//bucle para aislar IDs si el requester tiene mas de una empresa
        
        //manejo de las queries dinamicas en caso de que vengan proporcionadas en la request
        let query = "SELECT * FROM fichajes"
        let values = [companyArray]
        let countPlaceholders = 1
        
        if(id_empresa){ 

            const checkCompany = await pool.query(
                "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
                [id, id_empresa]
            )

            if(checkCompany.rows.length === 0){
                return res.status(403).json({error: "No puedes ver datos de esta empresa"})
            }

            query += ` WHERE empresa_id = $${countPlaceholders}`
            values = []
            values.push(id_empresa)
            countPlaceholders++
        }else{
            query += ` WHERE empresa_id = ANY($${countPlaceholders})`
        }

        if(from && to){
            query += ` AND fecha BETWEEN $${countPlaceholders} AND $${countPlaceholders + 1}`
            values.push(from, to)
            countPlaceholders +=2
        }

        query += " ORDER BY fecha DESC"

        const getWorkedTimeForWorkers = await pool.query(query, values)//insercion en bbdd

        if(getWorkedTimeForWorkers.rows.length === 0){
            return res.status(404).json({error: "No hay datos de ninguna de tus empresas aun"})//manejo de que no existan datos
        }
        return res.status(200).json({
            data: getWorkedTimeForWorkers.rows//respesuta todo ok
        })

        
    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//maenjo de errores
    }
}

const getActualTimeOfWork = async (req, res) => {
    const {id} = req.user//obtenemos info del token

    try{

        const consultTime = await pool.query(
            "SELECT * FROM fichajes WHERE usuario_id = $1 AND hora_fin IS NULL", 
            [id])//consultaa a la bbdd

        return res.status(200).json({data: consultTime.rows[0] || null})//respuesta todo ok

    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})//manejo de errores
    }
}

const getLastWorkedTIme = async (req, res) => {
    const {id} = req.user//obtenemos info del token

    try{

        const consultTime = await pool.query(
            "SELECT * FROM fichajes WHERE usuario_id = $1 AND hora_fin IS NOT NULL ORDER BY fecha DESC LIMIT 5", 
            [id])//consultaa a la bbdd

        return res.status(200).json({data: consultTime.rows})//respuesta todo ok

    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})//manejo de errores
    }
}


module.exports = {createCheckIn, createCheckOut, getWorkedTime, getAllWorkedTime, getActualTimeOfWork, getLastWorkedTIme}