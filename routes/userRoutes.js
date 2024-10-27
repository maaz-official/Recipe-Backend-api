import express from 'express';
import {
    registerStep,
    verifyEmail,
    addAdditionalInfo,
    finalizeRegistration,
    loginUser,
    getProfile,
    addFavoriteRecipe,
    guestLogin,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerStep);
router.post('/verify-email', verifyEmail);
router.post('/info', addAdditionalInfo);
router.post('/final', finalizeRegistration);
router.post('/login', loginUser);
router.get('/profile', getProfile);
router.post('/favorites', addFavoriteRecipe);
router.post('/guest', guestLogin);

export default router;
