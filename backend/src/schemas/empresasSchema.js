const Joi = require("joi")

const createCompanySchema = Joi.object({
    nombre: Joi.string()
    .required()
    .messages({
        "string.empty": "Tu empresa debe tener un nombre"
    }),

    email: Joi.string()
    .optional()
    .empty("")
    .allow(null)
    .email()
    .messages({
        "string.email": "El email debe tener el formato correcto"
    })
})

const updateCompanySchema = Joi.object({
    nombre: Joi.string()
    .optional(),

    email: Joi.string()
    .email()
    .empty("")
    .allow(null)
    .optional()
    .messages({
        "string.email": "El email debe tener el formato correcto"
    })
})

const updateCompanySchemaParams = Joi.object({
    id_empresa: Joi.number()
    .integer()
    .required()
    .messages({
        "number.base" : "El id de la empresa debe ser un numero",
        "number.empty": "Debes seleccionar una empresa",
        "any.required": "El id de la empresa es obligatorio"
    })
})

const deleteCompanySchemaParams = Joi.object({
    id_empresa: Joi.number()
    .integer()
    .required()
    .messages({
        "number.base" : "El id de la empresa debe ser un numero",
        "number.empty": "Debes seleccionar una empresa",
        "any.required": "El id de la empresa es obligatorio"
    })
})

const changeCompanySchemaParams = Joi.object({
     id_usuario: Joi.number()
    .integer()
    .required()
    .messages({
        "number.base" : "El id del usuario debe ser un numero",
        "number.empty": "Debes seleccionar un usuario",
        "any.required": "El id del usuario es obligatorio"
    })
})

const changeCompanySchema = Joi.object({
     companyTargetId: Joi.number()
    .integer()
    .required()
    .messages({
        "number.base" : "El id de la empresa debe ser un numero",
        "number.empty": "Debes seleccionar una empresa",
        "any.required": "El id de la empresa es obligatorio"
    })
})

const viewCompanySchemaQuery = Joi.object({
    active: Joi.string().valid("true", "false").optional().messages({
        "any.only": "El parametro active debe ser true o false"
    })
})

module.exports = {createCompanySchema, updateCompanySchema, updateCompanySchemaParams, deleteCompanySchemaParams, changeCompanySchemaParams, changeCompanySchema, viewCompanySchemaQuery}