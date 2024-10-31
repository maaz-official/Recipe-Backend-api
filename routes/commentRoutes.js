import express from 'express';
import {
    createComment,
    getCommentsForRecipe,
    updateComment,
    deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js'; // Ensure the user is authenticated

const router = express.Router();

// Create a new comment on a recipe (protected)
router.post('/', protect, createComment);

// Get all comments for a specific recipe
router.get('/:recipeId', getCommentsForRecipe);

// Update a specific comment (protected)
router.put('/:commentId', protect, updateComment);

// Delete a specific comment (protected)
router.delete('/:commentId', protect, deleteComment);

export default router;
