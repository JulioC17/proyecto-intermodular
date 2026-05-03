require('dotenv').config(); //
const bcrypt = require('bcryptjs');
const pool = require('./src/database/conection');

const seedDB = async () => {
    try {
        console.log("Iniciando el sembrado de la base de datos...");
        
        // 1. Generamos la contraseña encriptada común para todos: "123456"
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("123456", salt);
        const now = new Date();

        // 2. Crear al PROPIETARIO
        const userQuery = `
            INSERT INTO usuarios (nombre, apellidos, email, password, verified, rol_id, password_changed, dni, telefono, sueldo) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
        `;
        const ownerRes = await pool.query(userQuery, ["Jefe", "Supremo", "jefe@test.com", hashedPassword, true, 1, true, "11111111A", "600111222", 3000]);
        const ownerId = ownerRes.rows[0].id;
        console.log("✅ Propietario creado (jefe@test.com)");

        // 3. Crear una EMPRESA para este propietario
        const companyRes = await pool.query(
            "INSERT INTO empresas (nombre, email) VALUES ($1, $2) RETURNING id",
            ["Restaurante El Test", "contacto@restaurante.com"]
        );
        const companyId = companyRes.rows[0].id;
        console.log("✅ Empresa 'Restaurante El Test' creada");

        // Vincular Propietario con la Empresa
        await pool.query(
            "INSERT INTO usuarios_empresas (usuario_id, empresa_id, init_date) VALUES ($1, $2, $3)",
            [ownerId, companyId, now]
        );

        // 4. Crear al ADMINISTRADOR
        const adminRes = await pool.query(userQuery, ["Admin", "García", "admin@test.com", hashedPassword, true, 2, true, "22222222B", "600222333", 1800]);
        await pool.query("INSERT INTO usuarios_empresas (usuario_id, empresa_id, init_date) VALUES ($1, $2, $3)", [adminRes.rows[0].id, companyId, now]);
        console.log("✅ Administrador creado (admin@test.com)");

        // 5. Crear a los 3 TRABAJADORES
        const workers = [
            { nombre: "Paco", apellidos: "Martínez", email: "paco@test.com", dni: "33333333C", tel: "600333444", sueldo: 1200 },
            { nombre: "María", apellidos: "López", email: "maria@test.com", dni: "44444444D", tel: "600444555", sueldo: 1300 },
            { nombre: "Luis", apellidos: "Sánchez", email: "luis@test.com", dni: "55555555E", tel: "600555666", sueldo: 1250 }
        ];

        for (let w of workers) {
            const workerRes = await pool.query(userQuery, [w.nombre, w.apellidos, w.email, hashedPassword, true, 3, true, w.dni, w.tel, w.sueldo]);
            await pool.query("INSERT INTO usuarios_empresas (usuario_id, empresa_id, init_date) VALUES ($1, $2, $3)", [workerRes.rows[0].id, companyId, now]);
        }
        console.log("✅ 3 Trabajadores creados");

        console.log("🎉 ¡Todo listo! Todos tienen la clave de acceso: 123456");
        process.exit(0);
        
    } catch (error) {
        console.error("❌ Error durante el script:", error);
        process.exit(1);
    }
};

seedDB();
