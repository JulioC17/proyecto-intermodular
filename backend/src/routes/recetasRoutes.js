const express = require("express")
const isAuth = require("../middleware/isAuth")
const validateSchema = require("../middleware/validateSchema")
const {createRecipeSchema, createRecipeSchemaParams, getRecipesSchemaParams, getRecipesSchemaQuery, updateRecipesSchema, updateRecipesSchemaParams, deleteRecipesSchemaParams} = require("../schemas/recetasSchemas")
const{createRecipe, getRecipes, updateRecipes, deleteRecipes} = require("../controllers/recetasControllers")

const router = express.Router()

router.post("/createRecipe/:empresa_id", isAuth, validateSchema(createRecipeSchemaParams, "params"), validateSchema(createRecipeSchema), createRecipe)

router.get("/getRecipes/:empresa_id", isAuth, validateSchema(getRecipesSchemaParams, "params"), validateSchema(getRecipesSchemaQuery, "query"), getRecipes)

router.put("/updateRecipe/:empresa_id/:receta_id", isAuth, validateSchema(updateRecipesSchemaParams, "params"), validateSchema(updateRecipesSchema), updateRecipes)

router.delete("/deleteRecipe/:empresa_id/:receta_id", isAuth,validateSchema(deleteRecipesSchemaParams, "params"), deleteRecipes)

module.exports = router