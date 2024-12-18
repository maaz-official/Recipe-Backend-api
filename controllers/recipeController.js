import Recipe from '../models/Recipe.js';

// Get all recipes
export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find(); // Fetch all recipes from the database
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes' });
  }
};

// Get recipe by ID
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id); // Use Mongoose to find the recipe by ID
    if (recipe) {
      res.json(recipe);
    } else {
      res.status(404).json({ message: "Recipe not found" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching the recipe' });
  }
};

// Create a new recipe
// Create a new recipe
export const createRecipe = async (req, res) => {
  const { title, description, image, recipesImages, category, tags, preparationTime, cookingTime, servings, ingredients, instructions } = req.body;
  // Create a new recipe object using the Mongoose model
  const newRecipe = new Recipe({
    title,
    description,
    image,
    recipesImages,
    category,
    tags,
    preparationTime,
    cookingTime,
    servings,
    ingredients,
    instructions,
  });
  try {
    const savedRecipe = await newRecipe.save(); // Save the recipe to the database
    res.status(201).json(savedRecipe); // Respond with the newly created recipe
  } catch (error) {
    res.status(500).json({ message: 'Error creating the recipe' });
  }
};

// Delete a recipe by ID
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id); // Find and delete the recipe by ID
    if (recipe) {
      res.json({ message: "Recipe deleted successfully" });
    } else {
      res.status(404).json({ message: "Recipe not found" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting the recipe' });
  }
};

// Update a recipe by ID
export const updateRecipe = async (req, res) => {
  const { title, description, image, recipesImages, category, tags, preparationTime, cookingTime, servings, ingredients, instructions } = req.body;

  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id, // Find recipe by ID
      {
        title,
        description,
        image,
        recipesImages,
        category,
        tags,
        preparationTime,
        cookingTime,
        servings,
        ingredients,
        instructions,
      },
      { new: true } // Return the updated document
    );

    if (updatedRecipe) {
      res.json(updatedRecipe);
    } else {
      res.status(404).json({ message: "Recipe not found" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating the recipe' });
  }
};