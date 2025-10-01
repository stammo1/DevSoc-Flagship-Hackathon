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

    // Always fetch nutrition info for all recipes
    const recipesWithNutrition = await Promise.all(
      recipes.map(async (recipe) => {
        try {
          const nutritionResponse = await axios.get(
            `https://api.spoonacular.com/recipes/${recipe.id}/nutritionWidget.json`,
            {
              params: { apiKey: process.env.SPOONACULAR_KEY }
            }
          );

          const carbs = parseFloat(nutritionResponse.data.carbs.replace('g', ''));
          const protein = parseFloat(nutritionResponse.data.protein.replace('g', ''));
          const fat = parseFloat(nutritionResponse.data.fat.replace('g', ''));

          const infoResponse = await axios.get(
            `https://api.spoonacular.com/recipes/${recipe.id}/information`,
            {
              params: { apiKey: process.env.SPOONACULAR_KEY }
            }
          );

          return { 
            ...recipe, 
            carbs, 
            protein, 
            fat,
            instructions: infoResponse.data.instructions || 'No instructions available',
            sourceUrl: infoResponse.data.sourceUrl
          };
        } catch (error) {
          console.error(`Error fetching nutrition for recipe ${recipe.id}:`, error.message);
          return recipe;
        }
      })
    );

    recipes = recipesWithNutrition;

    // Apply nutrition filters if provided
    const hasNutritionFilters = nutrition && (
      nutrition.minCarbs ||
      nutrition.maxCarbs ||
      nutrition.minProtein || 
      nutrition.maxProtein || 
      nutrition.minFat || 
      nutrition.maxFat
    );

    if (hasNutritionFilters) {
      recipes = recipes.filter(recipe => {
        if (nutrition.minCarbs && recipe.carbs < parseFloat(nutrition.minCarbs)) return false;
        if (nutrition.maxCarbs && recipe.carbs > parseFloat(nutrition.maxCarbs)) return false;
        if (nutrition.minProtein && recipe.protein < parseFloat(nutrition.minProtein)) return false;
        if (nutrition.maxProtein && recipe.protein > parseFloat(nutrition.maxProtein)) return false;
        if (nutrition.minFat && recipe.fat < parseFloat(nutrition.minFat)) return false;
        if (nutrition.maxFat && recipe.fat > parseFloat(nutrition.maxFat)) return false;
        return true;
      });
    }

    recipes = recipes.slice(0, 10);
    res.json(recipes);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Error fetching recipes');
  }
});

// MOVED THIS ROUTE BEFORE app.listen() - THIS IS THE ONLY CHANGE!
app.post('/recipes-by-goal', async (req, res) => {
  try {
    const { ingredients = [], gender, weightKg, age, goal } = req.body;

    // for maintainance (kcal)
    if (!gender || !weightKg || !age || !goal) {
      return res.status(400).json({ error: 'gender, weightKg, age, goal are required' });
    }
    const maintenance = (gender === 'male' ? 33 : 30) * Number(weightKg);

    // target calories per day 
    const targetDaily =
      goal === 'bulk' ? maintenance * 1.15 :
      goal === 'cut'  ? maintenance * 0.80 :
      maintenance;

    // per meal target 
    const mealsPerDay = 3;
    const perMeal = targetDaily / mealsPerDay;
    const minCalories = Math.max(50, Math.round(perMeal * 0.8));
    const maxCalories = Math.round(perMeal * 1.2);

    // Call Spoonacular complexSearch with calorie band + ingredients
    // includes includeIngredients + minCalories/maxCalories
    const params = {
      apiKey: process.env.SPOONACULAR_KEY,
      number: 8,
      includeIngredients: ingredients.join(','),
      addRecipeNutrition: true,
      minCalories,
      maxCalories,
      sort: 'calories',
      sortDirection: goal === 'bulk' ? 'desc' : 'asc'
    };

    const { data } = await axios.get('https://api.spoonacular.com/recipes/complexSearch', { params });

    const results = await Promise.all((data.results || []).map(async r => {
      const nutrients = r.nutrition?.nutrients || [];
      
      try {
        const infoResponse = await axios.get(
          `https://api.spoonacular.com/recipes/${r.id}/information`,
          {
            params: { apiKey: process.env.SPOONACULAR_KEY }
          }
        );

        return {
          id: r.id,
          title: r.title,
          image: r.image,
          calories: nutrients.find(n => n.name === 'Calories')?.amount ?? null,
          protein: nutrients.find(n => n.name === 'Protein')?.amount ?? null,
          carbs: nutrients.find(n => n.name === 'Carbohydrates')?.amount ?? null,
          fat: nutrients.find(n => n.name === 'Fat')?.amount ?? null,
          instructions: infoResponse.data.instructions || 'No instructions available',
          sourceUrl: infoResponse.data.sourceUrl
        };
      } catch (error) {
        return {
          id: r.id,
          title: r.title,
          image: r.image,
          calories: nutrients.find(n => n.name === 'Calories')?.amount ?? null,
          protein: nutrients.find(n => n.name === 'Protein')?.amount ?? null,
          carbs: nutrients.find(n => n.name === 'Carbohydrates')?.amount ?? null,
          fat: nutrients.find(n => n.name === 'Fat')?.amount ?? null
        };
      }
    }));

    res.json({
      meta: {
        gender, weightKg: Number(weightKg), age,
        goal, maintenance: Math.round(maintenance), targetDaily: Math.round(targetDaily),
        perMeal: Math.round(perMeal), minCalories, maxCalories
      },
      recipes: results
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Error fetching goal-based recipes' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});