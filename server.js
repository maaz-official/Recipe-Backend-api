import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import recipeRoutes from './routes/recipeRoutes.js';
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
    origin: 'http://localhost:8081', // Replace with your frontend URL
    credentials: true, // Allow credentials such as cookies or authorization headers
};
app.use(cors(corsOptions));

// Routes
app.use('/api/recipes', recipeRoutes); // Ensure the '/api/recipes' route is working

// Default route for the root URL
app.get('/', (req, res) => {
    res.json("API is Running");
});

app.listen(5000, () => {
    console.log('API RUNNING')
})

// Export the app for Vercel
export default app;
