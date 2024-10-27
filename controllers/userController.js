import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendVerificationEmail } from '../utils/mailer.js';

// Step 1: Register basic info (name and email)
const registerStep = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
        return res.status(400).json({ message: 'Please provide name and email' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists with this email' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const user = await User.create({
            name,
            email,
            verificationCode,
        });

        await sendVerificationEmail(user.email, verificationCode);

        return res.status(200).json({ message: 'Verification code sent to email' });
    } catch (error) {
        console.error("Step 1 error:", error);
        return res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// Step 2: Verify Email Code
const verifyEmail = asyncHandler(async (req, res) => {
    const { email, verificationCode } = req.body;

    // Validate input
    if (!email || !verificationCode) {
        return res.status(400).json({ message: 'Please provide email and verification code' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        user.isVerified = true;
        user.verificationCode = null; // Clear the verification code
        await user.save();

        return res.status(200).json({ message: 'Email verified successfully!' });
    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({ message: 'Error verifying email', error: error.message });
    }
});

// Step 3: Add Additional Info
const addAdditionalInfo = asyncHandler(async (req, res) => {
    const { email, mobileNumber, dob, address } = req.body;

    if (!email || !mobileNumber || !dob || !address) {
        return res.status(400).json({ message: 'Please provide email, mobile number, date of birth, and address' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.mobileNumber = mobileNumber;
        user.dob = dob;
        user.address = address;
        await user.save();

        return res.status(200).json({ message: 'Additional info saved successfully!' });
    } catch (error) {
        console.error("Additional info error:", error);
        return res.status(500).json({ message: 'Error saving additional info', error: error.message });
    }
});

// Step 4: Finalize registration (create password)
const finalizeRegistration = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.password = password; // Set the password
        await user.save();

        return res.status(201).json({
            _id: user._id,
            email: user.email,
            message: 'User registered successfully!',
            token: generateToken(user._id), // Optionally generate a token
        });
    } catch (error) {
        console.error("Final registration error:", error);
        return res.status(500).json({ message: 'Error finalizing registration', error: error.message });
    }
});

// @desc Auth user & get token in cookie
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
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
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
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            favorites: user.addToFav,
            mobileNumber: user.mobileNumber,
            dob: user.dob,
            address: user.address,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc Add a recipe to favorites
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
    registerStep,
    verifyEmail,
    addAdditionalInfo,
    finalizeRegistration,
    loginUser,
    getProfile,
    addFavoriteRecipe,
    guestLogin,
};
