const pool = require("../database/conection")
const {ROLES} = require("../utils/roles")

//contorlador para la creacion de receta
const createRecipe = async (req, res) => {
    const {id, rol_id} = req.user//ontencion de info del token
    const {nombre, ingredientes, elaboracion, montaje} = req.body//datos que insertaremos en la bbdd
    const {empresa_id} =req.params

    if(Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de permisos
    }

    try{

        const checkCompany = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de uqe la empresa a la que se le asociara la receta pertenece al requester
            [id, empresa_id]
        )

        if(checkCompany.rows.length === 0){
            return res.status(403).json({error: "No puedes hacer modificaciones en esta empresa"})
        }

        const createdRecipe = await pool.query(
            "INSERT INTO recetas(nombre, ingredientes, elaboracion, montaje, empresa_id) VALUES($1, $2, $3, $4, $5) RETURNING *",//iinsercion de la receta en la bbdd
            [nombre, ingredientes, elaboracion, montaje, empresa_id]
        )

        return res.status(201).json({
            message: "Receta creada con éxito",//respuesta todo ok
            receta: createdRecipe.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error:"Error del servidor"})//maanejo de errores
    }
}

//controlador para visualizar las recetas
const getRecipes = async (req, res) => {
    const {id} = req.user//info del token
    const {empresa_id} = req.params//empresa de la cual queremos visualizar las recetas
    const {words} = req.query//query dinamica para filtrar por concatenacion de letras

    try{

        const checkCompany = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de que el usuario pertence a la empresa de la cual quiere ver las recetas
            [id, empresa_id]
        )

        if(checkCompany.rows.length === 0){
            return res.status(403).json({error: "No puedes leer información de esta empresa"})
        }

        //query dinamica paara buscar por palabras clave en el nombre de la receta
        let query = "SELECT nombre, ingredientes, elaboracion, montaje, id FROM recetas WHERE empresa_id = $1"
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

        return res.status(200).json({data: viewRecipes.rows})//respuesta todo ok


    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de errores
    }
}

//controlador para modificar recetas
const updateRecipes = async (req, res) => {
    const {id, rol_id} = req.user//obtencion de info del token
    const {nombre, ingredientes, elaboracion, montaje} = req.body//datos posibles para actualizar
    const {empresa_id, receta_id} =req.params//empresa y receta que se modificara

    if(Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de permisos
    }

    try{

        if(!nombre && !ingredientes && !elaboracion && !montaje){
            return res.status(200).json({message: "No se han hecho modificaciones"})//comprobacion de que todos los campos no vengan vacios al mismo tiempo, de ser asi se devolvera respuesta automatica "no se hicieron modificaciones"
        }

        const checkCompany = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de que la empresa pertence al requester
            [id, empresa_id]
        )

        if(checkCompany.rows.length === 0){
            return res.status(403).json({error: "No puedes hacer modificaciones en esta empresa"})
        }

        const checkRecipe = await pool.query(
            "SELECT 1 FROM recetas WHERE id = $1 AND empresa_id = $2",//comprobacion de que la receta pertenece a la empresa
            [receta_id, empresa_id]
        )

        if(checkRecipe.rows.length === 0){
            return res.status(403).json({error: "No puedes hacer modificaciones de esta receta"})
        }

        //variables dinamicas para cambiar solo el/los campos que quiera el usuario
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

        const updatedRecipe = await pool.query(finalQuery, values)//actualizacion de la bbdd

        return res.status(200).json({
            message: "Receta modificada correctamente",//respuesta todo ok
            receta: updatedRecipe.rows[0]
        })
        

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error del servidor"})//manejo de errores
    }
}

//controlador para eliminar recetas
const deleteRecipes = async(req, res) => {
    const {id, rol_id} = req.user//info del token
    const {empresa_id, receta_id} =req.params//parametros necesarios para hacer la eliminacion

    if(Number(rol_id) === ROLES.TRABAJADOR){
        return res.status(403).json({error: "No tienes permisos"})//comprobacion de permisos
    }

    try{

        const checkCompany = await pool.query(
            "SELECT 1 FROM usuarios_empresas WHERE usuario_id = $1 AND empresa_id = $2",//comprobacion de que la empresa pertence al requester
            [id, empresa_id]
        )

        if(checkCompany.rows.length === 0){
            return res.status(403).json({error: "No puedes hacer modificaciones en esta empresa"})
        }

        const checkRecipe = await pool.query(
            "SELECT 1 FROM recetas WHERE id = $1 AND empresa_id = $2",//comprobacion de que la receta pertence a la empresa
            [receta_id, empresa_id]
        )

        if(checkRecipe.rows.length === 0){
            return res.status(403).json({error: "No puedes hacer modificaciones de esta receta"})
        }

        const deletedRecipe = await pool.query(
            "DELETE FROM recetas WHERE id = $1 AND empresa_id = $2 RETURNING *",//eliminacion de la bbdd
            [receta_id, empresa_id]
        )

        return res.status(200).json({
            message: "Receta eliminada correctamente",//respuesta todo ok
            data: deletedRecipe.rows[0]
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({error: "Error en el servidor"})//manejo de errores
    }
}

module.exports = {createRecipe, getRecipes, updateRecipes, deleteRecipes}