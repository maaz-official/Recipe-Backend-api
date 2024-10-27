import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: String,
  recipesImages: [String], // Array of image URLs
  category: String,
  tags: [String], // Array of tags
  preparationTime: String,
  cookingTime: String,
  servings: Number,
  ingredients: [String], // Array of ingredients
  instructions: [String], // Array of instructions
  favorites: [String], // Store recipe IDs in this array
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
