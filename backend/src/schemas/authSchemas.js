const Joi = require("joi")

const registerSchema = Joi.object({
    
    usuario: Joi.object({
    nombre: Joi.string().min(3).max(30).required()
        .messages({
            "string.empty": "Nombre de usuario obligatorio",
            "string.min": "El nombre debe tenr al menos 3 caracteres",
            "string.max": "El nombre no puede tener mas de 30 caracteres"
        }),
    
    apellidos: Joi.string().min(3).max(30).required()
        .messages({
            "string.empty": "Apellido de usuario obligatorio",
            "string.min": "El apellido debe tenr al menos 3 caracteres",
            "string.max": "El apellido no puede tener mas de 30 caracteres"
        }),
    
    email: Joi.string().email().required()
    .messages({
        "string.empty": "Email no puede estar vacio",
        "string.email": "Email debe tener un formato valido"
    }),

    password: Joi.string().min(6).max(50).required()
    .messages({
        "string.empty": "La contraseña es obligatoria",
        "string.min": "La contraseña debe tener al menos 6 caracteres",
        "string.max": "La contraseña no debe superar los 50 caracteres"
    }),

    dni: Joi.string().length(9).required()
    .messages({
        "string.empty": "El DNI es obligatorio",
        "string.length": "El DNI debe tener 9 caracteres"
    }),

    telefono: Joi.string().optional(),

    sueldo: Joi.number().optional()
    
    }).required().messages({"any.required":"Los datos del usuario son obligatorios"}),

    empresa: Joi.object({
        nombre: Joi.string().required()
        .messages({
            "string.empty": "El nombre de la empresa es obligatorio",
            "string.min": "El nombre de la empresa debe tener al menos 3 caracteres"
        }),

        email: Joi.string().email().optional().allow("").messages({
            "string.email": "El email de la empresa debe tener un formato válido"
        })

    }).required().messages({"any.required": "Los datos de la empresa son obligatorios"})

})

const emailVerificationSchema = Joi.object({
    email: Joi.string()
    .email()
    .required()
    .messages({
        "string.empty": "Email no puede estar vacio",
        "string.email": "Email debe tener un formato valido"
    }),

    verificationCode: Joi.string()
    .length(6)
    .required()
    .messages({
        "string.empty": "Número de verificacion no puede estar vacio",
        "string.length": "Numero de verificacion debe tener 6 caracteres"
    })
})

const loginSchema = Joi.object({
    email: Joi.string()
    .email()
    .required()
    .messages({
        "string.empty": "Email no puede estar vacio",
        "string.email": "Email debe tener un formato valido"
    }),
    password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
        "string.empty": "La contraseña es obligatoria",
        "string.min": "La contraseña debe tener al menos 6 caracteres",
        "string.max": "La contraseña no debe superar los 50 caracteres"
    }),
})

const resendEmailSchema = Joi.object({
    email: Joi.string()
    .email()
    .required()
    .messages({
        "string.empty": "Email no puede estar vacio",
        "string.email": "Email debe tener un formato valido"
    })
})

const requestPasswordResetSchema = Joi.object({
    email: Joi.string()
    .email()
    .required()
    .messages({
        "string.empty": "Email no puede estar vacio",
        "string.email": "Email debe tener un formato valido"
    })
})

const resetPasswordSchema = Joi.object({
    email: Joi.string()
    .email()
    .required()
    .messages({
        "string.empty": "Email no puede estar vacio",
        "string.email": "Email debe tener un formato valido"
    }),
    newPassword: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
        "string.empty": "La contraseña es obligatoria",
        "string.min": "La contraseña debe tener al menos 6 caracteres",
        "string.max": "La contraseña no debe superar los 50 caracteres"
    }),
    recoveryCode: Joi.string()
    .length(6)
    .required()
    .messages({
        "string.empty": "Numero de recuperacion no puede estar vacio",
        "string.length": "Numero de recuperacion debe tener 6 caracteres"
    })

    

})

module.exports = {registerSchema, emailVerificationSchema, loginSchema, resendEmailSchema, requestPasswordResetSchema, resetPasswordSchema}