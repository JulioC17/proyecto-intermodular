# AUTH CONTROLLERS

## POST /register
### Descripcion
Registra un nuevo usuario propietario y su empresa

### body (JSON)
{
    "usuario": {
        "nombre": "Juan",           (obligatorio)
        "apellidos": "Rodriguez",   (obligatorio)
        "email": "juan@gmail.com",  (obligatorio)
        "password": "123456",       (obligatorio)
        "dni": "1234567A",          (obligatorio)
        "telefono": "1234567890",    (opcional)
        "sueldo": 1200              (opcional)
    },
    "empresa": {
        "nombre": "Mi Empresa",     (obligatorio)
        "email": "empresa@gmail.com" (opcional)
    }
}

### Respuesta OK (201)
{
    "message": "Usuario creado correctamente, revise su email para verificar"
}

### Test
- Registro correcto ✅
- Falta algún campo obligatorio ✅
- Falta algún campo no obligatorio ✅
- Email duplicado ✅

----------------------------------------------------------------------------

## POST /verify-email
### Descripcion
Verifica al usuario mediante un email y un código de 6 dígitos

### body (JSON)
{
    "email": "juan@gmail.com",       (obligatorio)
    "verificationCode": "123456"     (obligatorio, 6 caracteres)
}

### Respuesta OK (200)
{
    "message": "Usuario verificado correctamente"
}

### Test
- Usuario se verifica correctamente ✅
- Envío correctamente el email ✅
- Expiración del código ✅

----------------------------------------------------------------------------

## POST /login
### Descripcion
Permite loguear al usuario mediante email y password. Si es el primer login de un trabajador, devuelve un token temporal.

### body (JSON)
{
   "email": "juan@gmail.com", (obligatorio)
   "password": "123456"       (obligatorio)
}

### Respuesta OK (200)
{
    "message": "Login correcto",
    "token": "...",
    "user": {
        "id": 1,
        "nombre": "Juan",
        "apellidos": "Rodriguez",
        "email": "juan@gmail.com",
        "rol": 1
    }
}

### Respuesta Primer Login (200)
{
    "message": "Debes reestablecer tu contraseña",
    "tempToken": "...",
    "user": {
        "id": 2,
        "nombre": "Pepito",
        "rol": 3
    }
}

### Test
- Usuario Loguea con credenciales correctas ✅
- Usuario loguea con credenciales incorrectas ✅
- Enviar petición sin algún campo ✅

----------------------------------------------------------------------------

## POST /resend
### Descripcion
Envía un nuevo código de verificación por email al usuario no verificado

### body (JSON)
{
    "email": "juan@gmail.com" (obligatorio)
}

### Respuesta OK (200)
{
    "message": "Ha sido enviado un nuevo codigo de verificacion"
}

### Test
- Enviar nuevo código ✅
- Introducir email incorrecto ✅
- Usuario ya verificado ✅

----------------------------------------------------------------------------

## POST /requestPasswordReset
### Descripcion
Solicitud para recuperar la contraseña mediante un código enviado al email

### body (JSON)
{
    "email": "juan@gmail.com" (obligatorio)
}

### Respuesta OK (200)
{
    "message": "Mensaje de recuperacion enviado"
}

### Test
- Envío de código de recuperación ✅
- Introducir correo que no existe ✅

----------------------------------------------------------------------------

## POST /resetPassword
### Descripcion
Ejecución del cambio de contraseña usando el código de recuperación

### body (JSON)
{
    "email": "juan@gmail.com",    (obligatorio)
    "newPassword": "nueva_pass",  (obligatorio, min 6)
    "recoveryCode": "123456"      (obligatorio, 6 caracteres)
}

### Respuesta OK (200)
{
    "message": "Cuenta recuperada con exito"
}

### Test
- Enviar body sin algún campo ✅
- Enviar código erróneo ✅
- Código expirado ✅

----------------------------------------------------------------------------

# empresasControllers

## POST /createCompany
### Descripcion
Crea una nueva empresa asociada al usuario (Propietario/Admin)

### Token
### body (JSON)
{
    "nombre": "Bocatería",           (obligatorio)
    "email": "bocateria@gmail.com"   (opcional)
}

### Respuesta OK (201)
{
    "message": "Empresa creada correctamente",
    "company": {
        "id": 1,
        "nombre": "Bocatería"
    }
}

### Test
- Enviar campos obligatorios faltantes ✅
- Enviar campos opcionales faltantes ✅
- Probar un token expirado ✅

----------------------------------------------------------------------------

## GET /viewCompany
### Descripcion
Lista todas las empresas asociadas al usuario autenticado

### Token

### Respuesta OK (200)
{
    "message": "Datos recuperados correctamente",
    "companys": [ { "id": 1, "nombre": "Bocatería" } ]
}

