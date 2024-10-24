import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if the token is in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Decode the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password'); // Exclude password from user data
            next(); // Continue to the next middleware
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
});

export { protect };
