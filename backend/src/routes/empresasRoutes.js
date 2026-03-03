const express = require("express")
const {createCompany, viewCompany, updateCompany, deleteCompany, changeCompany} = require("../controllers/empresasControllers")
const isAuth = require("../middleware/isAuth")
const validateSchema = require("../middleware/validateSchema")
const {createCompanySchema, updateCompanySchema, updateCompanySchemaParams, deleteCompanySchemaParams, changeCompanySchema, changeCompanySchemaParams} = require("../schemas/empresasSchema")


const router = express.Router()

router.post("/createCompany", isAuth, validateSchema(createCompanySchema),createCompany)//ruta para la creacion de empresas
router.get("/viewCompany", isAuth, viewCompany)//ruta para la lectura y vista de empresas

router.put("/updateCompany/:id_empresa", isAuth, validateSchema(updateCompanySchemaParams, "params"),validateSchema(updateCompanySchema),updateCompany)//ruta para la modificacion de empresas
router.put("/changeCompany/:id_usuario/company", isAuth, validateSchema(changeCompanySchemaParams, "params"), validateSchema(changeCompanySchema), changeCompany)

router.delete("/deleteCompany/:id_empresa", isAuth, validateSchema(deleteCompanySchemaParams, "params"),deleteCompany)//ruta para la eliminacion de empresas



module.exports = router