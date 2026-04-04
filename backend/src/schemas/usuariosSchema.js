const Joi = require("joi")

const createUserSchema = Joi.object({
   nombre: Joi.string()
           .min(3)
           .max(30)
           .required()
           .messages({
               "string.empty": "Nombre de usuario obligatorio",
               "string.min": "El nombre debe tener al menos 3 caracteres",
               "string.max": "El nombre no puede tener mas de 30 caracteres"
           }),
       
       apellidos: Joi.string()
           .min(3)
           .max(30)
           .required()
           .messages({
               "string.empty": "Apellido de usuario obligatorio",
               "string.min": "El apellido debe tenr al menos 3 caracteres",
               "string.max": "El apellido no puede tener mas de 30 caracteres"
           }),
       
       email: Joi.string()
       .email()
       .required()
       .messages({
           "string.empty": "Email no puede estar vacio",
           "string.email": "Email debe tener un formato valido"
       }),

      dni: Joi.string()
       .length(9)
       .required()
       .messages({
           "string.empty": "El DNI es obligatorio",
           "string.length": "El DNI debe tener 9 caracteres"
       }),
       
       id_empresa: Joi.number()
       .integer()
       .required()
       .messages({
        "number.empty": "Debes seleccionaar una empresa",
        "any.required": "Deber seleccionar una empresa",
        "number.integer": "El id de la empresa debe ser un numero entero"
       }),
   
       telefono: Joi.string()
       .optional(),
   
       sueldo: Joi.number()
           .optional()
           .precision(2)
})

const firstLoginSchema = Joi.object({
   newPassword: Joi.string()
       .min(6)
       .max(50)
       .required()
       .messages({
           "string.empty": "La contraseña es obligatoria",
           "string.min": "La contraseña debe tener al menos 6 caracteres",
           "string.max": "La contraseña no debe superar los 50 caracteres"
       }),
})

const updateUsersSchema = Joi.object({
    email:Joi.string()
    .optional()
    .email()
    .messages({
        "string.email":"El correo debe tener formato valido"
    }),

    nombre: Joi.string()
    .optional()
    .min(3)
    .max(30)
    .messages({
        "string.min": "El nombre debe tener al menos 3 caracteres",
        "string.max": "El nombre no puede tener mas de 30 caracteres"
    }),

    apellidos:Joi.string()
    .optional()
    .min(3)
    .max(30)
    .messages({
        "string.min": "El apellido debe tener al menos 3 caracteres",
        "string.max": "El apellido no puede tener mas de 30 caracteres"
    }),

    telefono:Joi.string()
    .optional().allow(null, ""),

    sueldo:Joi.number()
    .optional()
    .precision(2)
})

const updateUsersSchemaParams = Joi.object({
    id_usuario: Joi.number()
    .integer()
    .required()
    .messages({
        "number.empty":"Debes seleccionar un usuario",
        "number.integer": "El id del usuario debe ser un numero entero",
        "any.required": "Debes seleccionaar a un usuario"
    })
})

const deleteUserParams = Joi.object({
    id_usuario: Joi.number()
    .integer()
    .required()
    .messages({
        "number.empty":"Debes seleccionar un usuario",
        "number.integer": "El id del usuario debe ser un numero entero",
        "any.required": "Debes seleccionaar a un usuario"
    })
})

const ownerAndAdminsViewSchemaParams = Joi.object({
     empresa_id: Joi.number()
    .integer()
    .required()
    .messages({
        "number.empty":"Debes seleccionar una empresa",
        "number.integer": "El id de la empresa debe ser un numero entero",
        "any.required": "Debes seleccionar una empresa"
    })
})

module.exports = {createUserSchema, firstLoginSchema, updateUsersSchema, updateUsersSchemaParams, deleteUserParams, ownerAndAdminsViewSchemaParams}