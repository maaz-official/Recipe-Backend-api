import express from 'express';
import {
    registerStep,
    verifyEmail,
    addAdditionalInfo,
    finalizeRegistration,
    loginUser,
    getProfile,
    unfavoriteRecipe,
    favoriteRecipe,
    guestLogin,
    getUser,
    getFavorites,
    updateUser,
    getUserById
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js'; // Import protect middleware

const router = express.Router();

// User registration and verification
router.post('/register', registerStep);
router.post('/verify-email', verifyEmail);
router.post('/info', addAdditionalInfo);
router.post('/finalize-registration', finalizeRegistration);

// Authentication
router.post('/login', loginUser);
router.post('/guest', guestLogin);

// Profile (Protected Route)
router.get('/profile', protect, getProfile);

// Get and update user profile by ID
router.route('/:id').get(protect, getUser).put(protect, updateUser); 

// Favorite and Unfavorite Recipes (Protected Routes)
router.post('/favorite/:id', protect, favoriteRecipe);       // Favorite a recipe by recipe ID
router.delete('/favorite/:id', protect, unfavoriteRecipe);   // Unfavorite a recipe by recipe ID

// Get Favorites (Protected Route)
router.get('/favorites', protect, getFavorites);             // Get all favorited recipes for the user

// Additional routes
router.get('/user/:id', getUserById); // Route for fetching user by ID (public)

export default router;
