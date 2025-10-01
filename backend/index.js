const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const cors = require('cors'); 

const app = express();
app.use(express.json());
app.use(cors()); //  allow frontend requests

// serve frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Recipes endpoint
app.post('/recipes', async (req, res) => {
  const { ingredients, goal, nutrition } = req.body;

  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        ingredients: ingredients.join(','),
        number: 10,
        apiKey: process.env.SPOONACULAR_KEY
      }
    });

    let recipes = response.data;

// For each recipe, fetch more detailed info
const detailedRecipes = await Promise.all(
  recipes.map(async (recipe) => {
    try {
      const infoResponse = await axios.get(
        `https://api.spoonacular.com/recipes/${recipe.id}/information`,
        { params: { apiKey: process.env.SPOONACULAR_KEY } }
      );

      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        usedIngredients: recipe.usedIngredients.map(i => i.original),
        missedIngredients: recipe.missedIngredients.map(i => i.original),
        instructions: infoResponse.data.instructions || "No instructions provided.",
        summary: infoResponse.data.summary || ""
      };
    } catch (err) {
      console.error(`Error fetching info for recipe ${recipe.id}:`, err.message);
      return recipe; // fallback
    }
  })
);

res.json(detailedRecipes);

    res.json(recipes);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Error fetching recipes');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
app.post('/recipes', async (req, res) => {
  try {
    const { ingredients = [], minCalories, maxCalories, goal } = req.body;

    // Step 1: Search with complexSearch
    const search = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey: process.env.SPOONACULAR_KEY,
        number: 8,
        query: ingredients.join(','), // search keywords
        minCalories,
        maxCalories,
        sort: 'calories',
        sortDirection: goal === 'bulk' ? 'desc' : 'asc'
      }
    });

    // Step 2: Fetch full details in bulk
    const ids = search.data.results.map(r => r.id).join(',');
    const { data: info } = await axios.get(
      'https://api.spoonacular.com/recipes/informationBulk',
      { params: { apiKey: process.env.SPOONACULAR_KEY, ids, includeNutrition: true } }
    );

    // Step 3: Build objects
    const results = info.map(r => ({
      id: r.id,
      title: r.title,
      image: r.image,
      calories: r.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount,
      usedIngredients: r.extendedIngredients?.map(i => i.original) || [],
      missedIngredients: [], // you could split based on user input
      summary: r.summary || '',
      instructions:
        r.instructions ||
        (r.analyzedInstructions?.[0]?.steps?.map(s => s.step).join(' ')) ||
        ''
    }));

    res.json({ recipes: results });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});
