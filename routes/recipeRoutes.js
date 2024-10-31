import express from 'express';
import { 
  getAllRecipes, 
  getRecipeById, 
  createRecipe, 
  deleteRecipe, 
  updateRecipe, 
} from '../controllers/recipeController.js';

const router = express.Router();

router.get('/recipes', getAllRecipes);
router.get('/recipes/:id', getRecipeById);
router.post('/recipes', createRecipe);
router.delete('/recipes/:id', deleteRecipe);
router.put('/recipes/:id', updateRecipe);
export default router;
