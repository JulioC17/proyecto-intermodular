const pool = require("../database/conection")
const {ROLES} = require("../utils/roles")
const { checkOwnerCompany } = require("../utils/functions")

//controlador para crear un turno de trabajo
const createShift = async (req, res) => {
    const {id, rol_id} = req.user//ontencion de info del token
    const {nombre, hora_inicio, hora_fin, empresa_id} = req.body//datos de la creacion

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes Permisos"})//comprobacion de permisos
    }

     try{
        const getCompanysOfRequester = await pool.query(
        "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de que el requester pertence a la empresa de destino
        [id, empresa_id]
        )

        if(getCompanysOfRequester.rows.length === 0){
        return res.status(404).json({error: "No puedes hacer cambios en esta empresa"})
        }

        const newShift = await pool.query(
            "INSERT INTO turnos(nombre, hora_inicio, hora_fin, empresa_id) VALUES($1, $2, $3, $4) RETURNING *",//insercion de la informacion en la bbdd
            [nombre, hora_inicio, hora_fin, empresa_id]
        )

        return res.status(201).json({
            message: "Turno creado correctamente",//respuesta todo ok
            turno: newShift.rows[0]
        })
    }catch(error){
    console.error(error)
    return res.status(500).json({error:"Error del servidor"})//manejo de errores
    }
}

//controlador para ver todos los turnos de trabajo
const getShifts = async (req, res) => {
    const {id, rol_id} = req.user//info del token
    const {empresa_id} =req.params

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de permisos
    }

    try{

        const getCompanysOfRequester = await pool.query(
        "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de que el requester pertence a la empresa
        [id, Number(empresa_id)]
        )

        if(getCompanysOfRequester.rows.length === 0){
        return res.status(404).json({error: "No puedes ver datos de esta empresa"})
        }

        const shifts = await pool.query(//consulta de turnos en la bbdd
            "SELECT t.nombre, t.hora_inicio, t.hora_fin, e.nombre AS empresa FROM turnos t JOIN empresas e ON e.id = t.empresa_id WHERE t.empresa_id = $1",
            [Number(empresa_id)]
        )

        if(shifts.rows.length === 0){
            return res.status(404).json({error: "Esta empresa aun no tiene turnos"})//comprobacion de existencia de trunos
        }

        return res.status(200).json({
            turnos: shifts.rows//respuesta todo ok
        })
    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})//manejo de errores
    }

}

//contorlador para modificar un turno
const updateShift = async (req, res) => {
    const {id, rol_id}= req.user//obtencion de info del token
    const {nombre, hora_inicio, hora_fin} =req.body//posibles datos a modificar(pueden venir 1, varios o ninguno)
    const {empresa_id,turno_id} = req.params//empresa y turno a modificar por parametros

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de permisos
    }

    if(!nombre && !hora_fin && !hora_inicio){
        return res.status(200).json({message: "No se hicieron modificaciones"})//comprobaacion de que todos los campos vienen vacios
    }

    try{

        if(hora_inicio > hora_fin){
            return res.status(400).json({error: "Formato incorrecto en la definicion de horas"})//comprobacion de que no se pueda modificar el turno poniendo la hora de fin antes de la hora de inicio
        }

        const checkShift = await pool.query(
            "SELECT 1 FROM turnos WHERE id = $1 AND empresa_id = $2",//comprobacion de existencia del turno
            [Number(turno_id), Number(empresa_id)]
        ) 

        if(checkShift.rows.length === 0){
            return res.status(404).json({error: "El turno elegido no existe"})
        }

        const getCompanysOfRequester = await pool.query(
        "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de pertenencia del usuario y la empresa
        [id, Number(empresa_id)]
        )

        if(getCompanysOfRequester.rows.length === 0){
        return res.status(404).json({error: "No puedes modificar datos de esta empresa"})
        }

        //variables dinamicas para modificar 1 o mas campos
        const values = []
        const setParts = []

        if(nombre){
            values.push(nombre)
            setParts.push(`nombre = $${values.length}`)
        }

        if(hora_inicio){
            values.push(hora_inicio)
            setParts.push(`hora_inicio = $${values.length}`)
        }

        if(hora_fin){
            values.push(hora_fin)
            setParts.push(`hora_fin = $${values.length}`)
        }

        values.push(Number(turno_id))
        const query = `UPDATE turnos SET ${setParts.join(", ")} WHERE id = $${values.length} RETURNING *`
        const shiftUpdated = await pool.query(query, values)//insercion en bbdd

        return res.status(200).json({
            message: "Turno modificado correctamente",//respuest todo ok
            turno: shiftUpdated.rows[0]
        })


    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de errores
    }
}

