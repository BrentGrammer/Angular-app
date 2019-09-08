import { EventEmitter } from "@angular/core";
import { Recipe } from "./recipe.model";

export class RecipeService {
  recipeSelected = new EventEmitter<Recipe>();

  private recipes: Recipe[] = [
    new Recipe(
      "test recipe",
      "test description",
      "https://cdn.pixabay.com/photo/2016/01/03/17/59/bananas-1119790__340.jpg"
    )
  ];

  getRecipes() {
    // return a slice so you don't return a direct reference to the private array - this is how JS works - slice creates
    // a copy.
    return this.recipes.slice();
  }
}
