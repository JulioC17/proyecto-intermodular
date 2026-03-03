const pool = require("../database/conection")
const {ROLES} = require("../utils/roles")
const { checkOwnerCompany } = require("../utils/functions")

const createShift = async (req, res) => {
    const {id, rol_id} = req.user
    const {nombre, hora_inicio, hora_fin, empresa_id} = req.body

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes Permisos"})
    }

     try{
        const getCompanysOfRequester = await pool.query(
        "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
        [id, empresa_id]
        )

        if(getCompanysOfRequester.rows.length === 0){
        return res.status(404).json({error: "No puedes hacer cambios en esta empresa"})
        }

        const newShift = await pool.query(
            "INSERT INTO turnos(nombre, hora_inicio, hora_fin, empresa_id) VALUES($1, $2, $3, $4) RETURNING *",
            [nombre, hora_inicio, hora_fin, empresa_id]
        )

        return res.status(201).json({
            message: "Turno creado correctamente",
            turno: newShift.rows[0]
        })
    }catch(error){
    console.error(error)
    return res.status(500).json({error:"Error del servidor"})
    }
}

const getShifts = async (req, res) => {
    const {id, rol_id} = req.user
    const {empresa_id} =req.params

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})
    }

    try{

        const getCompanysOfRequester = await pool.query(
        "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
        [id, Number(empresa_id)]
        )

        if(getCompanysOfRequester.rows.length === 0){
        return res.status(404).json({error: "No puedes ver datos de esta empresa"})
        }

        const shifts = await pool.query(
            "SELECT t.nombre, t.hora_inicio, t.hora_fin, e.nombre AS empresa FROM turnos t JOIN empresas e ON e.id = t.empresa_id WHERE t.empresa_id = $1",
            [Number(empresa_id)]
        )

        if(shifts.rows.length === 0){
            return res.status(404).json({error: "Esta empresa aun no tiene turnos"})
        }

        return res.status(200).json({
            turnos: shifts.rows
        })
    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})
    }

}

