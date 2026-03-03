const Joi = require("joi")

const createShiftSchema = Joi.object({
    nombre: Joi.string()
    .required()
    .messages({
        "string.empty":"Debes establecer un nombre paaraa el turno"
    }),

    hora_inicio : Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required()
    .messages({
        "string.empty": "La hora de inicio es obligatoria",
        "string.pattern.base": "La hora de inicio debe tener el formato HH:MM:SS"
    }),

    hora_fin: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required()
    .messages({
        "string.empty": "La hora de salida es obligatoria",
        "string.pattern.base": "La hora de salida debe tener el formato HH:MM:SS"
    }),

    empresa_id: Joi.number()
    .integer()
    .required()
    .messages({
        "number.integer":"El numero de laa empresaa debe ser un numero entero",
        "any.required": "Debes seleccionr una empresa"
    })
})

const getShiftSchemaParams = Joi.object({
    empresa_id:Joi.number()
    .required()
    .integer()
    .messages({
        "any.required":"Debes seleccionar una empresa",
        "number.integer": "El id de la empresa debe ser un numero entero"
    })
})

const updateShiftSchema = Joi.object({
     nombre: Joi.string()
    .optional()
    .messages({
        "string.empty": "El nombre del turno no puede estar vacío"
    }),
    
    hora_inicio : Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .optional()
    .messages({
        "string.pattern.base": "La hora de inicio debe tener el formato HH:MM:SS"
    }),

    hora_fin: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .optional()
    .messages({
        "string.pattern.base": "La hora de salida debe tener el formato HH:MM:SS"
    }),
})

const updateShiftSchemaParams = Joi.object({
     empresa_id:Joi.number()
    .required()
    .integer()
    .messages({
        "any.required":"Debes seleccionar una empresa",
        "number.integer": "El id de la empresa debe ser un numero entero"
    }),
     turno_id:Joi.number()
    .required()
    .integer()
    .messages({
        "any.required":"Debes seleccionar un turno",
        "number.integer": "El id del turno debe ser un numero entero"
    })
})

const deleteShiftSchemaParams = Joi.object({
      empresa_id:Joi.number()
    .required()
    .integer()
    .messages({
        "any.required":"Debes seleccionar una empresa",
        "number.integer": "El id de la empresa debe ser un numero entero"
    }),
     turno_id:Joi.number()
    .required()
    .integer()
    .messages({
        "any.required":"Debes seleccionar un turno",
        "number.integer": "El id del turno debe ser un numero entero"
    })
})

const assignShiftToUserSchemaParams = Joi.object({
     empresa_id:Joi.number()
    .required()
    .integer()
    .messages({
        "any.required":"Debes seleccionar una empresa",
        "number.integer": "El id de la empresa debe ser un numero entero",
        "number.base":"El id de la empresa debe ser un número"
    }),
     turno_id:Joi.number()
    .required()
    .integer()
    .messages({
        "any.required":"Debes seleccionar un turno",
        "number.integer": "El id del turno debe ser un numero entero",
        "number.base":"El id del turno debe ser un número"
    })
})

const assignShiftToUserSchema = Joi.object({
    fecha : Joi.date()
    .required()
    .min("now")
    .messages({
        "date.min": "No puedes signar fechas pasadas",
        "any.required": "La fecha es obligatoria"
    }),

    usuario_id: Joi.number()
    .integer()
    .required()
    .messages({
        "number.integer":"El numero de id del usuario debe ser un numero entero",
        "any.required":"Debes seleccionaar un usuario",
        "number.base":"El id del usuario debe ser un número"
    })
})

const removeShiftFromUserSchema = Joi.object({
    empresa_id:Joi.number()
    .required()
    .integer()
    .messages({
        "any.required":"Debes seleccionar una empresa",
        "number.integer": "El id de la empresa debe ser un numero entero",
        "number.base":"El id de la empresa debe ser un número"
    }),
     turno_id:Joi.number()
    .required()
    .integer()
    .messages({
        "any.required":"Debes seleccionar un turno",
        "number.integer": "El id del turno debe ser un numero entero",
        "number.base":"El id del turno debe ser un número"
    }),

    usuario_id:Joi.number()
    .required()
    .integer()
    .messages({
        "any.required":"Debes seleccionar un usuario",
        "number.integer": "El id del usuario debe ser un numero entero",
        "number.base":"El id del usuario debe ser un número"
    }),

    fecha : Joi.date()
    .required()
    .messages({
        "any.required": "La fecha es obligatoria"
    }),

})

module.exports = {createShiftSchema, getShiftSchemaParams, updateShiftSchema, updateShiftSchemaParams, deleteShiftSchemaParams, assignShiftToUserSchema, assignShiftToUserSchemaParams, removeShiftFromUserSchema}