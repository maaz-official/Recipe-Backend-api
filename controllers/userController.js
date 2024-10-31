import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import AdditionalInfo from '../models/AdditionalInfo.js'; // Import the AdditionalInfo model
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

    // Generate a verification code
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const user = await User.create({ name, email, verificationCode });

    // Send the verification email
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
    
    // Validate all fields are provided
    if (!email || !mobileNumber || !dob || !address) {
        return next(new AppError('All fields are required', 400));
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Create a new AdditionalInfo document
    const additionalInfo = new AdditionalInfo({
        mobileNumber,
        dob,
        address,
    });

    // Save the AdditionalInfo document to the database
    await additionalInfo.save();

    // Link the AdditionalInfo document to the User
    user.additionalInfo.push(additionalInfo._id);
    await user.save();

    // Respond with a success message and the additional info created
    res.status(200).json({
        message: 'Additional info saved',
        additionalInfo: {
            _id: additionalInfo._id,
            mobileNumber: additionalInfo.mobileNumber,
            dob: additionalInfo.dob,
            address: additionalInfo.address,
        },
    });
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
    const user = await User.findById(req.user._id).select('-password').populate('additionalInfo'); // Populate additionalInfo

    if (!user) return next(new AppError('User not found', 404));

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        favorites: user.addToFav,
        additionalInfo: user.additionalInfo, // Include additional info in the response
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

// Get User by ID
const getUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id).select('-password').populate('additionalInfo'); // Populate additionalInfo
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json(user);
});

// Update User
const updateUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, email, password, mobileNumber, dob, address } = req.body;

    const user = await User.findById(id).populate('additionalInfo'); // Populate additionalInfo
    if (!user) return next(new AppError('User not found', 404));

    // Update user fields if provided in request body
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // Assume pre-save hook handles hashing

    // Update additional info if provided
    if (user.additionalInfo.length > 0) {
        const additionalInfo = await AdditionalInfo.findById(user.additionalInfo[0]); // Assume there's only one additional info entry
        if (additionalInfo) {
            if (mobileNumber) additionalInfo.mobileNumber = mobileNumber;
            if (dob) additionalInfo.dob = dob;
            if (address) additionalInfo.address = address;
            await additionalInfo.save();
        }
    }

    await user.save();

    res.status(200).json({
        message: 'User updated successfully',
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            additionalInfo: user.additionalInfo,
            updatedAt: user.updatedAt,
        },
    });
});



// Get User by ID
const getUserById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError('Invalid user ID format', 400));
    }

    // Fetch the user and populate additionalInfo and addToFav
    const user = await User.findById(id)
        .select('-password') // Exclude password
        .populate('additionalInfo') // Populate additionalInfo references
        .populate('addToFav'); // Optionally populate favorite recipes

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        additionalInfo: user.additionalInfo,
        favorites: user.addToFav,
        profilePicture: user.profilePicture,
        role: user.role,
        isGuest: user.isGuest,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
});

// controllers/userController.js

// Favorite a recipe
 const favoriteRecipe = async (req, res) => {
    const userId = req.user._id; // Assuming user ID is added to req.user by auth middleware
    const recipeId = req.params.id;
  
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Add recipe to favorites if not already present
      if (!user.addToFav.includes(recipeId)) {
        user.addToFav.push(recipeId);
        await user.save();
        return res.json({ message: 'Recipe favorited', favorites: user.addToFav });
      }
      return res.status(400).json({ message: 'Recipe already favorited' });
    } catch (error) {
      res.status(500).json({ message: 'Error favoriting the recipe' });
    }
  };
  
  // Unfavorite a recipe
 const unfavoriteRecipe = async (req, res) => {
    const userId = req.user._id;
    const recipeId = req.params.id;
  
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Remove recipe from favorites if present
      if (user.addToFav.includes(recipeId)) {
        user.addToFav = user.addToFav.filter(id => id.toString() !== recipeId);
        await user.save();
        return res.json({ message: 'Recipe unfavorited', favorites: user.addToFav });
      }
      return res.status(400).json({ message: 'Recipe not favorited' });
    } catch (error) {
      res.status(500).json({ message: 'Error unfavoriting the recipe' });
    }
  };

  // controllers/userController.js

// Get all favorited recipes for a user
const getFavorites = async (req, res) => {
    const userId = req.user._id;
  
    try {
      const user = await User.findById(userId).populate('addToFav'); // Populate favorite recipes
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      res.json({ favorites: user.addToFav });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching favorites' });
    }
  };
  
  

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
    unfavoriteRecipe,
    favoriteRecipe,
    getFavorites,
    getUserById,
};
