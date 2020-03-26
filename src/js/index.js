import Search from "./models/Search";
import Recipe from "./models/Recipe";
import Likes from "./models/Likes";
import List from "./models/List";
import * as searchView from "./view/searchView";
import * as recipeView from "./view/searchRecipe";
import * as listView from "./view/listView";
import * as likesView from "./view/likesView";
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
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (err) {
      alert("error procesing recipe");
    }
  }
};

["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

//LIST CONTROLLER

const controlList = () => {
  //create a new list if there in none yet
  if (!state.list) state.list = new List();

  //ADD EACH INGREDIENT
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

//HANDLE DELETE AND UPDATE LIST ITEM EVENTS SHOPPINLIST
elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;
  // HANDLE THE DELETE ITEM
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    //DELETE FROM STATE
    state.list.deleteItem(id);
    //DELETE FROM UI
    listView.deleteItem(id);
    //  handle the count update
  } else if (
    e.target.matches(".shopping__count-value .shopping__count-value *")
  ) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

//LIke CONTROLLER

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;
  //USER HAS NOT YET LIKE CURRENT RECIPE
  if (!state.likes.isLiked(currentID)) {
    //ADD LIKE TO state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    //toggle the like button
    likesView.toogleLikeBtn(true);
    //add like to ui list
    likesView.renderLike(newLike);
    //USER HAS LIKED CURRENT RECIPE
  } else {
    //remove LIKE TO state
    state.likes.deleteLike(currentID);
    //toggle the like button
    likesView.toogleLikeBtn(false);
    //remove like from ui list
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// restore like recipe on page load
window.addEventListener("load", () => {
  state.likes = new Likes();
  // restore likes from localstorage
  state.likes.readStorage();
  //toogle like menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes());
  // Render the existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

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
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    //add ingredients to shoping list
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    // LIKE CONTROLLER
    controlLike();
  }
});
