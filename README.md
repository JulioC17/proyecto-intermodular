# HosTech - Sistema de Gestión Empresarial

## 1. Descripción general del sistema
**HosTech** es una plataforma integral de gestión enfocada originalmente al sector empresarial y de la hostelería. Su principal objetivo es conectar a propietarios, administradores y trabajadores en un entorno centralizado para agilizar tareas cotidianas. Permite la administración de múltiples empresas bajo un mismo propietario, la gestión integral de personal, la planificación dinámica de horarios, el registro de jornadas laborales (fichajes), el control de vacaciones y hasta la elaboración de un recetario interno por empresa. Todo ello accesible a través de una aplicación móvil intuitiva.

## 2. Tecnologías utilizadas

### Frontend (Aplicación Móvil)
- **Framework:** React Native con Expo
- **Navegación:** React Navigation (@react-navigation/native-stack)
- **Cliente HTTP:** Axios
- **Gestión de Estado y Almacenamiento:** React Context API, AsyncStorage
- **Estilos y UI:** StyleSheet, React Native Vector Icons, Linear Gradient

### Backend (API REST)
- **Entorno:** Node.js
- **Framework:** Express.js
- **Base de Datos:** PostgreSQL (con la librería `pg`)
- **Autenticación:** JSON Web Tokens (JWT) y Bcryptjs para el hashing de contraseñas.
- **Validaciones:** Joi
- **Mailing:** SendGrid API (`@sendgrid/mail`) para correos de verificación y credenciales.
- **Otros:** Autogeneración de contraseñas seguras (`generate-password`).

## 3. Arquitectura del proyecto
El proyecto sigue una arquitectura **Cliente-Servidor**. 
- El **Frontend** es una aplicación móvil nativa (Android/iOS) que interactúa con la API mediante HTTPS y almacena de forma segura el token JWT para mantener la sesión del usuario vigente entre reinicios de la app, manejando el estado global a través de un proveedor de contexto (`AuthProvider`).
- El **Backend** expone una API REST modularizada (arquitectura MVC parcial: Rutas -> Middlewares -> Controladores) que recibe el token JWT en el encabezado de autorización, protegiendo así los endpoints.
- La **Base de Datos** (PostgreSQL) presenta una estructura fuertemente relacional, uniendo usuarios con empresas mediante una tabla intermedia, y trazando dependencias estrictas para turnos, vacaciones, fichajes y recetas vinculadas a entidades de empresas o usuarios según corresponda.

## 4. Funcionalidades principales
- Registro de propietarios y vinculación con su primera empresa de forma automática.
- Gestión multi-empresa (con opciones de cambiar el contexto activo en vivo).
- Gestión e invitación de trabajadores a la plataforma.
- Sistema de primer inicio de sesión para trabajadores con reseteo de contraseña obligatoria.
- Autenticación segura mediante código de 6 dígitos enviado por correo.
- Planificador y creador de turnos parametrizables por empresa.
- Sistema estructurado de fichaje diario para control y traqueo de horas, tanto individual como globalmente.
- Petición de vacaciones y resolución de las mismas (aprobación/rechazo).
- Gestión de recetas asociadas a la empresa para uso de la sección de cocina/hostelería.

## 5. Sistema de roles y permisos
El esquema está fuertemente estructurado en 3 niveles (ROLES_ID):
- **1. Propietario:** Es el único que se auto-registra (Register manual). Tiene poder absoluto: crea/elimina empresas, añade trabajadores, modifica roles de otros usuarios, elimina usuarios y tiene privilegios de solo-lectura sobre módulos donde no opera (No realiza fichaje).
- **2. Administrador:** Trabajador ascendido por un propietario. Puede registrar nuevos trabajadores, modificar sus datos, crear/eliminar tipologías de turnos, asignar turnos a trabajadores, aprobar o denegar solicitudes de vacaciones y visualizar la actividad global de su empresa.
- **3. Trabajador:** Es creado por un Admin o Propietario. Puede visualizar su cuadrante de horario de la semana, fichar y desfichar, ver su resumen de horas personales, solicitar vacaciones, y ver recetas. 

## 6. Flujo de autenticación
- **Registro y Verificación:** Un propietario introduce sus datos y los de su empresa -> Se envía un código numérico (6 dígitos) vía SendGrid al email proporcionado -> Ingresa el código en el endpoint `/verify-email` y su cuenta queda activada.
- **Trabajadores (Primer acceso):** Un superior le crea la cuenta -> El trabajador recibe un correo automatizado indicándole su usuario y una contraseña temporal -> Accede al login normal, pero el backend detecta su estado (`firstLogin`) y emite un "tempToken" -> Es redirigido obligatoriamente a un formulario para poner su nueva clave -> Accede al sistema.
- **Login normal:** Se comprueban credenciales y se genera un token asimétrico JWT.
- **Recuperación de contraseña:** Solicita un reseteo enviando su email, recibe un token numérico nuevo, e ingresa su nueva contraseña junto con el token.
- **Logout:** Eliminación del JWT desde el dispositivo local (AsyncStorage).

## 7. Módulos del sistema

### a) Gestión de trabajadores (`usuariosControllers`)
- Creación de perfiles para empleados.
- Visualización de la plantilla por parte de administradores.
- Modificación de sueldos, contacto o DNI del trabajador, blindado mediante validaciones Joi.

### b) Control de jornadas (`fichajesControllers`)
- Registro de Entrada (`checkIn`) de la hora actual.
- Registro de Salida (`checkOut`) modificando el archivo temporal abierto.
- Cálculo de horas y muestreo personal (últimos 5 días de trabajo o filtrado por fechas desde el frontend).
- Vista administrativa para visualizar todos los empleados de la empresa con filtros activos.