### Test
- Token expirado ✅
- Token correcto ✅

----------------------------------------------------------------------------

## PUT /updateCompany/:id_empresa
### Descripcion
Edita los datos de una empresa específica

### Token
### Params
- id_empresa (obligatorio, entero)

### body (JSON)
{
    "nombre": "Bocatería Modificada", (opcional)
    "email": "nuevo@gmail.com"        (opcional)
}

### Respuesta OK (200)
{
    "message": "Empresa modificada correctamente",
    "update": { "id": 2, "nombre": "Bocatería Modificada" }
}

### Test
- Token expirado ✅
- Enviar sin datos en el body ✅
- Editar empresa ajena ✅

----------------------------------------------------------------------------

## DELETE /deleteCompany/:id_empresa
### Descripcion
Elimina una empresa (desactivación lógica o física según implementación)

### Token
### Params
- id_empresa (obligatorio, entero)

### Respuesta OK (200)
{
    "message": "Empresa eliminada correctamente",
    "empresa": "Bocatería"
}

### Test
- Token válido ✅
- Eliminar empresa ajena ✅
- ID no válido ✅

----------------------------------------------------------------------------

## POST /changeCompany/:id_usuario
### Descripcion
Cambia a un trabajador de una empresa a otra

### Token
### Params
- id_usuario (obligatorio, entero)

### body (JSON)
{
    "companyTargetId": 2 (obligatorio, entero)
}

### Respuesta OK (200)
{
    "message": "Cambio de empresa del usuario correcto"
}

### Test
- Token inválido ✅
- Cambiar usuario que no pertenece a la empresa actual ✅
- Empresa destino no válida ✅

----------------------------------------------------------------------------

# usuariosControllers

## POST /createUser
### Descripcion
Crea un nuevo usuario de tipo "Trabajador" y le asigna una empresa

### Token
### body (JSON)
{
    "nombre": "Pepito",            (obligatorio)
    "apellidos": "Santos",        (obligatorio)
    "email": "pepito@gmail.com",  (obligatorio)
    "id_empresa": 2,               (obligatorio, entero)
    "dni": "12345678Z",           (obligatorio, 9 caracteres)
    "telefono": "123456789",      (opcional)
    "sueldo": 1500.50             (opcional, 2 decimales)
}

### Respuesta OK (200)
{
    "message": "Usuario creado correctamente...",
    "nombre": "Pepito",
    "email": "pepito@gmail.com",
    "id_empresa": 2
}

### Test
- Token inválido ✅
- Campos obligatorios faltantes ✅
- DNI con formato incorrecto ✅

----------------------------------------------------------------------------

## POST /firstLogin
### Descripcion
Fuerza al usuario a cambiar su contraseña temporal en el primer acceso

### Token Temporal
### body (JSON)
{
    "newPassword": "nuevaPassword123" (obligatorio, min 6)
}

### Respuesta OK (200)
{
    "message": "Contraseña reestablecida correctamente"
}

### Test
- Token temporal inválido ✅
- Password demasiado corta ✅

----------------------------------------------------------------------------

## GET /me
### Descripcion
Obtiene el perfil completo del usuario autenticado

### Token

### Respuesta OK (200)
{
    "user": { ... datos del usuario ... }
}

### Test
- Token inválido ✅
- Recuperación correcta de datos ✅

----------------------------------------------------------------------------

## GET /getAll/:empresa_id
### Descripcion
Obtiene la lista de todos los trabajadores de una empresa (solo Propietarios/Admins)

### Token
### Params
- empresa_id (obligatorio, entero)

### Respuesta OK (200)
{
    "data": [ ... lista de usuarios ... ],
    "requester": "Nombre"
}

### Test
- Token de un trabajador (debe fallar) ✅
- Empresa que no pertenece al solicitante ✅

----------------------------------------------------------------------------

## PUT /updateUser/:id_usuario
### Descripcion
Edita la información de un usuario (solo Propietarios/Admins)

### Token
### Params
- id_usuario (obligatorio, entero)

### body (JSON)
{
    "email": "pedro@gmail.com",   (opcional)
    "nombre": "Pedro",            (opcional)
    "apellidos": "Gonzalo",       (opcional)
    "telefono": "46578349",       (opcional)
    "sueldo": 4567.89             (opcional)
}

### Respuesta OK (200)
{
    "message": "Usuario modificado con exito",
    "Actualizacion": { ... datos actualizados ... }
}

### Test
- Modificar usuario de otra empresa ✅
- Trabajador intentando modificar ✅
- Token inválido ✅

----------------------------------------------------------------------------

## DELETE /deleteUser/:id_usuario
### Descripcion
Elimina a un usuario (solo Propietarios)

