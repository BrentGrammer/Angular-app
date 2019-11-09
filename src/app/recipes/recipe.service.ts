import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "./recipe.model";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shoppingList.service";
import { Subject } from "rxjs";

@Injectable()
export class RecipeService {
  /**
   * Because the recipes array returned in getRecipes here is a copy used by recipe list in ngInit, you need to create a subject
   * to signal when recipes has changed after a recipe-edit form submit so the list can update.
   * The subject will emit an array of type Recipes[]
   * Subscribe to this in the ngOnInit of the recipe-list component.
   *
   * Use this to emit the new recipes array in the addRecipe and updateRecipe methods in this service.
   *
   */
  recipesChanged = new Subject<Recipe[]>();
  recipeSelected = new EventEmitter<Recipe>();

  private recipes: Recipe[] = [
    new Recipe(
      "test recipe",
      "test description",
      "https://cdn.pixabay.com/photo/2016/01/03/17/59/bananas-1119790__340.jpg",
      [new Ingredient("Meat", 1), new Ingredient("eggs", 20)]
    )
  ];

  constructor(private slService: ShoppingListService) {}

  // called by the recipe list component when it initializes
  getRecipes() {
    // return a slice so you don't return a direct reference to the private array - this is how JS works - slice creates
    // a copy.
    return this.recipes.slice();
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]) {
    this.slService.addIngredients(ingredients);
  }

  getRecipe(index: number) {
    return this.recipes[index];
  }

  // called when recipe edit form is submitted
  addRecipe(recipe: Recipe) {
    this.recipes.push(recipe);
    // use the subject created to emit the updated recipes to the recipe-list component to update the list
    this.recipesChanged.next(this.recipes.slice());
  }

  // called when recipe edit form is submitted
  updateRecipe(index: number, newRecipe: Recipe) {
    this.recipes[index] = newRecipe;
    this.recipesChanged.next(this.recipes.slice());
  }
}
