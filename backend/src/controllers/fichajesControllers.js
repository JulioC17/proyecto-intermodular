const pool = require("../database/conection")
const {ROLES} = require("../utils/roles")

const createCheckIn = async (req, res) => {
    const {id, rol_id} = req.user

    if(Number(rol_id) === ROLES.PROPIETARIO){
        return res.status(403).json({error: "Eres el propietario, no necesitas fichar"})
    }

    try{

        const selectCompany = await pool.query(
            "SELECT empresa_id FROM usuarios_empresas WHERE usuario_id = $1",
            [id]
        )

        if(selectCompany.rows.length === 0){
            return res.status(404).json({error: "No perteneces a ninguna empresa"})
        }

        const userAlreadyCheckIn = await pool.query(
            "SELECT 1 FROM fichajes WHERE usuario_id = $1 AND hora_inicio IS NOT NULL AND hora_fin IS NULL",
            [id]
        )

        if(userAlreadyCheckIn.rows.length > 0){
            return res.status(409).json({error: "Ya estas fichado"})
        }

        const now = new Date()
        const fecha = now
        const hora = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`

        const checkIn = await pool.query(
            "INSERT INTO fichajes(hora_inicio, fecha, usuario_id, empresa_id) VALUES($1, $2, $3, $4) RETURNING *",
            [hora, fecha, id, selectCompany.rows[0].empresa_id]
        )

        return res.status(200).json({
            message: "Usuario fichado correctamente",
            data: checkIn.rows[0]
        })
    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

const createCheckOut = async(req, res) =>{
    const {id} =req.user

    try{

        const findRegister = await pool.query(
            "SELECT 1 FROM fichajes WHERE usuario_id = $1 AND hora_fin IS NULL",
            [id]
        )

        if(findRegister.rows.length === 0){
            return res.status(409).json({error: "No tienes fichajes abiertos"})
        }

        const now = new Date()
        const hora = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`


        const checkOut = await pool.query(
            "UPDATE fichajes SET hora_fin = $1 WHERE usuario_id = $2 AND hora_fin IS NULL RETURNING *",
            [hora, id]
        )

    return res.status(200).json({
            message: "Has desfichado correctamente",
            data: checkOut.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

const getWorkedTime = async (req, res) =>{
    const {id} = req.user
    const {from, to} = req.query

    try{

        let query = "SELECT * FROM fichajes WHERE usuario_id = $1"
        let values = [id]

        if(from && to){
            query += " AND fecha BETWEEN $2 AND $3"
            values.push(from, to)
        }

        query += " ORDER BY fecha DESC"

        const consultTime = await pool.query(query, values)
        return res.status(200).json({data: consultTime.rows})

    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})
    }
}

const getAllWorkedTime = async (req, res) => {
    const {id, rol_id} =req.user
    const {id_empresa, from, to} = req.query

    if(Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})
    }

    try{

        const getCompanys = await pool.query(
            "SELECT empresa_id FROM usuarios_empresas WHERE usuario_id = $1",
            [id]
        )

        if(getCompanys.rows.length === 0){
            return res.status(404).json({error: "No tienes ninguna empresa"})
        }

        const companyArray = getCompanys.rows.map(c => c.empresa_id)
        
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

        const getWorkedTimeForWorkers = await pool.query(query, values)

        if(getWorkedTimeForWorkers.rows.length === 0){
            return res.status(404).json({error: "No hay datos de ninguna de tus empresas aun"})
        }
        return res.status(200).json({
            data: getWorkedTimeForWorkers.rows
        })

        
    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}


module.exports = {createCheckIn, createCheckOut, getWorkedTime, getAllWorkedTime}