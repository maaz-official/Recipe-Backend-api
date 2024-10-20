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
// const corsOptions = {
//     origin: 'http://localhost:8081', // Replace with your frontend URL
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
//     credentials: true, // Allow credentials
// };
const corsOptions = {
    origin: 'http://localhost:8081', // Allow requests from this origin (frontend)
    credentials: true, // Allow credentials such as cookies or authorization headers
  };
app.use(cors(corsOptions));

// Enable CORS with options
// app.use(cors(corsOptions));

// Routes
app.use('/api/recipes', recipeRoutes);

app.get('/', (req, res) => {
    res.json("API is Running");
});

// Start the server
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
