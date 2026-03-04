const Joi = require("joi")

const getWorkedTimeSchemaQuery = Joi.object({
    from: Joi.date()
    .optional()
    .iso()
    .messages({
        "date.base": "La fecha de inicio no es válida",
        "date.format": "La fecha de inicio debe estar en formato ISO (YYYY-MM-DD)"
    }),

    to:Joi.date()
    .optional()
    .iso()
    .min(Joi.ref("from"))
    .messages({
        "date.base": "La fecha de fin no es válida",
        "date.format": "La fecha de fin debe estar en formato ISO (YYYY-MM-DD)",
        "date.min": "La fecha de fin no puede ser anterior a la fecha de inicio"

    })
})

const getAllWorkedTimeSchemaQuery = Joi.object({
    id_empresa:Joi.number()
    .optional()
    .integer()
    .messages({
        "number.base": "El id debe ser un numero entero"
    }),
    from: Joi.date()
    .optional()
    .iso()
    .messages({
        "date.base": "La fecha de inicio no es válida",
        "date.format": "La fecha de inicio debe estar en formato ISO (YYYY-MM-DD)"
    }),

    to:Joi.date()
    .optional()
    .iso()
    .min(Joi.ref("from"))
    .messages({
        "date.base": "La fecha de fin no es válida",
        "date.format": "La fecha de fin debe estar en formato ISO (YYYY-MM-DD)",
        "date.min": "La fecha de fin no puede ser anterior a la fecha de inicio"

    })
})

module.exports = {getWorkedTimeSchemaQuery, getAllWorkedTimeSchemaQuery}