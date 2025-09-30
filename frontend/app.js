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
      div.innerHTML = `
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}" alt="${recipe.title}" width="200">
      `;
      recipesDiv.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    recipesDiv.innerHTML = '<p>Failed to fetch recipes.</p>';
  }
});
