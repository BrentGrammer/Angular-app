import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { RecipeService } from "../recipes/recipe.service";
import { Recipe } from "../recipes/recipe.model";
import { map, tap } from "rxjs/operators";
/**
 * Service for working with http requests
 *
 * This service is injectable because it injects a resource service (the recipes service) which avoids the necessity of having to
 * provide resources as arguments(i.e. for updating etc.).  This service can simply use the resource service to get what it needs
 * and use the service to update etc.
 */

@Injectable({ providedIn: "root" })
export class DataStorageService {
  BASE_URL = "https://angular-recipes-app-584be.firebaseio.com";
  constructor(private http: HttpClient, private recipeService: RecipeService) {}

  // storeRecipes is called in the header component when the save data button is pressed
  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.http
      .put(`${this.BASE_URL}/recipes.json`, recipes)
      .subscribe(response => {
        console.log("data saved", response);
      });
  }

  // no return of the observable to subscribe in this method because the header component isn't interested in the response
  fetchRecipes() {
    // add generic annotation to tell ts that the recipes in the response subscribe callback is of type Recipe[],
    // otherwise it just sees it as a response body: any which will cause a ts error when passing in recipes to setRecipes
    /**
     * the Observable here is returned so that the recipes-resolver.service.ts can subscribe to it to act as a guard
     * to make sure that components depending on having recipes available and fetched will get them without a manual fetch
     */
    return this.http.get<Recipe[]>(`${this.BASE_URL}/recipes.json`).pipe(
      map(recipes => {
        return recipes.map(recipe => {
          // this prevents errors in case ingredients are null - used as a null check
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : []
          };
        });
      }),
      tap(recipes => {
        // tap into the request data to set it to the recipes list and the recipes resolver will take the Observable returned and subscribe to it
        this.recipeService.setRecipes(recipes);
      })
    );
  }
}
