const express = require("express")
const {createCompany, viewCompany, updateCompany, deleteCompany} = require("../controllers/empresasControllers")
const isAuth = require("../middleware/isAuth")

const router = express.Router()

router.post("/createCompany", isAuth, createCompany)

router.get("/viewCompany", isAuth, viewCompany)

router.put("/updateCompany", isAuth, updateCompany)

router.delete("/deleteCompany/:id_empresa", isAuth, deleteCompany)



module.exports = router