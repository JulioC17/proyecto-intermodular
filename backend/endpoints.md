# AUTH CONTROLLERS

## POST /register
### Descripcion
Registra un nuevo usuario propietario

### body (JSON)
{
    "nombre": "Juan",           (obligatorio)
    "apellidos": "Rodriguez",   (obligatorio)
    "email": "juan@gmail.com",  (obligatorio)
    "password": "123456",       (obligatorio)
    "dni": 1234567A,            (obligatorio)
    "telefono":"1234567890",    (opcional)
    "sueldo": 1200              (opcional)
}

### Respuesta OK (200)
{
    message:""Usuario creado correctamente, revise su email para verificar""
}

### Test
-Registro correcto✅
-Falta algun campo obligatorio✅
-Falta algun campo no obligatorio✅
-Email duplicado

----------------------------------------------------------------------------

## POST /verify-email
### Descripcion
Verifica al usuario mediante un email y un codigo

### body (JSON)
{
    "email":"juan@gmail.com",       (obligatorio)
    "verificationCode":"123456"     (obligatorio)
}

### Respuesta OK (200)
{
    message: "Usuario verificado correctamente"
}
### Test
-Usuario se verifica correctamente✅
-Envio correctamente el email✅
-Expiracion del codigo

----------------------------------------------------------------------------

## POST /login 
### Descripcion
Permite loguear al usuario "Propietario "mediante email y password

### body (JSON)
{
   "email":"juan@gmail.com",
   "password":"12345678" 
}

### Respuesta OK (200)
{
    message: "Login correcto",
    token,
    user:{
        id:1,
        nombre:"Juan",
        rol:1
    }
}

### Test
-Usuario Loguea con credenciales correctas✅
-Usuario loguea con credenciales incorrectas✅
-Enviar peticion sin algun campo✅

----------------------------------------------------------------------------

## POST /login 
### Descripcion
Permite loguear al usuario "Trabajador" mediante email y password

### body (JSON)
{
   "email":"pepito@gmail.com",
   "password":"12345678" 
}

### Respuesta OK (200)
{
    message: "Debes reestablecer tu contraseña",
    token temporal,
    user:{
        id:2,
        nombre:"Pepito",
        rol:3
    }
}

### Test
-Usuario Loguea con credenciales correctas✅
-Usuario loguea con credenciales incorrectas✅
-Enviar peticion sin algun campo✅

----------------------------------------------------------------------------

## POST /resend
### Descripcion
Envia un nuevo codigo de verificacion por email al usuario

### body (JSON)
{
    "email":"juan@gmail.com"
}

### Respuesta OK (200)
{
    message: "Ha sido enviado un nuevo codigo de verificacion"
}

### Test
-Enviar nuevo codigo
-Introducir codigo incorrecto
-No introducir niingun codigo

----------------------------------------------------------------------------

## POST /requestPasswordReset
### Descripcion
Solicitud para cambiar la contraseña

### body (JSON)
{
    "email":"juan@gmial.com"
}

### Repsuesta OK (200)
{
    message:"Mensaje de recuperacion enviado"
}

### Test
-Envio de codigo de recuperacion✅
-introducir correo que no exite

----------------------------------------------------------------------------

## POST /resetPassword
### Descripcion
Ejecucion de cambio de contraseña

### body (JSON)
{
    "email":"juan@gmail.com",
    "newPassword":"1234567",
    "recoveryCode":"1234567"
}

### Respuesta OK (200)
{
    message: "Cuenta recuperada con exito"
}

### Test
-Enviar body sin algun campo✅
-Enviar codigo erroneo✅

----------------------------------------------------------------------------
# empresasController

## POST /createCompany
### Descripcion
Crear una empresa

### Token
### body (JSON)
{
    "nombre":"bocateria",           (obligatorio)
    "email":"bocateria@gmail.com"   (opcional)
}

### Respuesta OK (200)
{
    message:"Empresa creada correctamente",
    company:{
        id:1,
        nombre: "bocateria"
    }
}

### Test
-Enviar campos obligatrios faltantes✅
-Enviar campos opcionales faltantes✅
-probar un token expirado✅

----------------------------------------------------------------------------

## GET /viewCompany
### Descripcion
Ver un alista de las empresas del usuario

### Token

### Respuesta OK (200)
{
    message: "Datos recuperados correctamente",
            companys: bocateria
}

