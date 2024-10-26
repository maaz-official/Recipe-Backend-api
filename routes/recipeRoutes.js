import express from 'express';
import { 
  getAllRecipes, 
  getRecipeById, 
  createRecipe, 
  deleteRecipe, 
  updateRecipe, 
  favoriteRecipe, 
  unfavoriteRecipe, 
  getFavorites // Import getFavorites function
} from '../controllers/recipeController.js';

const router = express.Router();

router.get('/recipes', getAllRecipes);
router.get('/recipes/:id', getRecipeById);
router.get('/recipes/favorites', getFavorites); // Add this line for fetching all favorited recipes
router.post('/recipes', createRecipe);
router.delete('/recipes/:id', deleteRecipe);
router.put('/recipes/:id', updateRecipe);
router.post('/recipes/:id/favorite', favoriteRecipe);
router.post('/recipes/:id/unfavorite', unfavoriteRecipe);

export default router;
