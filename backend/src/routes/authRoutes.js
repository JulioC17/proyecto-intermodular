const express = require("express")
const {register, verifyEmail, login, resendEmail, requestPasswordReset, resetPassword} = require("../controllers/authControllers")

const router = express.Router()

router.post("/register", register)//ruta para resgistrar usuarios
router.post("/verify-email",verifyEmail)//ruta para la verificacion de la cuenta por email
router.post("/login", login)//ruta para el login
router.post("/resend", resendEmail)//ruta para renvio de correo 
router.post("/requestPasswordReset", requestPasswordReset)//ruta para pedir codigo de recuperacion de cuenta
router.post("/resetPassword", resetPassword)//ruta para la ejecucion de la recuperacion de la cuenta

module.exports = router