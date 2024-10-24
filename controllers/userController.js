import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import Recipe from '../models/Recipe.js'; // Assuming Recipe model is used for favorites
import sendSMS from '../utils/sendSMS.js'; // Utility to send SMS

// @desc Register a new user
// @route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, mobile, password } = req.body;

    // Validate input
    if (!name || !email || !mobile || !password) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const userExists = await User.findOne({ email });
    const mobileExists = await User.findOne({ mobile });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    if (mobileExists) {
        res.status(400);
        throw new Error('Mobile number already in use');
    }

    // Generate random verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
        name,
        email,
        mobile,
        password,
        verificationCode,
    });

    if (user) {
        // Send the verification SMS with `verificationCode`
        await sendSMS({
            to: user.mobile,
            text: `Your verification code is ${verificationCode}.`,
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            isVerified: user.isVerified,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});


// @desc Verify user's mobile
// @route POST /api/users/verify-mobile
// @access Public
const verifyMobile = asyncHandler(async (req, res) => {
    const { mobile, code } = req.body;

    // Validate input
    if (!mobile || !code) {
        res.status(400);
        throw new Error('Please provide mobile and verification code');
    }

    // Ensure the code is a six-digit number
    if (!/^\d{6}$/.test(code)) {
        res.status(400);
        throw new Error('Verification code must be a 6-digit number');
    }

    const user = await User.findOne({ mobile });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Compare the provided code with the user's stored verification code
    if (user.verificationCode === code) {
        user.isVerified = true;
        user.verificationCode = null; // Clear the code once verified
        await user.save();

        res.json({ message: 'Mobile verified successfully' });
    } else {
        res.status(400);
        throw new Error('Invalid verification code');
    }
});

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
    verifyMobile,
    loginUser,
    getProfile,
    addFavoriteRecipe,
    guestLogin,
};
