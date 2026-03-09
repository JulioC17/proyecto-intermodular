const express = require("express")
const dotenv = require("dotenv").config()
const cors = require("cors")
const roleRoutes = require("./src/routes/roleRoutes")
const authRoutes = require("./src/routes/authRoutes")
const empresasRoutes = require("./src/routes/empresasRoutes")
const usuariosRoutes = require("./src/routes/usuariosRoutes")
const turnosRoutes = require("./src/routes/turnosRoutes")
const vacacionesRoutes = require("./src/routes/vacacionesRoutes")
const fichajesRoutes = require("./src/routes/fichajesRoutes")
const recetasRoutes = require("./src/routes/recetasRoutes")

const app = express()
const PORT = process.env.PORT || 5001

app.use(express.json())
app.use(cors())

app.use("/roles", roleRoutes)
app.use("/auth", authRoutes)
app.use("/company", empresasRoutes)
app.use("/users", usuariosRoutes)
app.use("/turnos", turnosRoutes)
app.use("/hollidays", vacacionesRoutes)
app.use("/fichajes", fichajesRoutes)
app.use("/recetas", recetasRoutes)

app.get("/ping", (req, res) => {
    res.json({success:true, message: "Bcakend conectado correctamente"})//endpoint para testear conexion con el front
})



app.use((req, res) => {
    return res.status(404).json({
        error: "Nada interesante en este sitio"
    })
})

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