### c) Gestión de turnos (`turnosControllers` - Parte 1)
- Definición de plantillas lógicas para la empresa. Ej: "Mañana (08:00 a 16:00)".
- Posibilidad de modificación temporal (reajuste de horas de un turno).
- Eliminación lógica (`active = false`) para evitar colapso en registros anteriores vinculados al turno.

### d) Asignación de horarios (`turnosControllers` - Parte 2)
- Asignación paramétrica de un `Turno` a un `Usuario` en un `Día` en concreto.
- Re-asignación / Desasignación en caso de errores.
- Emisión del esquema semanal para administradores y para trabajadores.

### e) Vacaciones (`vacacionesControllers`)
- Trámites de inicio (`requestHollidays`) estableciendo fecha inicial y final, que impiden el solapamiento con otras vigentes.
- Trámites administrativos (`handdleHollidays`) donde un Propietario/Admin decide el boolean (True = Aprobada, False = Denegada).
- Tracking de estado desde el lado del trabajador (Aprobado, Pendiente, Denegado).

### f) Recetas (`recetasControllers`)
- Módulo de operaciones (CRUD) pensado para llevar manuales ordenados de la compañía.
- Consta de parámetros: Nombre, ingredientes, elaboración, montaje.

## 8. Estructura de carpetas
```text
codigo-proyecto/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Lógica de negocio (auth, usuarios, turnos, etc)
│   │   ├── database/         # Configuración y conexión PostgreSQL (`conection.js`)
│   │   ├── middleware/       # Protectores de rutas (isAuth, validateSchema)
│   │   ├── routes/           # Mapeo y distribución de endpoints
│   │   ├── schemas/          # Validaciones estructurales implementadas con Joi
│   │   └── utils/            # Funciones helper exportables, enumerables de Roles.
│   ├── package.json          # Dependencias (Express, pg, jsonwebtoken, etc)
│   ├── server.js             # Entrypoint y configuración central API REST
│   └── endpoints.md          # Documentación detallada de peticiones
│
├── frontend/
│   ├── src/ (o estructura local)
│   │   ├── components/       # Elementos reusables (Botones, Inputs, Tarjetas)
│   │   ├── constant/         # Rutas, colores y variables globales
│   │   ├── context/          # Estados globales (`AuthProvider`, `AlertProvider`)
│   │   ├── navigation/       # TabNavigators, StackNavigators
│   │   ├── screens/          # Pantallas por módulo (Login, Dashboard, Fichajes)
│   │   └── services/         # Configuración y llamadas usando Axios (`api.js`)
│   ├── App.js                # Archivo principal de envoltorio y montado.
│   └── package.json          # Dependencias (React Navigation, AsyncStorage, etc)
└── README.md
```

## 9. Variables de entorno necesarias
**Para el Backend (`backend/.env`):**
```env
PORT=3000
DATABASE_URL=postgres://usuario:contraseña@servidor:puerto/base_de_datos
JWT_SECRET=tu_clave_secreta_super_segura
SENDGRID_API_KEY=SG.tu_api_key_de_sendgrid
```

## 10. Instalación del proyecto

1. Clonar el repositorio.
2. **Setup Backend:**
   - Acceder en la terminal a la carpeta `/backend`: `cd backend`
   - Ejecutar la instalación de los paquetes: `npm install`
   - Configurar archivo `.env` según indicaciones.
3. **Setup Frontend:**
   - Acceder en la terminal a la carpeta `/frontend`: `cd frontend`
   - Ejecutar la instalación de los paquetes: `npm install`

## 11. Cómo ejecutar el proyecto

- **Backend:** En el terminal situado sobre `backend`, ejecuta `npm run dev` (Iniciará Nodemon sobre server.js) o `npm start`.
- **Frontend:** En un terminal nuevo sobre `frontend`, ejecuta `npx expo start` (o `npm start`). Puedes escanear el QR con tu móvil físico u hostearlo en un emulador presionando la tecla "a" para Android y la "i" para iOS. *(Asegúrate de cambiar la IP en `services/api.js` localmente si estás usándolo en dispositivo físico).*

## 12. Endpoints principales (Resumen Backend)
*Para ver más en profundidad, recurrir al archivo anexo `endpoints.md` dentro de backend.*

- `POST /api/auth/register` : Creación simultánea de propietario y empresa.
- `POST /api/auth/login` : Login multifuncional (dependiendo del tipo de usuario).
- `POST /api/usuarios/createUser` : Registra trabajador validando rol superior.
- `GET /api/fichajes/actualTime` : Obtiene si el turno se encuentra abierto o cerrado.
- `GET /api/turnos/schedule/me` : Vista individual de trabajo programado para el usuario.
- `PUT /api/vacaciones/handdleHollidays/:id` : Aprobar o rechazar.

## 13. Estado actual del proyecto
El proyecto cuenta con un backend sólidamente levantado y documentado con middlewares de autorización funcionales y con bases de datos estables para dar de alta información de la vida laboral del ecosistema hotelero/hostelero. La estructura de permisos cruza exitosamente entre tres roles muy claros con barreras de seguridad. El frontend, creado en Native mediante Expo, avanza gestionando el ruteo interno a través del estado dinámico del usuario, administrado por el Provider context.

## 14. Mejoras futuras recomendadas
- Implementación de reportes de fichaje en descarga (CSV/PDF) para envío de recursos humanos en el backend.
- Modificar arquitectura lógica de Notificaciones Push con Expo si se requiere informar de un cambio de horario inasistido a un trabajador de manera intrusiva e instantánea.
- Ampliación de tests en el backend haciendo uso de tecnologías como Jest o Supertest para cubrir la seguridad de los controladores individualmente.
- Agregar un módulo de caja, stock o facturación general ligado a cada Empresa.
