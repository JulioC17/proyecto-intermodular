const Joi = require("joi")

const createRecipeSchema = Joi.object({
    nombre: Joi.string()
    .required()
    .max(100)
    .trim()
    .messages({
        "any.required":"El nombre de la receta es obligatorio",
        "string.base": "El nombre debe ser un texto",
        "string.max":"El nombre no puede superar los 100 caracteres"
    }),

    ingredientes: Joi.string()
    .required()
    .max(250)
    .trim()
    .messages({
        "any.required":"Los ingredientes de la receta son obligatorios",
        "string.base": "Los ingredientes deben ser un texto",
        "string.max":"Los ingredientes no pueden superar los 250 caracteres"
    }),

    elaboracion: Joi.string()
    .required()
    .max(500)
    .trim()
    .messages({
        "any.required":"La elaboración de la receta es obligatoria",
        "string.base": "La elaboración debe ser un texto",
        "string.max":"La elaboración no puede superar los 500 caracteres"
    }),

    montaje: Joi.string()
    .optional()
    .allow("")
    .max(250)
    .trim()
    .messages({
        "string.base": "El montaje debe ser un texto",
        "string.max":"El montaje no puede superar los 250 caracteres"
    }),
})

const createRecipeSchemaParams = Joi.object({
    empresa_id: Joi.number()
    .integer()
    .required()
    .messages({
        "number.base": "El numero de id debe ser un número entero",
        "number.required":"El numero de id de empresa es obligatorio"
    })
})

const getRecipesSchemaParams = Joi.object({
    empresa_id:Joi.number()
    .integer()
    .required()
    .messages({
        "number.base": "El numero de id debe ser un número entero",
        "number.required":"El numero de id de empresa es obligatorio"
    })
})

const getRecipesSchemaQuery = Joi.object({
    words: Joi.string()
    .optional()
    .max(100)
    .trim()
    .messages({
        "string.base": "El nombre debe ser un texto",
        "string.max":"La búsqueda no puede superar los 100 caracteres"
    })
})

const updateRecipesSchema = Joi.object({
    nombre: Joi.string()
    .optional()
    .max(100)
    .trim()
    .messages({
        "string.base": "El nombre debe ser un texto",
        "string.max":"El nombre no puede superar los 100 caracteres"
    }),

    ingredientes: Joi.string()
    .optional()
    .max(250)
    .trim()
    .messages({
        "string.base": "Los ingredientes deben ser un texto",
        "string.max":"Los ingredientes no pueden superar los 250 caracteres"
    }),

    elaboracion: Joi.string()
    .optional()
    .max(500)
    .trim()
    .messages({
        "string.base": "La elaboración debe ser un texto",
        "string.max":"La elaboración no puede superar los 500 caracteres"
    }),

    montaje: Joi.string()
    .optional()
    .allow("")
    .max(250)
    .trim()
    .messages({
        "string.base": "El montaje debe ser un texto",
        "string.max":"El montaje no puede superar los 250 caracteres"
    }),
})

const updateRecipesSchemaParams = Joi.object({
    empresa_id: Joi.number()
    .integer()
    .required()
    .messages({
        "number.base": "El numero de id debe ser un número entero",
        "number.required":"El numero de id de empresa es obligatorio"
    }),
    receta_id: Joi.number()
    .integer()
    .required()
    .messages({
        "number.base": "El numero de id debe ser un número entero",
        "number.required":"El numero de id de empresa es obligatorio"
    })
})

const deleteRecipesSchemaParams = Joi.object({
     empresa_id: Joi.number()
    .integer()
    .required()
    .messages({
        "number.base": "El numero de id debe ser un número entero",
        "number.required":"El numero de id de empresa es obligatorio"
    }),
    receta_id: Joi.number()
    .integer()
    .required()
    .messages({
        "number.base": "El numero de id debe ser un número entero",
        "number.required":"El numero de id de empresa es obligatorio"
    })
})

module.exports = {createRecipeSchema, createRecipeSchemaParams, getRecipesSchemaParams, getRecipesSchemaQuery, updateRecipesSchema, updateRecipesSchemaParams, deleteRecipesSchemaParams}