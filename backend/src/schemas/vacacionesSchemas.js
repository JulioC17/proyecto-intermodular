const Joi = require("joi")

const createRequestofHollidaysSchema = Joi.object({
    fecha_inicio: Joi.date()
    .required()
    .min("now")
    .messages({
        "date.base":"La decha de inicio tiene que ser valida",
        "date.min": "No puedes solicitar vacaciones en fechas pasadas",
        "any.required":"La fecha de inicio es obligatoria"
    }),
    fecha_fin: Joi.date()
    .required()
    .min(Joi.ref("fecha_inicio"))
    .messages({
        "date.base":"La decha de fin tiene que ser valida",
        "date.min": "No puedes terminar tus vacaciones antes de su inicio",
        "any.required":"La fecha de fin es obligatoria"
    }),
})

const handdleHollidaysParamsSchema = Joi.object({
    vacaciones_id: Joi.number()
    .integer()
    .required()
    .messages({
        "any.required": "El id de las vacaciones es obligatorio",
        "number.integer": "El id debe ser un numero entero",
        "number.base": "El id debe ser un numero"
    })
})

const handdleHollidaysSchema = Joi.object({
    estado: Joi.boolean()
    .required()
    .messages({
        "any.required":"Debes indicar si apruebas o deniegas las vacaciones",
        "boolean.base":"EL estado debe ser True o False"
    })
})

module.exports = {createRequestofHollidaysSchema, handdleHollidaysParamsSchema, handdleHollidaysSchema}