### Token
### Params
- id_usuario (obligatorio, entero)

### Respuesta OK (200)
{
    "message": "Usuario eliminado con exito",
    "userDeleted": { "nombre": "...", "apellidos": "..." }
}

### Test
- Tratar de eliminar a un usuario de otra empresa ✅
- Eliminar su propio usuario (debe fallar) ✅
- Token inválido ✅

----------------------------------------------------------------------------

# fichajesControllers

## POST /checkIn
### Descripcion
Registra la entrada (fichaje) de un trabajador

### Token

### Respuesta OK (200)
{
    "message": "Usuario fichado correctamente",
    "data": { "id": 1, "hora_inicio": "08:00:00", "fecha": "...", ... }
}

### Test
- Propietario intentando fichar (no permitido) ✅
- Ya tiene un fichaje abierto ✅
- Token inválido ✅

----------------------------------------------------------------------------

## PUT /checkOut
### Descripcion
Registra la salida (desfichaje) de un trabajador

### Token

### Respuesta OK (200)
{
    "message": "Has desfichado correctamente",
    "data": { "id": 1, "hora_fin": "16:00:00", ... }
}

### Test
- No tiene fichajes abiertos ✅
- Token inválido ✅

----------------------------------------------------------------------------

## GET /myWorkedTime
### Descripcion
Consulta el historial de horas trabajadas del usuario

### Token
### Query
- from (opcional, ISO Date YYYY-MM-DD)
- to (opcional, ISO Date YYYY-MM-DD)

### Respuesta OK (200)
{
    "data": [ ... lista de fichajes cerrados ... ]
}

### Test
- Filtro por fecha correcto ✅
- Sin fichajes registrados ✅

----------------------------------------------------------------------------

## GET /getAllWorkedTime
### Descripcion
Consulta el historial de fichajes de todos los trabajadores de la empresa (Admins/Props)

### Token
### Query
- id_empresa (opcional, entero)
- from (opcional, ISO Date YYYY-MM-DD)
- to (opcional, ISO Date YYYY-MM-DD)

### Respuesta OK (200)
{
    "data": [ ... lista de fichajes de empleados ... ]
}

### Test
- Visualizar otra empresa ajena ✅
- Trabajador intentando ver datos globales ✅

----------------------------------------------------------------------------

## GET /actualTime
### Descripcion
Obtiene el fichaje actualmente abierto del usuario

### Token

### Respuesta OK (200)
{
    "data": { ... fichaje abierto o null ... }
}

----------------------------------------------------------------------------

## GET /lastWorkedTime
### Descripcion
Obtiene los últimos 5 días de fichajes cerrados del usuario

### Token

### Respuesta OK (200)
{
    "data": [ ... últimos 5 registros ... ]
}

----------------------------------------------------------------------------

# turnosControllers

## POST /createShift
### Descripcion
Crea un nuevo tipo de turno para una empresa

### Token
### body (JSON)
{
    "nombre": "Mañana",           (obligatorio)
    "hora_inicio": "08:00:00",   (obligatorio, HH:MM:SS)
    "hora_fin": "16:00:00",      (obligatorio, HH:MM:SS)
    "empresa_id": 1               (obligatorio, entero)
}

### Respuesta OK (201)
{
    "message": "Turno creado correctamente",
    "turno": { ... }
}

### Test
- Formato de hora incorrecto ✅
- Empresa no propia ✅

----------------------------------------------------------------------------

## GET /getShifts/:empresa_id
### Descripcion
Lista todos los turnos activos de una empresa

### Token
### Params
- empresa_id (obligatorio, entero)

### Respuesta OK (200)
{
    "turnos": [ ... ]
}

----------------------------------------------------------------------------

## PUT /updateShift/:empresa_id/:turno_id
### Descripcion
Modifica un turno existente

### Token
### Params
- empresa_id (obligatorio)
- turno_id (obligatorio)

### body (JSON)
{
    "nombre": "Mañana Editado", (opcional)
    "hora_inicio": "07:30:00",  (opcional)
    "hora_fin": "15:30:00"     (opcional)
}

### Test
- Hora inicio posterior a fin ✅
- Turno inexistente ✅

----------------------------------------------------------------------------

## PUT /deleteShift/:empresa_id/:turno_id
### Descripcion
Desactiva (eliminación lógica) un turno

### Params
- empresa_id, turno_id

### Respuesta OK (200)
{
    "message": "Turno eliminado con exito"
}

----------------------------------------------------------------------------

## POST /assign/:empresa_id/:turno_id
### Descripcion
Asigna un turno a un usuario en una fecha específica

### Params
- empresa_id, turno_id
### body (JSON)
{
    "usuario_id": 2,      (obligatorio)
    "fecha": "2024-06-10" (obligatorio, >= hoy)
}

