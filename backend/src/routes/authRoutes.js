const express = require("express")
const {register, verifyEmail, login, resendEmail, requestPasswordReset, resetPassword} = require("../controllers/authControllers")
const {registerSchema, emailVerificationSchema, loginSchema, resendEmailSchema, requestPasswordResetSchema, resetPasswordSchema} = require("../schemas/authSchemas")
const validateSchema = require("../middleware/validateSchema")

const router = express.Router()

router.post("/register",validateSchema(registerSchema) ,register)//ruta para resgistrar usuarios
router.post("/verify-email",validateSchema(emailVerificationSchema),verifyEmail)//ruta para la verificacion de la cuenta por email
router.post("/login", validateSchema(loginSchema) , login)//ruta para el login
router.post("/resend", validateSchema(resendEmailSchema) , resendEmail)//ruta para renvio de correo 
router.post("/requestPasswordReset", validateSchema(requestPasswordResetSchema),requestPasswordReset)//ruta para pedir codigo de recuperacion de cuenta
router.post("/resetPassword", validateSchema(resetPasswordSchema),resetPassword)//ruta para la ejecucion de la recuperacion de la cuenta

module.exports = router