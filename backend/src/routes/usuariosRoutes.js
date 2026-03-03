const express = require("express")
const {createUser, firstLogin, userProfile, ownersAndAdminsView, updateUsers, deleteUser} = require("../controllers/usuariosControllers")
const isAuth = require("../middleware/isAuth")
const validateSchema = require("../middleware/validateSchema")
const {createUserSchema, firstLoginSchema, updateUsersSchema, updateUsersSchemaParams, deleteUserParams} = require("../schemas/usuariosSchema")

const router = express.Router()

router.post("/createUser",isAuth, validateSchema(createUserSchema),createUser)//ruta para la creacion de usuarios "Trabajdor" por defecto
router.post("/firstLogin", isAuth, validateSchema(firstLoginSchema),firstLogin)//ruta para el primer login con credenciales temporales

router.get("/me", isAuth, userProfile)//ruta para la vista de perfil propio
router.get("/getAll", isAuth, ownersAndAdminsView)//ruta para la vista de todos los usuarios

router.put("/updateUser/:id_usuario", isAuth, validateSchema(updateUsersSchemaParams, "params"),validateSchema(updateUsersSchema),updateUsers)//ruta para actualizar usuarios

router.delete("/deleteUser/:id_usuario", isAuth, validateSchema(deleteUserParams),deleteUser)//ruta para eliminar usuarios

module.exports = router