const express = require("express")
const isAuth = require("../middleware/isAuth")
const {createShift, getShifts, updateShift, deleteShift} = require("../controllers/turnosControllers")

const router = express.Router()

router.post("/createShift", isAuth, createShift)

router.get("/getShifts/:empresa_id", isAuth, getShifts)

router.put("/updateShift/:empresa_id/:turno_id", isAuth, updateShift)

router.delete("/deleteShift/:empresa_id/:turno_id", isAuth, deleteShift)

module.exports = router