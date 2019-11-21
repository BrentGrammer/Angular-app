import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "./recipe.model";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shoppingList.service";
import { Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class RecipeService {
  /**
   * Because the recipes array returned in getRecipes here is a copy used by recipe list in ngInit, you need to create a subject
   * to signal when recipes has changed after a recipe-edit form submit so the list can update.
   * The subject will emit an array of type Recipes[]
   * Subscribe to this in the ngOnInit of the recipe-list component.
   *
   * Use this to emit the new recipes array in the addRecipe and updateRecipe methods in this service.
   *
   * Note Gotcha: This service needs to be added to a Providers list in the app.module.ts instead of in the recipes parent component
   * to avoid it being destroyed when navigating away from components in the recipe heirarchy using it.  This prevents a bug where
   * navigating back to the list causes the instance of this service to be destroyed since the form is in the children on the
   * recipes component routing module.
   * You need to place it in the top level module so it survives when recipes parent component is destroyed when navigating outside
   * of it's heirarchy (i.e. to the shopping-list page)
   *
   */
  recipesChanged = new Subject<Recipe[]>();
  recipeSelected = new EventEmitter<Recipe>();

  private recipes: Recipe[] = [
    // new Recipe(
    //   "test recipe",
    //   "test description",
    //   "https://cdn.pixabay.com/photo/2016/01/03/17/59/bananas-1119790__340.jpg",
    //   [new Ingredient("Meat", 1), new Ingredient("eggs", 20)]
    // )
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

  // setRecipes is called after a component gets data from the db and wants to update the recipes service
  setRecipes(recipes: Recipe[]) {
    this.recipes = recipes;
    // inform subscribed components of the update and emit a copy
    this.recipesChanged.next(this.recipes.slice());
  }

  // called when recipe edit form is submitted
  updateRecipe(index: number, newRecipe: Recipe) {
    this.recipes[index] = newRecipe;
    this.recipesChanged.next(this.recipes.slice());
  }

  deleteRecipe(index: number) {
    this.recipes.splice(index, 1);
    // emit a copy of the updated recipes list to subscribed components
    this.recipesChanged.next(this.recipes.slice());
  }
}
