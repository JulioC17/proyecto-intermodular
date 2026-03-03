const pool = require("../database/conection")
const {ROLES} = require("../utils/roles")

const createRequestOfHollidays = async (req, res) => {
    const {id} =req.user
    const {fecha_inicio, fecha_fin,} = req.body

    const thisMoment = new Date()

     try{

        const findSameHollidays = await pool.query(
            "SELECT 1 FROM vacaciones WHERE usuario_id = $1 AND estado = $2 AND fecha_inicio <= $4 AND fecha_fin >= $3",
            [id, true, fecha_inicio, fecha_fin]
        )

        if (findSameHollidays.rows.length > 0){
            return res.status(409).json({error: "Ya tienes vacaciones aprobadas en/durante las fechas seleccionadas"})
        }

        const createHollidays = await pool.query(
        "INSERT INTO vacaciones(fecha_inicio, fecha_fin, usuario_id, fecha_solicitud) VALUES($1, $2, $3, $4) RETURNING *",
        [fecha_inicio, fecha_fin, id, thisMoment]
    )

    return res.status(201).json({
        message:"Solicitud creada correctamente",
        data:createHollidays.rows[0]
    })
    }catch(error){
    console.error(error)
    return res.status(500).json({error: "Error del servidor"})
    }
}

const getProfileHollidays = async (req, res) => {
    const {id} =req.user

    
    try{const getHollidays = await pool.query(
        "SELECT * FROM vacaciones WHERE usuario_id = $1 ORDER BY fecha_inicio",
        [id]
    )

    if(getHollidays.rows.length === 0){
        return res.status(404).json({error: "No tienes registro de vacaciones"})
    }

    return res.status(200).json({
        data: getHollidays.rows
    })
}catch(error){
    console.error(error)
    return res.status(500).json({error: "Error del servidor"})
}
}

const getHollidaysForAdminsAndOwners = async (req, res) => {
    const {id, rol_id} = req.user

    if(Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})
    }

    try{
        const companysRows = await pool.query(
            "SELECT empresa_id FROM usuarios_empresas WHERE usuario_id = $1",
            [id]
        )

        if(companysRows.rows.length === 0){
            return res.status(403).json({error: "No tienes o perteneces a ninguna empresa"})//comprobacion de que el usuario pertence a alguna empresa
        }

        const companysID = companysRows.rows.map(ci => ci.empresa_id)

        const getAllHollidays = await pool.query(
            "SELECT v.fecha_inicio, v.fecha_fin, v.estado, v.fecha_solicitud, u.nombre, e.nombre AS empresa FROM vacaciones v JOIN usuarios u ON u.id = v.usuario_id JOIN usuarios_empresas ue ON ue.usuario_id = u.id JOIN empresas e ON e.id = ue.empresa_id WHERE e.id = ANY($1) ORDER by v.fecha_inicio",
            [companysID]
        )

        return res.status(200).json({
            data:getAllHollidays.rows
        })


    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

const handdleHollidays = async (req, res) => {
    const {id, rol_id} = req.user
    const {vacaciones_id} = req.params
    const{estado} = req.body

    if(Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})
    }

    try{

        const companysRows = await pool.query(
            "SELECT empresa_id FROM usuarios_empresas WHERE usuario_id = $1",
            [id]
        )

        if(companysRows.rows.length === 0){
            return res.status(403).json({error: "No tienes o perteneces a ninguna empresa"})//comprobacion de que el usuario pertence a alguna empresa
        }

        const companysID = companysRows.rows.map(ci => ci.empresa_id)

        const checkOwnerWorkersParty = await pool.query(
            "SELECT 1 FROM usuarios_empresas JOIN usuarios ON usuarios_empresas.usuario_id = usuarios.id JOIN vacaciones ON vacaciones.usuario_id = usuarios.id WHERE usuarios_empresas.empresa_id = ANY($1) AND vacaciones.id = $2 AND vacaciones.estado IS NULL",
            [companysID, vacaciones_id]
        )

        if(checkOwnerWorkersParty.rows.length === 0){
            return res.status(403).json({error: "El usuario no tiene vacaciones pendientes"})
        }

        const updateHollidays = await pool.query(
            "UPDATE vacaciones SET estado = $1 WHERE id = $2",
            [estado, vacaciones_id]
        )

        return res.status(200).json({
            message: "Vacaciones modificadas correctamente"
        })


    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

module.exports = {createRequestOfHollidays, getProfileHollidays, getHollidaysForAdminsAndOwners, handdleHollidays}