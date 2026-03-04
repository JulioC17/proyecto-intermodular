const express = require("express")
const isAuth = require("../middleware/isAuth")
const validateSchema = require("../middleware/validateSchema")
const {createCheckIn, createCheckOut, getWorkedTime, getAllWorkedTime} = require("../controllers/fichajesControllers")
const {getWorkedTimeSchemaQuery, getAllWorkedTimeSchemaQuery} = require("../schemas/fichajesSchemas")

const router = express.Router()

router.post("/checkIn", isAuth, createCheckIn)

router.get("/myWorkedTime", isAuth, validateSchema(getWorkedTimeSchemaQuery, "query"), getWorkedTime)
router.get("/getAllWorkedTime", isAuth, validateSchema(getAllWorkedTimeSchemaQuery, "query"), getAllWorkedTime)

router.put("/checkOut", isAuth, createCheckOut)

module.exports = router