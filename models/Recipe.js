// models/Recipe.js
import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
  recipesImages: [String], // Array of image URLs
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Reference to Category
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }], // Array of tag references
  preparationTime: String,
  cookingTime: String,
  servings: Number,
  ingredients: [String], // Array of ingredients
  instructions: [String], // Array of instructions
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }], // Array of rating references
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }] // Array of like references
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
