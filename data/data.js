// src/models/recipeModel.js
const recipes = [
  {
    title: "Spaghetti Carbonara",
    description: "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.",
    image: "https://static01.nyt.com/images/2021/02/14/dining/carbonara-horizontal/carbonara-horizontal-square640-v2.jpg",
    recipesImages: [
      "https://static01.nyt.com/images/2021/02/14/dining/carbonara-horizontal/carbonara-horizontal-square640-v2.jpg",
      "https://static01.nyt.com/images/2021/02/14/dining/carbonara-horizontal/carbonara-horizontal-square640-v2.jpg",
    ],
    category: "Pasta",
    tags: ["Italian", "Quick", "Comfort Food"],
    preparationTime: "10 minutes",
    cookingTime: "20 minutes",
    servings: 2,
    ingredients: [
      "200g spaghetti",
      "100g pancetta",
      "2 large eggs",
      "50g grated Pecorino cheese",
      "Freshly ground black pepper",
      "Salt",
    ],
    instructions: [
      "Cook spaghetti in boiling salted water until al dente.",
      "In a pan, cook pancetta until crispy.",
      "In a bowl, whisk together eggs and cheese.",
      "Combine spaghetti with pancetta, remove from heat, and add egg mixture quickly.",
      "Serve immediately with more cheese and black pepper.",
    ],
  },
  {
    title: "Chicken Tikka Masala",
    description: "A popular Indian dish made with marinated chicken cooked in a spiced curry sauce.",
    image: "https://images.services.kitchenstories.io/z_bWPIhhM6qs38B0E46CRaYs81Q=/3840x0/filters:quality(85)/images.kitchenstories.io/wagtailOriginalImages/R2568-photo-final-_0.jpg",
    recipesImages: [
      "https://images.services.kitchenstories.io/z_bWPIhhM6qs38B0E46CRaYs81Q=/3840x0/filters:quality(85)/images.kitchenstories.io/wagtailOriginalImages/R2568-photo-final-_0.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/1/1b/Chicken_Tikka_Masala.jpg",
    ],
    category: "Curry",
    tags: ["Indian", "Spicy", "Comfort Food"],
    preparationTime: "30 minutes",
    cookingTime: "30 minutes",
    servings: 4,
    ingredients: [
      "500g chicken breast, cubed",
      "200g yogurt",
      "2 tablespoons tikka masala paste",
      "1 onion, chopped",
      "2 cloves garlic, minced",
      "400g canned tomatoes",
      "150ml cream",
      "Salt and pepper",
      "Fresh cilantro for garnish",
    ],
    instructions: [
      "Marinate chicken in yogurt and tikka masala paste for at least 30 minutes.",
      "In a pan, sauté onions and garlic until soft.",
      "Add marinated chicken and cook until browned.",
      "Add tomatoes and simmer for 20 minutes.",
      "Stir in cream, season with salt and pepper, and garnish with cilantro.",
    ],
  },
];

export default recipes;
