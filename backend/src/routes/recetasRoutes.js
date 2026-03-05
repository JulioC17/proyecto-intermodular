const express = require("express")
const isAuth = require("../middleware/isAuth")
const validateSchema = require("../middleware/validateSchema")
const {createRecipeSchema, createRecipeSchemaParams, getRecipesSchemaParams, getRecipesSchemaQuery, updateRecipesSchema, updateRecipesSchemaParams, deleteRecipesSchemaParams} = require("../schemas/recetasSchemas")
const{createRecipe, getRecipes, updateRecipes, deleteRecipes} = require("../controllers/recetasControllers")

const router = express.Router()

router.post("/createRecipe/:empresa_id", isAuth, validateSchema(createRecipeSchemaParams, "params"), validateSchema(createRecipeSchema), createRecipe)//ruta para crear una receta

router.get("/getRecipes/:empresa_id", isAuth, validateSchema(getRecipesSchemaParams, "params"), validateSchema(getRecipesSchemaQuery, "query"), getRecipes)//ruta para ver todas las recetas

router.put("/updateRecipe/:empresa_id/:receta_id", isAuth, validateSchema(updateRecipesSchemaParams, "params"), validateSchema(updateRecipesSchema), updateRecipes)//ruta paara modificar una receta

router.delete("/deleteRecipe/:empresa_id/:receta_id", isAuth,validateSchema(deleteRecipesSchemaParams, "params"), deleteRecipes)//ruta para eliminar un receta

module.exports = router