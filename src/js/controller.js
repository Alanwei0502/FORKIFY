import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable'; //for polyfilling everything else
import 'regenerator-runtime/runtime'; //for polyfilling async/await
import { async } from 'regenerator-runtime';

// if (module.hot) {
//   module.hot.accept();
// }

// API documentation
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
// TITLE: Loading a Recipe from API
// NOTE: NPM
// initiate npm: npm init
// change script: "start","build"
// install parcel: npm i parcel@next -D
// run start: npm start

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    // guard clause
    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultaPage());

    // 1) updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    // resultsView.renderSpinner();
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    resultsView.render(model.getSearchResultaPage());

    // 4) Render initaial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render new results
  resultsView.render(model.getSearchResultaPage(goToPage));

  // 2) Render pagination buttons
  paginationView.render(model.state.search);
};

// TITLE: Updating Recipe Servings
const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    // NOTE: history API's pushState() method
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('@_@', err);
    addRecipeView.renderError(err.message);
  }
};

// TITLE: Listening For load and hashchange Events
// window.addEventListener('hashchange', showRecipe);
// window.addEventListener('load', showRecipe);
// ['hashchange', 'load'].forEach(ev =>
//   window.addEventListener(ev, controlRecipes)
// );
// TITLE: Event Handlers in MVC: Publisher-Subscriber Pattern
// NOTE: Events should be handled in the controller (otherwise we would have application logic in the view). Events should be listened for in the view (otherwise we would need DOM elements in the controller).
// QUESTION: Why not simply call the controlRecipes function right from the view whenever an event occurs?
// NOTE: That's acutally not possible because in the way we set up the architecture, the view does not know anything about the controller. So it doesn't import the controller and so we can't call any of the functions that are in the controller from the view.
// NOTE: Fortunately, there is a good solution and this solution is called "Publisher-Subscriber Design Pattern". We have publisher which is some code(addHandlerRender function) that knows when to react. On the other hand, we have a subscriber which is code that actually wants to react. This is the code that should actually be executed when the event happens.
// NOTE: The solution is that we now can subscribe to the publisher by passing into subscriber function as an argument. In practice that, as soon as the program loads, the init function is called which in turn immediately calls the addHandlerRender function from the view. That's possible because controller does import both view and the model.
// NOTE: 1)controlRecipes will be passed into addHandlerRender when program starts. 2)addHandlerRender listens for events(addEventListener), and uses controlRecipes as callback.
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

// TITLE: Refactoring for MVC
// creating a views folder with recipeView.js and creating a model.js

// TITLE: Helpers and Configuration File
// many real world applications have two special modules that are completely independent of the rest of the architecture. And these are a module for the project configuration and also a module for some general helper functions that are gonna be useful across the entire project.
// creating config.js
