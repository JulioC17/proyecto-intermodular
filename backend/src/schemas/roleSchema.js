const Joi = require("joi")

const changeRoleSchemaParams = Joi.object({
    usuario_id: Joi.number()
    .required()
    .integer()
    .messages({
        "number.base": "El id del usuario debe ser un numero entero",
        "number.required": "El numero de id del usuario es obligatorio"
    })
})

const changeRoleSchema = Joi.object({
    newRole: Joi.number()
    .required()
    .valid(2, 3)
    .integer()
    .messages({
        "any.only": "El rol solo puede ser 2(Administrador) o 3(Trabajador)",
        "number.required": "El nuevo rol es obligatorio"
    })
})

module.exports = {changeRoleSchema, changeRoleSchemaParams}