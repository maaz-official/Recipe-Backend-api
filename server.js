import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import recipeRoutes from './routes/recipeRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON bodies in requests
app.use(express.json());

// Routes
app.use('/api/recipes', recipeRoutes);

app.get('/', (req, res) => {
    res.send("API is Running");
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
