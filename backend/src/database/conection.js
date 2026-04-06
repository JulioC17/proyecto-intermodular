const {Pool} = require("pg")

let pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

pool.on("error", (err) => {
    console.error("Error inesperado", err)
})

module.exports = pool