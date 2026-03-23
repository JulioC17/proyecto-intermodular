const express = require("express")
const isAuth = require("../middleware/isAuth")
const validateSchema = require("../middleware/validateSchema")
const {createCheckIn, createCheckOut, getWorkedTime, getAllWorkedTime, getActualTimeOfWork} = require("../controllers/fichajesControllers")
const {getWorkedTimeSchemaQuery, getAllWorkedTimeSchemaQuery} = require("../schemas/fichajesSchemas")

const router = express.Router()

router.post("/checkIn", isAuth, createCheckIn)//ruta para fichar

router.get("/myWorkedTime", isAuth, validateSchema(getWorkedTimeSchemaQuery, "query"), getWorkedTime)//ruta para ver horas de trabajo personales
router.get("/getAllWorkedTime", isAuth, validateSchema(getAllWorkedTimeSchemaQuery, "query"), getAllWorkedTime)//ruta para ver todas las horas de trabajo de todos los trabajdores de le empresa
router.get("/actualTime", isAuth, getActualTimeOfWork)

router.put("/checkOut", isAuth, createCheckOut)//ruta para desfichar

module.exports = router