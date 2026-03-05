const pool = require("../database/conection")
const {ROLES} = require("../utils/roles")

const createRecipe = async (req, res) => {
    const {id, rol_id} = req.user
    const {nombre, ingredientes, elaboracion, montaje} = req.body
    const {empresa_id} =req.params

    if(Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})
    }

    try{

        const checkCompany = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
            [id, empresa_id]
        )

        if(checkCompany.rows.length === 0){
            return res.status(403).json({error: "No puedes hacer modificaciones en esta empresa"})
        }

        const createdRecipe = await pool.query(
            "INSERT INTO recetas(nombre, ingredientes, elaboracion, montaje, empresa_id) VALUES($1, $2, $3, $4, $5) RETURNING *",
            [nombre, ingredientes, elaboracion, montaje, empresa_id]
        )

        return res.status(201).json({
            message: "Receta creada con éxito",
            receta: createdRecipe.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})
    }
}

const getRecipes = async (req, res) => {
    const {id} = req.user
    const {empresa_id} = req.params
    const {words} = req.query

    try{

        const checkCompany = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
            [id, empresa_id]
        )

        if(checkCompany.rows.length === 0){
            return res.status(403).json({error: "No puedes leer información de esta empresa"})
        }

        let query = "SELECT nombre, ingredientes, elaboracion, montaje FROM recetas WHERE empresa_id = $1"
        let values = [empresa_id]

        if(words){
            query += " AND nombre ILIKE $2"
            values.push(`%${words}%`)
        }

        query += " ORDER BY nombre ASC"

        const viewRecipes = await pool.query(query, values)
        if(viewRecipes.rows.length === 0){
            return res.status(404).json({error: "No hay recetas"})
        }

        return res.status(200).json({data: viewRecipes.rows})


    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

const updateRecipes = async (req, res) => {
    const {id, rol_id} = req.user
    const {nombre, ingredientes, elaboracion, montaje} = req.body
    const {empresa_id, receta_id} =req.params

    if(Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})
    }

    try{

        if(!nombre && !ingredientes && !elaboracion && !montaje){
            return res.status(200).json({message: "No se han hecho modificaciones"})
        }

        const checkCompany = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
            [id, empresa_id]
        )

        if(checkCompany.rows.length === 0){
            return res.status(403).json({error: "No puedes hacer modificaciones en esta empresa"})
        }

        const checkRecipe = await pool.query(
            "SELECT 1 FROM recetas WHERE id = $1 AND empresa_id = $2",
            [receta_id, empresa_id]
        )

        if(checkRecipe.rows.length === 0){
            return res.status(403).json({error: "No puedes hacer modificaciones de esta receta"})
        }

        let query = []
        let values = []
        let countPlaceholders = 1

        if(nombre){
            query.push(` nombre = $${countPlaceholders}`)
            values.push(nombre)
            countPlaceholders++
        }

        if(ingredientes){
            query.push(` ingredientes = $${countPlaceholders}`)
            values.push(ingredientes)
            countPlaceholders++
        }

        if(elaboracion){
            query.push(` elaboracion = $${countPlaceholders}`)
            values.push(elaboracion)
            countPlaceholders++
        }

        if(montaje){
            query.push(` montaje = $${countPlaceholders}`)
            values.push(montaje)
            countPlaceholders++
        }
        values.push(receta_id)
        const finalQuery = `UPDATE recetas SET ${query.join(", ")} WHERE id = $${countPlaceholders} RETURNING *`

        const updatedRecipe = await pool.query(finalQuery, values)

        return res.status(200).json({
            message: "Receta modificada correctamente",
            receta: updatedRecipe.rows[0]
        })
        

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})
    }
}

const deleteRecipes = async(req, res) => {
    const {id, rol_id} = req.user
    const {empresa_id, receta_id} =req.params

    if(Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})
    }

    try{

        const checkCompany = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",
            [id, empresa_id]
        )

        if(checkCompany.rows.length === 0){
            return res.status(403).json({error: "No puedes hacer modificaciones en esta empresa"})
        }

        const checkRecipe = await pool.query(
            "SELECT 1 FROM recetas WHERE id = $1 AND empresa_id = $2",
            [receta_id, empresa_id]
        )

        if(checkRecipe.rows.length === 0){
            return res.status(403).json({error: "No puedes hacer modificaciones de esta receta"})
        }

        const deletedRecipe = await pool.query(
            "DELETE FROM recetas WHERE id = $1 AND empresa_id = $2 RETURNING *",
            [receta_id, empresa_id]
        )

        return res.status(200).json({
            message: "Receta eliminada correctamente",
            data: deletedRecipe.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error en el servidor"})
    }
}

module.exports = {createRecipe, getRecipes, updateRecipes, deleteRecipes}