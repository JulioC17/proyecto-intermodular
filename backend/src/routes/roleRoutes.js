const express = require("express")
const {createRole, chanegRole} = require("../controllers/roleControllers")
const validateSchema = require("../middleware/validateSchema")
const isAuth = require("../middleware/isAuth")
const { changeRoleSchemaParams, changeRoleSchema } = require("../schemas/roleSchema")

const router = express.Router()

router.post("/", createRole)//ruta para la creacion de roles

router.put("/changeRole/:usuario_id", isAuth, validateSchema(changeRoleSchemaParams, "params"), validateSchema(changeRoleSchema), chanegRole)

module.exports = router