const pool = require("../database/conection")
const {ROLES} = require("../utils/roles")


//controlador para la creacion de solicitud de vaacaciones
const createRequestOfHollidays = async (req, res) => {
    const {id} =req.user//info del token
    const {fecha_inicio, fecha_fin,} = req.body

    const thisMoment = new Date()

     try{

        const findSameHollidays = await pool.query(
            "SELECT 1 FROM vacaciones WHERE usuario_id = $1 AND estado = $2 AND fecha_inicio <= $4 AND fecha_fin >= $3",//comprobacion de solapamiento de fechas de vacaciones aprobadas
            [id, true, fecha_inicio, fecha_fin]
        )

        if (findSameHollidays.rows.length > 0){
            return res.status(409).json({error: "Ya tienes vacaciones aprobadas en/durante las fechas seleccionadas"})
        }

        const createHollidays = await pool.query(
        "INSERT INTO vacaciones(fecha_inicio, fecha_fin, usuario_id, fecha_solicitud) VALUES($1, $2, $3, $4) RETURNING *",//insercion de la solicitud en la bbdd
        [fecha_inicio, fecha_fin, id, thisMoment]
    )

    return res.status(201).json({
        message:"Solicitud creada correctamente",//respuesta todo ok
        data:createHollidays.rows[0]
    })
    }catch(error){
    console.error(error)
    return res.status(500).json({error: "Error del servidor"})//manejo de errores
    }
}

//controlador para ver solicitudes pendientes personales de los usuarios
const getProfileHollidays = async (req, res) => {
    const {id} =req.user//info del token

    
    try{
        const getHollidays = await pool.query(
        "SELECT v.id, v.fecha_inicio, v.fecha_fin, v.estado, u.nombre, u.apellidos FROM vacaciones v JOIN usuarios u ON u.id = v.usuario_id WHERE usuario_id = $1 ORDER BY fecha_inicio",//consulta en la bbdd
        [id]
    )

    if(getHollidays.rows.length === 0){
        return res.status(404).json({error: "No tienes registro de vacaciones"})//manjeo de inexistencia en la bbdd
    }

    return res.status(200).json({
        data: getHollidays.rows//todo ok
    })
}catch(error){
    console.error(error)
    return res.status(500).json({error: "Error del servidor"})//manejo de errores
}
}

//controlador paara ver todas las solicitudes de vacaciones de los trabajdores
const getHollidaysForAdminsAndOwners = async (req, res) => {
    const {id, rol_id} = req.user//obtencion de daatos del token

    if(Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de permisos
    }

    try{
        const companysRows = await pool.query(
            "SELECT empresa_id FROM usuarios_empresas WHERE usuario_id = $1",//comprobacion de que el requester pertence a alguna empresa
            [id]
        )

        if(companysRows.rows.length === 0){
            return res.status(403).json({error: "No tienes o perteneces a ninguna empresa de que el usuario"})
        }

        const companysID = companysRows.rows.map(ci => ci.empresa_id)//manejo de vaarias empresas mediante un bucle

        const getAllHollidays = await pool.query(
            "SELECT v.id, v.fecha_inicio, v.fecha_fin, v.estado, v.fecha_solicitud, u.nombre, u.apellidos, e.nombre AS empresa FROM vacaciones v JOIN usuarios u ON u.id = v.usuario_id JOIN usuarios_empresas ue ON ue.usuario_id = u.id JOIN empresas e ON e.id = ue.empresa_id WHERE e.id = ANY($1) ORDER by v.fecha_inicio",//consulta en la bbdd
            [companysID]
        )

        return res.status(200).json({
            data:getAllHollidays.rows//todo ok
        })


    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de errores
    }
}

//controlador para aprobar o denegar solicitudes
const handdleHollidays = async (req, res) => {
    const {id, rol_id} = req.user//info del token
    const {vacaciones_id} = req.params
    const{estado} = req.body

    if(Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})
    }

    try{

        const companysRows = await pool.query(
            "SELECT empresa_id FROM usuarios_empresas WHERE usuario_id = $1",//extraccion de todas las empresas del requester
            [id]
        )

        if(companysRows.rows.length === 0){
            return res.status(403).json({error: "No tienes o perteneces a ninguna empresa"})
        }

        const companysID = companysRows.rows.map(ci => ci.empresa_id)//bucle para aislar las empresas del requester en caso de ser mas de 1

        const checkOwnerWorkersParty = await pool.query(
            "SELECT 1 FROM usuarios_empresas JOIN usuarios ON usuarios_empresas.usuario_id = usuarios.id JOIN vacaciones ON vacaciones.usuario_id = usuarios.id WHERE usuarios_empresas.empresa_id = ANY($1) AND vacaciones.id = $2 AND vacaciones.estado IS NULL",
            [companysID, vacaciones_id]//extraccion del id de las vacaciones en base a las empresas del requester y en base a su estado
        )

        if(checkOwnerWorkersParty.rows.length === 0){
            return res.status(403).json({error: "El usuario no tiene vacaciones pendientes"})
        }

        if(estado === true){

            const hollidays = await pool.query(
            "SELECT * FROM vacaciones WHERE id = $1",
            [vacaciones_id]
        )

        const checkSameHollidays = await pool.query(
            "SELECT 1 FROM vacaciones WHERE fecha_inicio <= $1 AND fecha_fin >= $2 AND usuario_id = $3 AND estado = $4",
            [hollidays.rows[0].fecha_fin, hollidays.rows[0].fecha_inicio, hollidays.rows[0].usuario_id, true]
        )

        if(checkSameHollidays.rows.length > 0){
            return res.status(409).json({error:"El usuario ya tiene vacaciones aprobadas durante estas fechas"})
        }}

        const updateHollidays = await pool.query(
            "UPDATE vacaciones SET estado = $1 WHERE id = $2",//cambio de estado de las vacaciones
            [estado, vacaciones_id]
        )

        return res.status(200).json({
            message: "Vacaciones modificadas correctamente"//todo ok
        })


    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de errores
    }
}

module.exports = {createRequestOfHollidays, getProfileHollidays, getHollidaysForAdminsAndOwners, handdleHollidays}