const updateShift = async (req, res) => {
    const {id, rol_id}= req.user
    const {nombre, hora_inicio, hora_fin} =req.body
    const {empresa_id,turno_id} = req.params

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})
    }

    if(!nombre && !hora_fin && !hora_inicio){
        return res.status(200).json({message: "No se hicieron modificaciones"})
    }

    try{

        if(hora_inicio > hora_fin){
            return res.status(400).json({error: "Formato incorrecto en la definicion de horas"})
        }

        const checkShift = await pool.query(
            "SELECT 1 FROM turnos WHERE id = $1",
            [Number(turno_id)]
        ) 

        if(checkShift.rows.length === 0){
            return res.status(404).json({error: "El turno elegido no existe"})
        }

        const getCompanysOfRequester = await pool.query(
        "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
        [id, Number(empresa_id)]
        )

        if(getCompanysOfRequester.rows.length === 0){
        return res.status(404).json({error: "No puedes modificar datos de esta empresa"})
        }

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
        const shiftUpdated = await pool.query(query, values)

        return res.status(200).json({
            message: "Turno modificado correctamente",
            turno: shiftUpdated.rows[0]
        })


    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

const deleteShift = async (req, res) => {
    const {id, rol_id} = req.user
    const {empresa_id, turno_id} = req.params

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})
    }

    try{
        const checkShift = await pool.query(
            "SELECT 1 FROM turnos WHERE id = $1 AND empresa_id = $2",
            [Number(turno_id), Number(empresa_id)]
        ) 

        if(checkShift.rows.length === 0){
            return res.status(404).json({error: "El turno elegido no existe"})
        }

        const getCompanysOfRequester = await pool.query(
        "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
        [id, Number(empresa_id)]
        )

        if(getCompanysOfRequester.rows.length === 0){
        return res.status(404).json({error: "No puedes modificar datos de esta empresa"})
        }

        const shiftDeleted = await pool.query(
            "DELETE FROM turnos WHERE id = $1 AND empresa_id = $2 RETURNING *",
            [turno_id, empresa_id]
        )

        return res.status(200).json({
            message: "Turno eliminado con exito",
            shift: shiftDeleted.rows[0]
        })
    
    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

const assignShiftToUser = async(req, res) => {
    const {id, rol_id} = req.user
    const {empresa_id, turno_id} =req.params
    const {usuario_id, fecha}= req.body

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})
    }

    try{

        const checkShift = await pool.query(
            "SELECT 1 FROM turnos WHERE id = $1 AND empresa_id = $2",
            [Number(turno_id), Number(empresa_id)]
        ) 

        if(checkShift.rows.length === 0){
            return res.status(404).json({error: "El turno elegido no existe o pertenece a otra empresa"})
        }

         const getCompanysOfRequester = await pool.query(
        "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
        [id, Number(empresa_id)]
        )

        if(getCompanysOfRequester.rows.length === 0){
        return res.status(404).json({error: "No puedes trabajar con datos de esta empresa"})
        }

        const getCompanyOfUser = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
            [usuario_id, Number(empresa_id)]
        )

        if(getCompanyOfUser.rows.length === 0){
            return res.status(403).json({error: "El usuario asignado no pertenece a tu empresa"})
        }

        const checkDuplicateDate = await pool.query(
            "SELECT 1 FROM usuarios_turnos WHERE turno_id = $1 AND usuario_id = $2 AND fecha = $3",
            [Number(turno_id), usuario_id, fecha]
        )

        if(checkDuplicateDate.rows.length >0){
            return res.status(409).json({error: "Este usuario ya tiene asignado este turno, en la misma fecha"})
        }

        const asignedShift = await pool.query(
            "INSERT INTO usuarios_turnos(fecha, usuario_id, turno_id) VALUES($1, $2, $3) RETURNING *",
            [fecha, usuario_id, Number(turno_id)]
        )

        return res.status(200).json({
            message: "Turno asignado con exito",
            data: asignedShift.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

const removeShiftFromUser = async(req, res) => {
    const {id, rol_id} = req.user
    const {empresa_id, turno_id, usuario_id, fecha} =req.params

    if(!id || Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})
    }

    try{

         const checkShift = await pool.query(
            "SELECT 1 FROM turnos WHERE id = $1 AND empresa_id = $2",
            [Number(turno_id), Number(empresa_id)]
        ) 

        if(checkShift.rows.length === 0){
            return res.status(404).json({error: "El turno elegido no existe o pertenece a otra empresa"})
        }

         const getCompanysOfRequester = await pool.query(
        "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
        [id, Number(empresa_id)]
        )

        if(getCompanysOfRequester.rows.length === 0){
        return res.status(404).json({error: "No puedes trabajar con datos de esta empresa"})
        }

        const getCompanyOfUser = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
            [usuario_id, Number(empresa_id)]
        )

        if(getCompanyOfUser.rows.length === 0){
            return res.status(403).json({error: "El usuario asignado no pertenece a tu empresa"})
        }

        const removedShift = await pool.query(
            "DELETE FROM usuarios_turnos WHERE turno_id = $1 AND usuario_id = $2 AND fecha = $3 RETURNING *",
            [turno_id, usuario_id, fecha]
        )

        if(removedShift.rows.length === 0){
            return res.status(403).json({error: "No hay nada seleccionado para eliminar"})
        }

        return res.status(200).json({
            message: "Horario Eliminado con exito del usuario",
            data:removedShift.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

const getShiftForUser = async(req, res) => {
    const {id} = req.user

    if(!id){
        return res.status(403).json({error: "Token invalido"})
    }

    try{

        const getSchedule = await pool.query(
            "SELECT ut.fecha, t.nombre, t.hora_inicio, t.hora_fin FROM usuarios_turnos ut JOIN turnos t ON ut.turno_id = t.id WHERE usuario_id = $1",
            [id]
        )

        if(getSchedule.rows.length === 0){
            return res.status(404).json({error: "No tienes horarios asignados"})
        }

        return res.status(200).json({
            message:"Horario recuperado con exito",
            schedule:getSchedule.rows})

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

module.exports = {createShift, getShifts, updateShift, deleteShift, assignShiftToUser, removeShiftFromUser, getShiftForUser}