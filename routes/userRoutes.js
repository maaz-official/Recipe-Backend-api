import express from 'express';
import {
    registerStep,
    verifyEmail,
    addAdditionalInfo,
    finalizeRegistration,
    loginUser,
    getProfile,
    addFavoriteRecipe,
    removeFavoriteRecipe, // Added unfavorite function
    guestLogin,
    getUser,
    updateUser
} from '../controllers/userController.js';

const router = express.Router();

// User registration and verification
router.post('/register', registerStep);
router.post('/verify-email', verifyEmail);
router.post('/info', addAdditionalInfo);
router.post('/finalize-registration', finalizeRegistration);

// Authentication
router.post('/login', loginUser);
router.post('/guest', guestLogin);

// Profile
router.get('/profile', getProfile);
router.route('/:id').get(protect, getUser).put(protect, updateUser);

// Favorite recipes
router.post('/favorites/add', addFavoriteRecipe); // Route for adding favorites
router.post('/favorites/remove', removeFavoriteRecipe); // Route for removing favorites

export default router;
