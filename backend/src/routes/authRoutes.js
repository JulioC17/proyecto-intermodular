const express = require("express")
const {register, verifyEmail, login, resendEmail, requestPasswordReset, resetPassword} = require("../controllers/authControllers")

const router = express.Router()

router.post("/register", register)
router.post("/verify-email",verifyEmail)
router.post("/login", login)
router.post("/resend", resendEmail)
router.post("/requestPasswordReset", requestPasswordReset)
router.post("/resetPassword", resetPassword)

module.exports = router