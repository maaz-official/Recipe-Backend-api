import asyncHandler from '../utils/asyncHandler.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendVerificationEmail } from '../utils/mailer.js'; // Import the mailer function

// @desc Register a new user
// @route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Optional: Validate email format and password strength here
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Uncomment this if you have a mobile field and validation
    // const mobileExists = await User.findOne({ mobile });
    // if (mobileExists) {
    //     return res.status(400).json({ message: 'Mobile number already in use' });
    // }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate random verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const user = await User.create({
            name,
            email,
            password: hashedPassword, // Store hashed password
            verificationCode,
        });

        // Send the verification email with the `verificationCode`
        await sendVerificationEmail(user.email, verificationCode); // Send email

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            token: generateToken(user._id),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// @desc Verify Email Code
// @route POST /api/users/verify-email
// @access Public
const verifyEmail = asyncHandler(async (req, res) => {
    const { email, verificationCode } = req.body;

    // Validate input
    if (!email || !verificationCode) {
        return res.status(400).json({ message: 'Please provide email and verification code' });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if verification code matches
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // If verified, update user
        user.isVerified = true;
        user.verificationCode = null; // Clear the verification code
        await user.save();

        return res.status(200).json({ message: 'Email verified successfully!' });
    } catch (error) {
        return res.status(500).json({ message: 'Error verifying email', error: error.message });
    }
});


// @desc Verify user's mobile
// @route POST /api/users/verify-mobile
// @access Public
// const verifyMobile = asyncHandler(async (req, res) => {
//     const { mobile, code } = req.body;

//     // Validate input
//     if (!mobile || !code) {
//         return res.status(400).json({ message: 'Please provide mobile and verification code' });
//     }

//     // Ensure the mobile number format is valid (example regex for Pakistani numbers)
//     const mobileRegex = /^\+92\d{10}$/; // Adjust this based on your specific use case
//     if (!mobileRegex.test(mobile)) {
//         return res.status(400).json({ message: 'Invalid mobile number format' });
//     }

//     // Ensure the code is a six-digit number
//     if (!/^\d{6}$/.test(code)) {
//         return res.status(400).json({ message: 'Verification code must be a 6-digit number' });
//     }

//     try {
//         const user = await User.findOne({ mobile });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Compare the provided code with the user's stored verification code
//         if (user.verificationCode === code) {
//             user.isVerified = true;
//             user.verificationCode = null; // Clear the code once verified
//             await user.save();

//             return res.status(200).json({ message: 'Mobile verified successfully' });
//         } else {
//             return res.status(400).json({ message: 'Invalid verification code' });
//         }
//     } catch (error) {
//         console.error('Error during mobile verification:', error);
//         return res.status(500).json({ message: 'An unexpected error occurred' });
//     }
// });

// @desc Auth user & get token in cookie
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Generate the token
        const token = generateToken(user._id);

        // Set the token in an HTTP-only cookie
        res.cookie('jwt', token, {
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Ensure secure flag is true in production
            sameSite: 'Strict', // Helps with CSRF protection
            maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expiration (30 days in milliseconds)
        });

        // Respond with user info (without token in the body)
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc Get user profile
// @route GET /api/users/profile
// @access Private
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            favorites: user.addToFav,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc Add a recipe to favorites
// @route POST /api/users/favorites
// @access Private
const addFavoriteRecipe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { recipeId } = req.body;

    // Validate input
    if (!recipeId) {
        res.status(400);
        throw new Error('Recipe ID is required');
    }

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    if (!user.addToFav.includes(recipeId)) {
        user.addToFav.push(recipeId);
        await user.save();
        res.status(200).json({ message: 'Recipe added to favorites' });
    } else {
        res.status(400).json({ message: 'Recipe already in favorites' });
    }
});

// @desc Login as a guest
// @route POST /api/users/guest
// @access Public
const guestLogin = asyncHandler(async (req, res) => {
    const guestUser = await User.create({
        name: 'Guest',
        email: `guest_${Date.now()}@example.com`, // Generate a unique guest email
        password: 'guest_password', // Placeholder password
        isGuest: true,
    });

    if (guestUser) {
        res.status(201).json({
            _id: guestUser._id,
            name: guestUser.name,
            email: guestUser.email,
            isGuest: guestUser.isGuest,
            token: generateToken(guestUser._id),
        });
    } else {
        res.status(400);
        throw new Error('Unable to create guest user');
    }
});

export {
    registerUser,
    loginUser,
    getProfile,
    verifyEmail,
    addFavoriteRecipe,
    guestLogin,
};
