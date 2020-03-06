import Search from "./models/Search";
import * as searchView from "./view/searchView";
import { elements, renderLoader, clearLoader } from "./view/base";

// Global state
// *search object
// *current recipe object
// *shopping list object
// *liked recipes
const state = {};

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
    //search for recipes
    await state.search.getResult();
    clearLoader();
    //render result on UI
    searchView.renderResult(state.search.result);
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});
