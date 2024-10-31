import express from 'express';
import {
    createTag,
    getAllTags,
    updateTag,
    deleteTag,
} from '../controllers/tagController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Tag routes
router.post('/', createTag); // Create a tag (protected, e.g., for admin only)
router.get('/', getAllTags); // Get all tags
router.put('/:tagId', protect, updateTag); // Update a tag (protected)
router.delete('/:tagId', protect, deleteTag); // Delete a tag (protected)

export default router;
