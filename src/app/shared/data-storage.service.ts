import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { RecipeService } from "../recipes/recipe.service";
import { Recipe } from "../recipes/recipe.model";
/**
 * Service for working with http requests
 *
 * This service is injectable because it injects a resource service (the recipes service) which avoids the necessity of having to
 * provide resources as arguments(i.e. for updating etc.).  This service can simply use the resource service to get what it needs
 * and use the service to update etc.
 */

const BASE_URL =
  "https://angular-recipes-app-584be.firebaseio.com/recipes.json";

@Injectable({ providedIn: "root" })
export class DataStorageService {
  constructor(private http: HttpClient, private recipeService: RecipeService) {}

  // storeRecipes is called in the header component when the save data button is pressed
  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    console.log("rec", recipes);
    this.http.put(BASE_URL, recipes).subscribe(response => {
      console.log("data saved", response);
    });
  }

  // no return of the observable to subscribe in this method because the header component isn't interested in the response
  fetchRecipes() {
    // add generic annotation to tell ts that the recipes in the response subscribe callback is of type Recipe[],
    // otherwise it just sees it as a response body: any which will cause a ts error when passing in recipes to setRecipes
    this.http.get<Recipe[]>(BASE_URL).subscribe(recipes => {
      // Use the recipe service to update the list.
      // The recipe service then emits the new list to interested and subscribed components.
      //
      this.recipeService.setRecipes(recipes);
    });
  }
}
