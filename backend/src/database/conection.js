const {Pool} = require("pg")

let pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

module.exports = pool