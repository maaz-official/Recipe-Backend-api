import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import generateToken from '../utils/generateToken.js';
import { sendVerificationEmail } from '../utils/mailer.js';
import AppError from '../utils/AppError.js';
import crypto from 'crypto';

// Step 1: Register
const registerStep = asyncHandler(async (req, res, next) => {
    const { name, email } = req.body;
    if (!name || !email) return next(new AppError('Name and email are required', 400));

    const userExists = await User.findOne({ email });
    if (userExists) return next(new AppError('User already exists', 400));

    // Generate a 6-digit hexadecimal verification code
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const user = await User.create({ name, email, verificationCode });

    // Send the verification email with the generated code
    await sendVerificationEmail(user.email, verificationCode);
    res.status(200).json({ message: 'Verification code sent to your email' });
});


// Step 2: Verify Email
const verifyEmail = asyncHandler(async (req, res, next) => {
    const { email, verificationCode } = req.body;
    if (!email || !verificationCode) return next(new AppError('Email and verification code are required', 400));

    const user = await User.findOne({ email });
    if (!user || user.verificationCode !== verificationCode) return next(new AppError('Invalid verification code', 400));

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
});

// Step 3: Add Additional Info
const addAdditionalInfo = asyncHandler(async (req, res, next) => {
    const { email, mobileNumber, dob, address } = req.body;
    if (!email || !mobileNumber || !dob || !address) return next(new AppError('All fields are required', 400));

    const user = await User.findOne({ email });
    if (!user) return next(new AppError('User not found', 404));

    user.mobileNumber = mobileNumber;
    user.dob = dob;
    user.address = address;
    await user.save();

    res.status(200).json({ message: 'Additional info saved' });
});

// Step 4: Finalize Registration
const finalizeRegistration = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError('Email and password are required', 400));

    const user = await User.findOne({ email });
    if (!user) return next(new AppError('User not found', 404));

    user.password = password;
    await user.save();

    res.status(201).json({
        _id: user._id,
        email: user.email,
        message: 'Registration complete',
        token: generateToken(user._id),
    });
});

// Login
const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError('Email and password required', 400));

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id); // Generate token here
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        // Include token in the JSON response
        res.json({ 
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            isVerified: user.isVerified,
            token, // Include token here
        });
    } else {
        return next(new AppError('Invalid email or password', 401));
    }
});


// Get Profile
const getProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('-password'); // Exclude password from response

    if (!user) return next(new AppError('User not found', 404));

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        favorites: user.addToFav,
        mobileNumber: user.mobileNumber,
        dob: user.dob,
        address: user.address,
        profilePicture: user.profilePicture,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
});

// Guest Login
const guestLogin = asyncHandler(async (req, res, next) => {
    const guestEmail = `guest_${Date.now()}@example.com`;
    const guestPassword = 'guest_password'; // Placeholder password for guest users

    const guestUser = await User.create({
        name: 'Guest',
        email: guestEmail,
        password: guestPassword,
        isGuest: true,
    });

    const token = generateToken(guestUser._id);
    res.status(201).json({
        _id: guestUser._id,
        name: guestUser.name,
        email: guestUser.email,
        isGuest: guestUser.isGuest,
        token,
    });
});

// Add favorite recipe
const addFavoriteRecipe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const { recipeId } = req.body;
    if (!recipeId) return next(new AppError('Recipe ID required', 400));

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return next(new AppError('Recipe not found', 404));

    if (!user.favorites.includes(recipeId)) {
        user.favorites.push(recipeId);
        await user.save();
        res.status(200).json({ message: 'Recipe added to favorites', favorites: user.favorites });
    } else {
        return next(new AppError('Recipe already in favorites', 400));
    }
});

// Remove favorite recipe
const removeFavoriteRecipe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const { recipeId } = req.body;
    if (!recipeId) return next(new AppError('Recipe ID required', 400));

    const index = user.favorites.indexOf(recipeId);
    if (index > -1) {
        user.favorites.splice(index, 1);
        await user.save();
        res.status(200).json({ message: 'Recipe removed from favorites', favorites: user.favorites });
    } else {
        return next(new AppError('Recipe not found in favorites', 404));
    }
});


// Get User by ID
const getUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id).select('-password'); // Exclude password from response
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json(user);
});

// Update User
const updateUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, email, password, mobileNumber, dob, address } = req.body;

    const user = await User.findById(id);
    if (!user) return next(new AppError('User not found', 404));

    // Update user fields if provided in request body
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // Assume pre-save hook handles hashing
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (dob) user.dob = dob;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({
        message: 'User updated successfully',
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber,
            dob: user.dob,
            address: user.address,
            updatedAt: user.updatedAt,
        },
    });
});


// Get all favorite recipes
const getFavorites = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate('addToFav'); // Populate favorite recipes

    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({
        favorites: user.addToFav
    });
});


export {
    getUser,
    updateUser,
    registerStep,
    verifyEmail,
    addAdditionalInfo,
    finalizeRegistration,
    loginUser,
    getProfile,
    guestLogin,
    addFavoriteRecipe,
    removeFavoriteRecipe,
    getFavorites,
};