//controlador para eliminar un turno
const deleteShift = async (req, res) => {
    const {id, rol_id} = req.user//ontencion de info del token
    const {empresa_id, turno_id} = req.params//turno a eliminar en base aa la empresa(por params)

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de permisos
    }

    try{
        const checkShift = await pool.query(
            "SELECT 1 FROM turnos WHERE id = $1 AND empresa_id = $2",//comprobacion de que existencia del turno
            [Number(turno_id), Number(empresa_id)]
        ) 

        if(checkShift.rows.length === 0){
            return res.status(404).json({error: "El turno elegido no existe"})
        }

        const getCompanysOfRequester = await pool.query(
        "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de que el requester pertence a la empresa
        [id, Number(empresa_id)]
        )

        if(getCompanysOfRequester.rows.length === 0){
        return res.status(404).json({error: "No puedes modificar datos de esta empresa"})
        }

        const shiftDeleted = await pool.query(
            "DELETE FROM turnos WHERE id = $1 AND empresa_id = $2 RETURNING *",//eliminacion del turno de la bbd
            [turno_id, empresa_id]
        )

        return res.status(200).json({
            message: "Turno eliminado con exito",//respuesta todo ok
            shift: shiftDeleted.rows[0]
        })
    
    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de errores
    }
}

//asignar un turno a un usuario
const assignShiftToUser = async(req, res) => {
    const {id, rol_id} = req.user//info del token
    const {empresa_id, turno_id} =req.params
    const {usuario_id, fecha}= req.body

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de permisos
    }

    try{

        const checkShift = await pool.query(
            "SELECT 1 FROM turnos WHERE id = $1 AND empresa_id = $2",//comprobacion de la existencia del turno
            [Number(turno_id), Number(empresa_id)]
        ) 

        if(checkShift.rows.length === 0){
            return res.status(404).json({error: "El turno elegido no existe o pertenece a otra empresa"})
        }

         const getCompanysOfRequester = await pool.query(
        "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de pertencencia entree el requester y la empresa
        [id, Number(empresa_id)]
        )

        if(getCompanysOfRequester.rows.length === 0){
        return res.status(404).json({error: "No puedes trabajar con datos de esta empresa"})
        }

        const getCompanyOfUser = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de que el usuario destino pertence a la empresa
            [usuario_id, Number(empresa_id)]
        )

        if(getCompanyOfUser.rows.length === 0){
            return res.status(403).json({error: "El usuario asignado no pertenece a tu empresa"})
        }

        const checkDuplicateDate = await pool.query(
            "SELECT 1 FROM usuarios_turnos WHERE turno_id = $1 AND usuario_id = $2 AND fecha = $3",//comprobacion de que el usuario destino no tiene asignado el mismo turno en la misma fecha
            [Number(turno_id), usuario_id, fecha]
        )

        if(checkDuplicateDate.rows.length >0){
            return res.status(409).json({error: "Este usuario ya tiene asignado este turno, en la misma fecha"})
        }

        const asignedShift = await pool.query(
            "INSERT INTO usuarios_turnos(fecha, usuario_id, turno_id) VALUES($1, $2, $3) RETURNING *",//insercion en la bbdd
            [fecha, usuario_id, Number(turno_id)]
        )

        return res.status(200).json({
            message: "Turno asignado con exito",//respuesta todo ok
            data: asignedShift.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de errores
    }
}

