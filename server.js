import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import recipeRoutes from './routes/recipeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import errorHandler from './utils/errorHandler.js';
import commentRoutes from './routes/commentRoutes.js'
import tagRoutes from './routes/tagRoutes.js'
import cors from 'cors';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON bodies in requests
app.use(express.json());

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:8081', "http://localhost:3000"],
    credentials: true, // Allow credentials such as cookies or authorization headers
};
app.use(cors(corsOptions)); // Use CORS middleware with options

// Routes
app.use('/api/recipes', recipeRoutes); // Ensure the '/api/recipes' route is working
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/tags', tagRoutes);

// Error handling middleware - should be last
app.use(errorHandler); // Catch all errors and send responses
// Default route for the health check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'API is Running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`API RUNNING on port ${PORT}`);
});

// Export the app for Vercel
export default app;