### Test
- Fecha pasada ✅
- Usuario ya tiene ese turno asignado ✅

----------------------------------------------------------------------------

## DELETE /remove/:empresa_id/:turno_id/:usuario_id/:fecha
### Descripcion
Elimina la asignación de un turno a un usuario

### Params
- empresa_id, turno_id, usuario_id, fecha

### Respuesta OK (200)
{
    "message": "Horario Eliminado con exito del usuario"
}

----------------------------------------------------------------------------

## GET /schedule/me
### Descripcion
Consulta los turnos asignados al usuario en un rango de fechas

### Token
### Query
- weekStart (obligatorio, fecha)
- weekEnds (obligatorio, fecha)

### Respuesta OK (200)
{
    "message": "Horario recuperado con exito",
    "schedule": [ ... ]
}

----------------------------------------------------------------------------

## GET /scheduleWeek/:empresa_id
### Descripcion
Consulta el cuadrante de turnos de todos los empleados en un rango (Admins)

### Params
- empresa_id
### Query
- weekStart, weekEnds

----------------------------------------------------------------------------

# vacacionesControllers

## POST /requestHollidays
### Descripcion
Solicita un periodo de vacaciones

### Token
### body (JSON)
{
    "fecha_inicio": "2024-07-01", (obligatorio, >= hoy)
    "fecha_fin": "2024-07-15"    (obligatorio, >= inicio)
}

### Respuesta OK (201)
{
    "message": "Solicitud creada correctamente"
}

### Test
- Solapamiento con vacaciones ya aprobadas ✅
- Fecha de fin anterior a inicio ✅

----------------------------------------------------------------------------

## GET /getHollidays
### Descripcion
Consulta las solicitudes personales de vacaciones

### Respuesta OK (200)
{ "data": [ ... ] }

----------------------------------------------------------------------------

## GET /getAllHollidays
### Descripcion
Lista todas las solicitudes de vacaciones de la empresa (Admins)

### Token

----------------------------------------------------------------------------

## PUT /handdleHollidays/:vacaciones_id
### Descripcion
Aprueba o deniega una solicitud de vacaciones

### Params
- vacaciones_id
### body (JSON)
{
    "estado": true (obligatorio, boolean)
}

### Test
- Intentar aprobar vacaciones que ya se solapan con otras aprobadas ✅

----------------------------------------------------------------------------

# recetasControllers

## POST /createRecipe/:empresa_id
### Descripcion
Crea una nueva receta para la empresa

### Params
- empresa_id
### body (JSON)
{
    "nombre": "Tortilla de Patatas", (obligatorio, max 100)
    "ingredientes": "Patatas, huevos...", (obligatorio, max 250)
    "elaboracion": "Cortar patatas...",  (obligatorio, max 500)
    "montaje": "Servir en plato"          (opcional, max 250)
}

### Respuesta OK (201)
{ "message": "Receta creada con éxito", "receta": { ... } }

----------------------------------------------------------------------------

## GET /getRecipes/:empresa_id
### Descripcion
Lista las recetas de una empresa, con filtro opcional por nombre

### Params
- empresa_id
### Query
- words (opcional, texto de búsqueda)

----------------------------------------------------------------------------

## PUT /updateRecipe/:empresa_id/:receta_id
### Descripcion
Modifica una receta existente

### Params
- empresa_id, receta_id
### body (JSON)
{ ... campos opcionales ... }

----------------------------------------------------------------------------

## DELETE /deleteRecipe/:empresa_id/:receta_id
### Descripcion
Elimina una receta de la empresa

### Params
- empresa_id, receta_id

----------------------------------------------------------------------------

# roleControllers

## POST /roles/
### Descripcion
Crea un nuevo rol en la base de datos (Nota: Generalmente ya están predefinidos)

### body (JSON)
{
    "rol": "Nombre del Rol" (obligatorio)
}

### Respuesta OK (201)
{
    "id": 4,
    "rol": "Nombre del Rol"
}

----------------------------------------------------------------------------

## PUT /roles/changeRole/:usuario_id
### Descripcion
Cambia el rol de un usuario (solo Propietarios)

### Token
### Params
- usuario_id (obligatorio, entero)

### body (JSON)
{
    "newRole": 2 (obligatorio, entero: 2 para Admin, 3 para Trabajador)
}

### Respuesta OK (200)
{
    "message": "Rol de usuario cambiado con exito",
    "data": { "nombre": "...", "apellidos": "...", "rol_id": 2 }
}

### Test
- Cambiar a un rol no permitido (ej. 1 o 4) ✅
- Cambiar rol de sí mismo (debe fallar) ✅
- Token de un Administrador (debe fallar) ✅