//"desasignar" turno a un usuario
const removeShiftFromUser = async(req, res) => {
    const {id, rol_id} = req.user//info del token
    const {empresa_id, turno_id, usuario_id, fecha} =req.params

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de permisos
    }

    try{

         const checkShift = await pool.query(
            "SELECT 1 FROM turnos WHERE id = $1 AND empresa_id = $2",//comprobacion de pertenencia entre el turno y la empresa
            [Number(turno_id), Number(empresa_id)]
        ) 

        if(checkShift.rows.length === 0){
            return res.status(404).json({error: "El turno elegido no existe o pertenece a otra empresa"})
        }

         const getCompanysOfRequester = await pool.query(
        "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de relacion entre el requester y la empresa
        [id, Number(empresa_id)]
        )

        if(getCompanysOfRequester.rows.length === 0){
        return res.status(404).json({error: "No puedes trabajar con datos de esta empresa"})
        }

        const getCompanyOfUser = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de relacion entre el usaurio destino y la empresa
            [usuario_id, Number(empresa_id)]
        )

        if(getCompanyOfUser.rows.length === 0){
            return res.status(403).json({error: "El usuario asignado no pertenece a tu empresa"})
        }

        const removedShift = await pool.query(
            "DELETE FROM usuarios_turnos WHERE turno_id = $1 AND usuario_id = $2 AND fecha = $3 RETURNING *",//eliminacion del turno del usuario en la bbdd
            [turno_id, usuario_id, fecha]
        )

        if(removedShift.rows.length === 0){
            return res.status(403).json({error: "No hay nada seleccionado para eliminar"})//comprobacion por si no se hubiese eliminado nada
        }

        return res.status(200).json({
            message: "Horario Eliminado con exito del usuario",//respuesta todo ok
            data:removedShift.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de errores
    }
}

//controlador para que el usuario TRABAJDOR pueda consultar sus turnos
const getShiftForUser = async(req, res) => {
    const {id} = req.user//obtencion de info del token
    const {weekStart, weekEnds} = req.query

    try{

        const getSchedule = await pool.query(//obtencion de horarios del usuario
            "SELECT ut.fecha, t.nombre, t.hora_inicio, t.hora_fin FROM usuarios_turnos ut JOIN turnos t ON ut.turno_id = t.id WHERE usuario_id = $1 AND ut.fecha BETWEEN $2 AND $3",
            [id, weekStart, weekEnds]
        )

        if(getSchedule.rows.length === 0){
            return res.status(404).json({error: "No tienes horarios asignados"})//comprobacion por si el usuario no tiene horarios asignaados
        }

        return res.status(200).json({
            message:"Horario recuperado con exito",//respusta todo ok
            schedule:getSchedule.rows})

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de errores
    }
}

const getShiftsForAdmins = async (req, res) => {
    const {rol_id, id} = req.user
    const {weekStart, weekEnds} = req.query
    const {empresa_id} = req.params

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de permisos
    }

    try{

        const getCompanysOfRequester = await pool.query(
        "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de pertencencia entree el requester y la empresa
        [id, Number(empresa_id)]
        )

        if(getCompanysOfRequester.rows.length === 0){
        return res.status(404).json({error: "No puedes trabajar con datos de esta empresa"})
        }

        const watchSchedule = await pool.query(
            "SELECT u.nombre, u.apellidos, t.nombre AS turno, t.hora_inicio, t.hora_fin, e.nombre AS empresa, ut.fecha FROM turnos t JOIN empresas e ON e.id = t.empresa_id JOIN usuarios_turnos ut ON t.id = ut.turno_id JOIN usuarios u ON ut.usuario_id = u.id WHERE t.empresa_id = $1 AND ut.fecha BETWEEN $2 AND $3 ORDER BY ut.fecha ASC",
            [Number(empresa_id), weekStart, weekEnds]
        )

        if(watchSchedule.rows.length === 0){
            return res.status(200).json({
                message:"No hay datos",
                data:[]
            })
        }

        return res.status(200).json({
            message:"Horario Recuperado con éxito",
            data: watchSchedule.rows
        })


    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del Servidor"})
    }

}

module.exports = {createShift, getShifts, updateShift, deleteShift, assignShiftToUser, removeShiftFromUser, getShiftForUser, getShiftsForAdmins}