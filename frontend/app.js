const form = document.getElementById('recipeForm');
const recipesDiv = document.getElementById('recipes');

// Toggle Advanced Options
const toggleAdvancedBtn = document.getElementById('toggleAdvanced');
const advancedSection = document.getElementById('advancedSection');
toggleAdvancedBtn.addEventListener('click', () => {
  advancedSection.style.display = advancedSection.style.display === 'none' ? 'block' : 'none';
});


// Toggle Nutritional Breakdown
const toggleNutritionBtn = document.getElementById('toggleNutrition');
const nutritionSection = document.getElementById('nutritionSection');
toggleNutritionBtn.addEventListener('click', () => {
  nutritionSection.style.display = nutritionSection.style.display === 'none' ? 'block' : 'none';
});

// Toggle Caloric Needs
const toggleCaloriesBtn = document.getElementById('toggleCalories');
const caloriesSection = document.getElementById('caloriesSection');
toggleCaloriesBtn.addEventListener('click', () => {
  caloriesSection.style.display = caloriesSection.style.display === 'none' ? 'block' : 'none';
});

// bulk and cut 
const toggleBulkCutBtn = document.getElementById('toggleBulkCut');
const bulkCutSection = document.getElementById('bulkCutSection');
toggleBulkCutBtn.addEventListener('click', () => {
  bulkCutSection.style.display = bulkCutSection.style.display === 'none' ? 'block' : 'none';
});

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const ingredients = document.getElementById('ingredients').value.split(',');
  const goal = document.getElementById('goal') ? document.getElementById('goal').value : null;

  // Grab advanced fields if they exist
  const minCarbs = document.getElementById('minCarbs')?.value || null;
  const maxCarbs = document.getElementById('maxCarbs')?.value || null;
  const minProtein = document.getElementById('minProtein')?.value || null;
  const maxProtein = document.getElementById('maxProtein')?.value || null;
  const minFat = document.getElementById('minFat')?.value || null;
  const maxFat = document.getElementById('maxFat')?.value || null;
  const weight = document.getElementById('weight')?.value || null;
  const activity = document.getElementById('activity')?.value || null;
  const targetCalories = document.getElementById('targetCalories')?.value || null;

  try {
    const gender = document.getElementById('gender')?.value || null;
    const age = document.getElementById('age')?.value || null;
    const bulkWeight = document.getElementById('bulkWeight')?.value || null;
    const bulkGoal = document.getElementById('bulkGoal')?.value || null;

    let url = 'http://localhost:3000/recipes';
    let body = {
      ingredients,
      goal,
      nutrition: { minCarbs, maxCarbs, minProtein, maxProtein, minFat, maxFat },
      calories: { weight, activity, targetCalories }
    };

    // If Bulk/Cut info is filled → call special endpoint
    if (gender && bulkWeight && bulkGoal) {
      url = 'http://localhost:3000/recipes-by-goal';
      body = { ingredients, gender, age, weightKg: bulkWeight, goal: bulkGoal };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
  });

    const data = await response.json();
    console.log('Backend response:', data);

    recipesDiv.innerHTML = '';

    if (url.includes('recipes-by-goal')) {
  const { meta, recipes } = data;

  recipesDiv.innerHTML += `
    <div>
      <h2>Nutrition Summary</h2>
      <p><strong>Maintenance:</strong> ${meta.maintenance} kcal/day</p>
      <p><strong>Target:</strong> ${meta.targetDaily} kcal/day (${meta.goal})</p>
      <p><strong>Per meal:</strong> ${meta.perMeal} kcal (range ${meta.minCalories}-${meta.maxCalories})</p>
    </div>
  `;

  if (!recipes.length) {
    recipesDiv.innerHTML += '<p>No recipes found.</p>';
  } else {
    recipes.forEach(recipe => {
      const div = document.createElement('div');
      div.style.border = '1px solid #ccc';
      div.style.padding = '10px';
      div.style.margin = '10px 0';
      
      const instructionsHtml = recipe.instructions 
        ? `<div><h4>Instructions:</h4><p>${recipe.instructions}</p></div>`
        : '';
      
      const sourceHtml = recipe.sourceUrl 
        ? `<p><a href="${recipe.sourceUrl}" target="_blank">View Original Recipe</a></p>`
        : '';
      
      div.innerHTML = `
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}" alt="${recipe.title}" width="200">
        <p><strong>Calories:</strong> ${recipe.calories ? Math.round(recipe.calories) : "N/A"}</p>
        <p><strong>Nutrition:</strong> Carbs: ${recipe.carbs ? Math.round(recipe.carbs) : 'N/A'}g | Protein: ${recipe.protein ? Math.round(recipe.protein) : 'N/A'}g | Fat: ${recipe.fat ? Math.round(recipe.fat) : 'N/A'}g</p>
        ${instructionsHtml}
        ${sourceHtml}
      `;
      recipesDiv.appendChild(div);
    });
  }

  return; // stop here so the old /recipes rendering doesn't run
}

    if (data.length === 0) {
      recipesDiv.innerHTML = '<p>No recipes found.</p>';
      return;
    }

    data.forEach(recipe => {
      const div = document.createElement('div');
      div.style.border = '1px solid #ccc';
      div.style.padding = '10px';
      div.style.margin = '10px 0';

      const usedList = recipe.usedIngredients.length
        ? `<ul>${recipe.usedIngredients.map(i => `<li>${i.original}</li>`).join('')}</ul>`
        : '<p>No ingredients you already have are needed.</p>';

      const missedList = recipe.missedIngredients.length
        ? `<ul>${recipe.missedIngredients.map(i => `<li>${i.original}</li>`).join('')}</ul>`
        : '<p>You have all ingredients!</p>';

      const instructionsHtml = recipe.instructions 
        ? `<div><h4>Instructions:</h4><p>${recipe.instructions}</p></div>`
        : '';
      
      const sourceHtml = recipe.sourceUrl 
        ? `<p><a href="${recipe.sourceUrl}" target="_blank">View Original Recipe</a></p>`
        : '';

      div.innerHTML = `
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}" alt="${recipe.title}" width="200">
        <p><strong>Nutrition:</strong> Carbs: ${recipe.carbs ?? 'N/A'}g | Protein: ${recipe.protein ?? 'N/A'}g | Fat: ${recipe.fat ?? 'N/A'}g</p>
        <h4>Ingredients you have:</h4>
        ${usedList}
        <h4>Ingredients you need:</h4>
        ${missedList}
        ${instructionsHtml}
        ${sourceHtml}
      `;

      recipesDiv.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    recipesDiv.innerHTML = '<p>Failed to fetch recipes.</p>';
  }
});