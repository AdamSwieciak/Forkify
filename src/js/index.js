import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import * as searchView from "./view/searchView";
import * as recipeView from "./view/searchRecipe";
import { elements, renderLoader, clearLoader } from "./view/base";

// Global state
// *search object
// *current recipe object
// *shopping list object
// *liked recipes
const state = {};

// SEARCH CONTROLLER

const controlSearch = async () => {
  //Get query rom the view
  const query = searchView.getInput();

  if (query) {
    // new search oject and added state

    state.search = new Search(query);

    // prepare ui for result
    searchView.clearInput();
    searchView.clearResult();
    renderLoader(elements.searchRes);
    try {
      //search for recipes
      await state.search.getResult();
      clearLoader();
      //render result on UI
      searchView.renderResult(state.search.result);
    } catch (err) {
      alert("serch controll error");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResult();
    searchView.renderResult(state.search.result, goToPage);
  }
});

// RECIPE CONTROLLER

const controlRecipe = async () => {
  //GET ID FROM URL
  const id = window.location.hash.replace("#", "");

  if (id) {
    //PREPARE UI FOR CHANGED
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    if (state.search) searchView.highlightSelected(id);
    //CREATE NEW RECIPE OBJECT
    state.recipe = new Recipe(id);

    try {
      //GET RECIPE DATA and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      //CALCULATE SERVINGS AND TIME
      state.recipe.calcTime();
      state.recipe.calcServings();
      //RENDER RECIPE
      clearLoader();
      recipeView.renderRecipe(state.recipe);
    } catch (err) {
      alert("error procesing recipe");
    }
  }
};

["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

// HANDLING RECIPE BUTTON CLICKS
elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    //decease is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngedient(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngedient(state.recipe);
  }
});

window.l = new List();
