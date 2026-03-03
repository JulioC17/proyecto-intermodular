const express = require("express")
const isAuth = require("../middleware/isAuth")
const validateSchema = require("../middleware/validateSchema")
const {createRequestofHollidaysSchema, handdleHollidaysParamsSchema, handdleHollidaysSchema} = require("../schemas/vacacionesSchemas")
const {createRequestOfHollidays, getProfileHollidays, getHollidaysForAdminsAndOwners, handdleHollidays} = require("../controllers/vacacionesControllers")

const router = express.Router()

router.post("/requestHollidays", isAuth, validateSchema(createRequestofHollidaysSchema), createRequestOfHollidays )

router.get("/getHollidays", isAuth, getProfileHollidays)
router.get("/getAllHollidays", isAuth, getHollidaysForAdminsAndOwners)

router.put("/handdleHollidays/:vacaciones_id", isAuth, validateSchema(handdleHollidaysParamsSchema, "params"), validateSchema(handdleHollidaysSchema), handdleHollidays)

module.exports = router