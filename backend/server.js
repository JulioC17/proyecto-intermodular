const express = require("express")
const dotenv = require("dotenv").config()
const cors = require("cors")
const roleRoutes = require("./src/routes/roleRoutes")
const authRoutes = require("./src/routes/authRoutes")
const empresasRoutes = require("./src/routes/empresasRoutes")
const usuariosRoutes = require("./src/routes/usuariosRoutes")

const app = express()
const PORT = process.env.PORT || 5001

app.use(express.json())
app.use(cors())

app.use("/roles", roleRoutes)
app.use("/auth", authRoutes)
app.use("/company", empresasRoutes)
app.use("/users", usuariosRoutes)



app.use((req, res) => {
    return res.status(404).json({
        error: "Nada interesante en este sitio"
    })
})

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
