const express = require("express")
const isAuth = require("../middleware/isAuth")
const {createShift, getShifts, updateShift, deleteShift, assignShiftToUser, removeShiftFromUser, getShiftForUser} = require("../controllers/turnosControllers")
const validateSchema = require("../middleware/validateSchema")
const {createShiftSchema, getShiftSchemaParams, updateShiftSchema, updateShiftSchemaParams, deleteShiftSchemaParams, assignShiftToUserSchema, assignShiftToUserSchemaParams, removeShiftFromUserSchema} = require("../schemas/turnosSchemas")

const router = express.Router()

router.post("/createShift", isAuth, validateSchema(createShiftSchema),createShift)//ruta pra la creacion de turnos
router.post("/assign/:empresa_id/:turno_id", isAuth, validateSchema(assignShiftToUserSchemaParams, "params"),validateSchema(assignShiftToUserSchema),assignShiftToUser)//ruta para asignar un turno

router.get("/getShifts/:empresa_id", isAuth, validateSchema(getShiftSchemaParams, "params"),getShifts)//ruta para ver todos los turnos
router.get("/schedule/me", isAuth, getShiftForUser)//rutaa para ver turnos personales

router.put("/updateShift/:empresa_id/:turno_id", isAuth, validateSchema(updateShiftSchemaParams, "params"),validateSchema(updateShiftSchema),updateShift)//ruta para modificar turnos

router.delete("/deleteShift/:empresa_id/:turno_id", isAuth, validateSchema(deleteShiftSchemaParams, "params"),deleteShift)//ruta para eliminar turnos
router.delete("/remove/:empresa_id/:turno_id/:usuario_id/:fecha", validateSchema(removeShiftFromUserSchema),isAuth, removeShiftFromUser)//ruta para desasignar turnos

module.exports = router