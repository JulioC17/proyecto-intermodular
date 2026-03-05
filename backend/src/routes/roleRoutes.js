const express = require("express")
const {createRole} = require("../controllers/roleControllers")

const router = express.Router()

router.post("/", createRole)//ruta para la creacion de roles

module.exports = router