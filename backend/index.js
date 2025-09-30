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
  const { ingredients, goal } = req.body;

  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        ingredients: ingredients.join(','),
        number: 5,
        apiKey: process.env.SPOONACULAR_KEY
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Error fetching recipes');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
