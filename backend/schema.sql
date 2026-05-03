-- 1. Tabla de Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    rol VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Tabla de Empresas
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    isactive BOOLEAN DEFAULT TRUE
);

-- 3. Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    verification_code VARCHAR(100),
    code_expire_at TIMESTAMP,
    rol_id INTEGER REFERENCES roles(id),
    password_changed BOOLEAN DEFAULT FALSE,
    dni VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    sueldo DECIMAL(10, 2),
    verified BOOLEAN DEFAULT FALSE
);

-- 4. Tabla Intermedia: Usuarios - Empresas
CREATE TABLE usuarios_empresas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    init_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, empresa_id)
);

-- 5. Tabla de Turnos
CREATE TABLE turnos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT TRUE
);

-- 6. Tabla Intermedia: Usuarios - Turnos
CREATE TABLE usuarios_turnos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    turno_id INTEGER REFERENCES turnos(id) ON DELETE CASCADE
);

-- 7. Tabla de Fichajes
CREATE TABLE fichajes (
    id SERIAL PRIMARY KEY,
    hora_inicio TIMESTAMP NOT NULL,
    hora_fin TIMESTAMP,
    fecha DATE NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE
);

-- 8. Tabla de Vacaciones
CREATE TABLE vacaciones (
    id SERIAL PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'pendiente'
);

-- 9. Tabla de Recetas
CREATE TABLE recetas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    ingredientes TEXT NOT NULL,
    elaboracion TEXT NOT NULL,
    montaje TEXT,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE
);
