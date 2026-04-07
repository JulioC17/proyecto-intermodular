const express = require("express")
const isAuth = require("../middleware/isAuth")
const validateSchema = require("../middleware/validateSchema")
const {createRequestofHollidaysSchema, handdleHollidaysParamsSchema, handdleHollidaysSchema, getHollidaysForAdminsAndOwnersParams} = require("../schemas/vacacionesSchemas")
const {createRequestOfHollidays, getProfileHollidays, getHollidaysForAdminsAndOwners, handdleHollidays} = require("../controllers/vacacionesControllers")

const router = express.Router()

router.post("/requestHollidays", isAuth, validateSchema(createRequestofHollidaysSchema), createRequestOfHollidays )//ruta para crear solicitud de vacaciones

router.get("/getHollidays", isAuth, getProfileHollidays)//ruta para obtener solicitudes personaales
router.get("/getAllHollidays/:empresa_id", isAuth, validateSchema(getHollidaysForAdminsAndOwnersParams, "params"),getHollidaysForAdminsAndOwners)//ruta para obtner todas las solicitudes

router.put("/handdleHollidays/:vacaciones_id", isAuth, validateSchema(handdleHollidaysParamsSchema, "params"), validateSchema(handdleHollidaysSchema), handdleHollidays)//ruta para aprobar o denegar solicitudes

module.exports = router