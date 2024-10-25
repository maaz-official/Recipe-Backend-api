import express from 'express';
import {
    registerUser,
    loginUser,
    addFavoriteRecipe,
    getProfile,
    guestLogin,
    verifyEmail,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js'; // Import the protect middleware

const router = express.Router();

// User registration route
router.post('/register', registerUser); // No protection needed for registration

// Email verification route
// router.post('/verify-mobile', verifyMobile); // No protection needed for verification

// Email verification route
router.post('/verify-email', verifyEmail); // No protection needed for verification

// User login route
router.post('/login', loginUser); // No protection needed for login

// Guest login route
router.post('/guest', guestLogin); // No protection needed for guest login

// Get user profile (protected route)
router.get('/profile', protect, getProfile); // Protect this route

// Add favorite recipe (protected route)
router.post('/favorites', protect, addFavoriteRecipe); // Protect this route

export default router;
