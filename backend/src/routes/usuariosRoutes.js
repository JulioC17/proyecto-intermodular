const express = require("express")
const {createUser, firstLogin} = require("../controllers/usuariosControllers")
const isAuth = require("../middleware/isAuth")

const router = express.Router()

router.post("/createUser", isAuth, createUser)
router.post("/firstLogin", isAuth, firstLogin)

module.exports = router