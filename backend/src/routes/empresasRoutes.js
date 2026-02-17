const express = require("express")
const {createCompany, viewCompany, updateCompany, deleteCompany} = require("../controllers/empresasControllers")
const isAuth = require("../middleware/isAuth")

const router = express.Router()

router.post("/createCompany", isAuth, createCompany)//ruta para la creacion de empresas

router.get("/viewCompany", isAuth, viewCompany)//ruta para la lectura y vista de empresas

router.put("/updateCompany", isAuth, updateCompany)//ruta para la modificacion de empresas

router.delete("/deleteCompany/:id_empresa", isAuth, deleteCompany)//ruta para la eliminacion de empresas



module.exports = router