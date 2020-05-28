global._babelPolyfill = false;
/*//To call them, we have 3 methods
//Method -1 
import str from './models/Search';

//Method - 2
// import {add as a, multiply, ID} from './views/searchView';   //use exact same name always from searchview or use 'as' to use alternate name for the name you have in other js file eg. only working is "add" or alternatively "add as a"
//console.log(`Using imported functions ${a(ID,2)} and ${multiply(3,5)}. ${str}`);  //if add as a => import method was used

//Method - 3
import * as searchView from './views/searchView';   //import everything from searchView.
console.log(`Using imported functions ${searchView.add(searchView.ID,2)} and ${searchView.multiply(3,5)}. ${str}`);
*/


import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 * - search object
 * - current recipe object
 * - shopping list object
 * - liked recipes
 */
const state = {};

/**
 * SEARCH CONTROLLER
 */

const controlSearch = async () => {
    //1. Get the query from view
    const query = searchView.getInput();
   
    if(query){
        //2. New Search object and add to state
        state.search = new Search(query);   // saving query to global "state" object.

        //3. Prepare UI for what happens next as results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
 
        try {
            //4. Search for recipes
        await state.search.getResults();    //we will wait. search js returns async function therefor its always a promise response so wait with response or rejection
        
       //5. Render results on UI
        clearLoader();
        searchView.renderResults(state.search.result);
        } catch (err) {
            console.log(err);
            alert('Something wrong with the search...');
            clearLoader();
    }
    }
}


if(elements.searchForm) {
    elements.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        controlSearch();
      });
}

if(elements.searchResPages){
    elements.searchResPages.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-inline');
   
      if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
      }
    });
  };

/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
    //Get ID from url
    const id = window.location.hash.replace('#', '');    //fetch from window.location which  is the url area having hash value in it.

    if(id){
        //prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highlight selected searched item
        if(state.search) searchView.highlightSelected(id);

        //Create new Recipe objbects
        state.recipe = new Recipe(id);

            try
            { 
                //Get Recipe data and parse ingredients
                await state.recipe.getRecipe();
                state.recipe.parseIngredients();

                //Calculate servings and time related
                state.recipe.calcTime();
                state.recipe.calcServings();

                //Render the recipe
                clearLoader();
                //console.log(state.recipe);

                recipeView.renderRecipe(
                    state.recipe,
                    state.likes.isLiked(id)
                );
            } 
            catch(err){
                alert('Error Processing recipes.!');
                console.log(err);
        }
    }
};

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);
//we can write it another way as below : -->

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER
 */

 const controlList = () => {
     //create a new list if there is no at that time
     if (!state.list) state.list = new List();

     //Add each ingredient to list and UI
     state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
 }

 //Handle delete and update list item event
 if (elements.shopping)
 {
    elements.shopping.addEventListener('click', (e) => {
        const id = e.target.closest('.shopping__item').dataset.itemid; 
   
        //handle delete button event
        if(e.target.matches('.shopping__delete, .shopping__delete *')) {
            //Delete from state
            state.list.deleteItem(id);
   
            //Delete from UI
            listView.deleteItem(id);
        }
        //Handle the count update
       else if (e.target.matches('.shopping__count-value')) {
            const val = parseFloat(e.target.value, 10);
            state.list.updateCount(id, val);
          }
    });
 }


 
 /**
 * LIKE CONTROLLER
 */

/////////////////////////////
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//Restore liked recipes on Page load
window.addEventListener('load', () => {
    state.likes = new Likes();  //empty while page reload
    
    //Read likes from local storage
    state.likes.readStorage();

    //Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //Render all existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

//Handling recipe button clicks
if(elements.recipe)
{
    elements.recipe.addEventListener('click', e => {
        if (e.target.matches('.btn-decrease, .btn-decrease *'))      //if the event matches to particulars being passed // the * says if clicked inside anywhere in that element that is btn-decrease element as we can click on <svg> or <use> in case we still decrease
            {
                // Decrease button clicked
                if (state.recipe.servings > 1) {
                    state.recipe.updateServings('dec');
                    recipeView.updateServingsIngredients(state.recipe);
                }
            }
        
            else if (e.target.matches('.btn-increase, .btn-increase *'))      //if the event matches to particulars being passed // the * says if clicked inside anywhere in that element that is btn-decrease element as we can click on <svg> or <use> in case we still decrease
            {
                // Increase button clicked
                state.recipe.updateServings('inc');
                recipeView.updateServingsIngredients(state.recipe);
            }
            // console.log(state.recipe); 
            else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *'))
            {
                //Add ingredients to shopping list
                controlList();
            }
            else if (e.target.matches('.recipe__love, .recipe__love *'))
            {
                //like controller
                controlLike();
            }
    });
}