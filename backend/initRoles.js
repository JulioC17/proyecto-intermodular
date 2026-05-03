require('dotenv').config();
const pool = require('./src/database/conection');

const initRoles = async () => {
    try {
        console.log("Comprobando e insertando Roles Base en la base de datos...");
        
        const roles = [
            { id: 1, rol: 'propietario' },
            { id: 2, rol: 'administrador' },
            { id: 3, rol: 'trabajador' }
        ];

        for (let r of roles) {
            const exist = await pool.query("SELECT * FROM roles WHERE id = $1", [r.id]);
            
            if (exist.rows.length === 0) {
                await pool.query("INSERT INTO roles (id, rol) VALUES ($1, $2)", [r.id, r.rol]);
                console.log(`✅ Rol añadido: ${r.rol} (ID: ${r.id})`);
            } else {
                console.log(`El rol '${r.rol}' ya existía en la base de datos.`);
            }
        }

        console.log("🎉 ¡Configuración de roles completada!");
        process.exit(0);
        
    } catch (error) {
        console.error("❌ Error durante la inserción de roles:", error);
        process.exit(1);
    }
};

initRoles();
