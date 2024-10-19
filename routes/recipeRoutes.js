// src/routes/recipeRoutes.js
import express from 'express';
import { getAllRecipes, getRecipeById, createRecipe } from '../controllers/recipeController.js';

const router = express.Router();

// Route to get all recipes
router.get('/', getAllRecipes);

// Route to get a specific recipe by ID
router.get('/:id', getRecipeById);

// Route to create a new recipe
router.post('/', createRecipe);

export default router;
