import express from 'express';
import { 
  getAllRecipes, 
  getRecipeById, 
  createRecipe, 
  deleteRecipe, 
  updateRecipe, 
  favoriteRecipe, 
  unfavoriteRecipe 
} from '../controllers/recipeController.js'

const router = express.Router();

router.get('/recipes', getAllRecipes);
router.get('/recipes/:id', getRecipeById);
router.post('/recipes', createRecipe);
router.delete('/recipes/:id', deleteRecipe);
router.put('/recipes/:id', updateRecipe);
router.post('/recipes/:id/favorite', favoriteRecipe); // Add this line
router.post('/recipes/:id/unfavorite', unfavoriteRecipe); // Add this line

export default router;