### Test
-Token expirado✅
-Token correcto✅

----------------------------------------------------------------------------

## PUT /updateCompany
### Descripcion
Editar datos de una empresa

### Token
### body 
{
    "id_empresa": "2",
    "nombre":"Bocateria Nuevo nombre",
    "email": "bocateria@gmail.com"
}

### Respuesta OK (200)
{
    message:"Empresa modificada correctamente",
    update:Bocateria Nuevo nombre
}

### Test
-Token expirado✅
-Enviar sin datos en el body✅
-Cambiar nombre a una empresa que no es propia✅
-Enviar sin alguno de los datos en el body✅

----------------------------------------------------------------------------

## DELETE /updateCompany/:id_empresa
### Descripcion
Eliminar una empresa

### Token

### Respuesta OK (200)
{
    message: "Empresa eliminada correctamente",
    empresa: "Bocateria"
}

### Test
-Token ✅
-Token valido✅
-Modificar empresa que no se propia✅

----------------------------------------------------------------------------

## POST /changeCompany/:id_usuario
### Descripcion
Cambiar a un usuario de empresa

### Token
### body (JSON)
{
    "compnayTargetId":"2"
}

### Respuesta OK (200)
{
    message: "Cambio de empresa del usuario correcto"
}

### Test
-Token invalido✅
-Cambiar a un usuario que no es de la empresa✅
-Cambiar a una empresa que no es propia✅
-Enviar campos vacios✅

----------------------------------------------------------------------------

# usuariosControllers

## POST /createUser
### Descripcion
Crear un usuario "Trabajador"

### Token
### body (JSON)
{
    nombre:"pepito",            (obligatorio)
    apellidos: "santos",        (obligatorio)
    email: "pepito@gmail.com",  (obligatorio)
    id_empresa:2,               (obligatorio)
    telefono: "1234567",        (opcional)
    sueldo:12345,               (opcional)
    dni:"y5656564c"             (obligatorio)
}

### Respuesta OK (200)
{
    message: "usuario creado correctamente",
    nombre: "pepito",
    emial: "pepito@gmail.com",
    id_empresa: 3
}

### Test
-Token invalido✅
-enviar campos obligatorios faltantes✅
-enviar campos opcionales faltantes✅

----------------------------------------------------------------------------

## POST /firstLogin
### Descripcion
Forzar al usuario a un cambio de contraseña

### token temporal
### body (JSON)
{
    email:"nuevoPassword"
}

### Respuesta OK (200)
{
    message: "Contraseña reestablecida correctamente"
}

### Test
-token temporal invalido✅

----------------------------------------------------------------------------

## GET /me
### Descripcion
Vista del perfil de usuario

### token

### Respuesta OK (200)
{
    user: Todos los datos del usuario
}

### Test
-token invalido✅

----------------------------------------------------------------------------

## GET /getAll
### Descripcion
Vista de todos los usuarios

### token

### Respuesta OK (200)
{
    lista de todos los usuarios
}

### Test
-token invalido✅
-token de un trabajdor y no de un propietario o admin✅

----------------------------------------------------------------------------

## PUT /updateUser/:id_usuario
### Descripcion
Editar usuarios(solo propietarios o admins)

### token
### body
{
    email: "pedro@gmail.com",   (opcional)
    nombre: "pedro",            (opcional)
    apellidos: "gonzalo",       (opcional)
    telefono: "46578349",       (opcional)
    sueldo: "4567.89"           (opcional)
}

### Respuesta Ok (200)
{
    message: "Usuario modificado con exito",
    Actualizacion:
        {email: "pedro@gmail.com",   
        nombre: "pedro",            
        apellidos: "gonzalo",       
        telefono: "46578349",       
        sueldo: "4567.89",
        dni: 4567890o }
}

### Test
-tratar de modificar a un usuario de otra empresa✅
-un trabajdor no puede modificar a nadie✅
-token invalido✅
-introducir 1 solo campo para actualizar✅

----------------------------------------------------------------------------

## DELETE /deleteUser/:id_usuario
### Descripcion
Eliminar usuarios(solo propietarios o admins)

### token

### Respuesta OK (200)

### Test
-tratar de eliminar a un usuario de otra empresa✅
-un trabajdor no puede eliminar a nadie✅
-token invalido✅