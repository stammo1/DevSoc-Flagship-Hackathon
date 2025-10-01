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

  const ingredients = document
  .getElementById('ingredients')
  .value
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
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

  // cute meta card
  const metaCard = document.createElement('div');
  metaCard.className = 'recipe-card';
  metaCard.innerHTML = `
    <div class="recipe-body">
      <h3 class="recipe-title">Nutrition Summary</h3>
      <p><strong>Maintenance:</strong> ${meta.maintenance} kcal/day</p>
      <p><strong>Target:</strong> ${meta.targetDaily} kcal/day (${meta.goal})</p>
      <p><strong>Per meal:</strong> ${meta.perMeal} kcal (range ${meta.minCalories}-${meta.maxCalories})</p>
    </div>
  `;
  recipesDiv.appendChild(metaCard);

  if (!recipes.length) {
    recipesDiv.innerHTML += '<p>No recipes found.</p>';
    return;
  }

  // same card layout as normal recipes
  const fmt = (t) => (t || '').toString().trim();
  recipes.forEach((recipe) => {
    const used = Array.isArray(recipe.usedIngredients) ? recipe.usedIngredients : [];
    const missed = Array.isArray(recipe.missedIngredients) ? recipe.missedIngredients : [];

    const usedList = used.length
      ? `<ul>${used.map(i => `<li>${fmt(i)}</li>`).join('')}</ul>`
      : '<p>—</p>';

    const missedList = missed.length
      ? `<ul>${missed.map(i => `<li>${fmt(i)}</li>`).join('')}</ul>`
      : '<p>—</p>';

    const summary = recipe.summary || 'No summary available.';
    const instructions = recipe.instructions || 'No instructions provided.';

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.title = (recipe.title || '').toLowerCase();

    card.innerHTML = `
      <div class="recipe-banner">
        <img src="${recipe.image}" alt="${recipe.title}">
        <div class="pin">📌</div>
        <div class="chips">
          <span class="chip kcal">${recipe.calories ? Math.round(recipe.calories) + ' kcal' : 'kcal n/a'}</span>
          <span class="chip have">Have ${used.length}</span>
          <span class="chip need">Need ${missed.length}</span>
        </div>
      </div>

      <div class="recipe-body">
        <h3 class="recipe-title">${recipe.title}</h3>

        <h4>Ingredients you have:</h4>
        ${usedList}

        <h4>Ingredients you need:</h4>
        ${missedList}

        <div class="summary"><strong>Summary:</strong> ${summary}</div>

        <button class="toggle-instr" type="button">Show Instructions</button>
        <div class="instructions collapsed">${instructions}</div>

        <a class="ext-link" href="https://spoonacular.com/recipes/${encodeURIComponent(recipe.title)}-${recipe.id}" target="_blank" rel="noopener">View on Spoonacular →</a>
      </div>
    `;

    const btn = card.querySelector('.toggle-instr');
    const instr = card.querySelector('.instructions');
    btn.addEventListener('click', () => {
      const collapsed = instr.classList.toggle('collapsed');
      btn.textContent = collapsed ? 'Show Instructions' : 'Hide Instructions';
    });

    recipesDiv.appendChild(card);
  });

  return; 
}


    if (data.length === 0) {
      recipesDiv.innerHTML = '<p>No recipes found.</p>';
      return;
    }

    data.forEach(recipe => {
      const fmtIng = (ing) => {
        if (!ing) return '';
  if (typeof ing === 'string') return ing.trim();  // handle strings from backend
  const txt =
    ing.original ??
    ing.originalName ??
    ing.name ??
    [ing.amount, ing.unit, ing.name].filter(Boolean).join(' ');
  return String(txt || '').trim();
};

data.forEach((recipe) => {
  const used = Array.isArray(recipe.usedIngredients) ? recipe.usedIngredients : [];
  const missed = Array.isArray(recipe.missedIngredients) ? recipe.missedIngredients : [];

  const usedList = used.length
    ? `<ul>${used.map(i => `<li>${fmtIng(i)}</li>`).join('')}</ul>`
    : '<p>—</p>';

  const missedList = missed.length
    ? `<ul>${missed.map(i => `<li>${fmtIng(i)}</li>`).join('')}</ul>`
    : '<p>—</p>';

  const summary = recipe.summary ? recipe.summary : 'No summary available.';
  const instructions = recipe.instructions ? recipe.instructions : 'No instructions provided.';

  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.dataset.title = (recipe.title || '').toLowerCase();

  card.innerHTML = `
    <div class="recipe-banner">
      <img src="${recipe.image}" alt="${recipe.title}">
      <div class="pin">📌</div>
      <div class="chips">
        <span class="chip have">Have ${used.length}</span>
        <span class="chip need">Need ${missed.length}</span>
      </div>
    </div>

    <div class="recipe-body">
      <h3 class="recipe-title">${recipe.title}</h3>

      <h4>Ingredients you have:</h4>
      ${usedList}

      <h4>Ingredients you need:</h4>
      ${missedList}

      <div class="summary"><strong>Summary:</strong> ${summary}</div>

      <button class="toggle-instr" type="button">Show Instructions</button>
      <div class="instructions collapsed">${instructions}</div>

      <a class="ext-link" href="https://spoonacular.com/recipes/${encodeURIComponent(recipe.title)}-${recipe.id}" target="_blank" rel="noopener">View on Spoonacular →</a>
    </div>
  `;

  // expand/collapse instructions
  const btn = card.querySelector('.toggle-instr');
  const instr = card.querySelector('.instructions');
  btn.addEventListener('click', () => {
    const isCollapsed = instr.classList.toggle('collapsed');
    btn.textContent = isCollapsed ? 'Show Instructions' : 'Hide Instructions';
  });

  recipesDiv.appendChild(card);
});
    });
    
  } catch (err) {
    console.error(err);
    recipesDiv.innerHTML = '<p>Failed to fetch recipes.</p>';
  }
});
