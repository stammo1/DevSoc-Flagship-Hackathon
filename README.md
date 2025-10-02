# Meal Planner

A simple meal planner web application designed to help students prepare meals based on ingredients they have, nutrition requirements, and dietary goals. Users can input personal details such as weight, activity level, and fitness goals to get tailored suggestions.

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [API](#api)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## Tech Stack

**Front End**  
- HTML  
- CSS  
- JavaScript  

**Back End**  
- Node.js (Express)  
- Axios (for API requests)  
- dotenv (for environment variables)
- CORS (for cross-origin requests)
---

## API
- [Spoonacular](https://spoonacular.com/food-api) — used for recipes, nutrition analysis, and meal planning.

---

## Features
- Search for recipes using ingredients you already own  
- Get meal suggestions tailored to caloric needs (bulk, cut, maintain)  
- Nutrition breakdown per recipe  
- Input personal details (weight, age, gender, activity level, etc.) for customized suggestions  
- Simple, responsive UI  

---

## Prerequisites

- Node.js (version 18 or higher)
- npm (Node Package Manager)
- A Spoonacular API account (free tier available)

---


## Get Your Spoonacular API Key

- Visit https://spoonacular.com/food-api
- Click on "Start Now" or "Get Access" button
- Sign up for a free account using your email address
- After logging in, navigate to your profile/dashboard
- Go to the "My Console" or "API Key" section
- Copy your API key

---

## Setup Instructions
1. Clone the repository:  
   ```
   git clone <repository-url>
   ```
2. Install dependencies in 'backend' folder:
    ```
    npm install
    ```
3. Create a file called '.env' and store API key:
    ```
    SPOONACULAR_KEY=YOUR_API_KEY
    ```
4. Start the server in 'backend' folder:
    ```
    node .
    ```
