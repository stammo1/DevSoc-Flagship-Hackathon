const form = document.getElementById('recipeForm');
const recipesDiv = document.getElementById('recipes');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // grab values from form
  const ingredients = document.getElementById('ingredients').value.split(',');
  const goal = document.getElementById('goal').value;

  try {
    const response = await fetch('http://localhost:3000/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients, goal })
    });

    const data = await response.json();
    console.log('Backend response:', data);

    // clear recipes
    recipesDiv.innerHTML = '';

    if (data.length === 0) {
      recipesDiv.innerHTML = '<p>No recipes found.</p>';
      return;
    }

    // display recipes
    data.forEach(recipe => {
      const div = document.createElement('div');
      div.style.border = '1px solid #ccc';
      div.style.padding = '10px';
      div.style.margin = '10px 0';

      // List used ingredients
      const usedList = recipe.usedIngredients.length
        ? `<ul>${recipe.usedIngredients.map(i => `<li>${i.original}</li>`).join('')}</ul>`
        : '<p>No ingredients you already have are needed.</p>';

      // List missed ingredients
      const missedList = recipe.missedIngredients.length
        ? `<ul>${recipe.missedIngredients.map(i => `<li>${i.original}</li>`).join('')}</ul>`
        : '<p>You have all ingredients!</p>';

      div.innerHTML = `
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}" alt="${recipe.title}" width="200">
        <h4>Ingredients you have:</h4>
        ${usedList}
        <h4>Ingredients you need:</h4>
        ${missedList}
      `;

      recipesDiv.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    recipesDiv.innerHTML = '<p>Failed to fetch recipes.</p>';
  }
});
