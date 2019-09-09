import { Ingredient } from "../shared/ingredient.model";
import { EventEmitter } from "@angular/core";

export class ShoppingListService {
  ingredientsChanged = new EventEmitter<Ingredient[]>();

  private ingredients: Ingredient[] = [
    new Ingredient("Apples", 5),
    new Ingredient("Tomatoes", 10)
  ];

  getIngredients() {
    return this.ingredients.slice();
  }

  addIngredient(ingredient: Ingredient) {
    this.ingredients.push(ingredient);
    // Because the shopping list is working with a copy of ingredients, you need to inform the component that the list
    // updated and pass in the updated copy
    this.ingredientsChanged.emit(this.ingredients.slice());
    // (In the component(shopping-list) where you want to update the list, subscribe to this event)
  }

  addIngredients(ingredients: Ingredient[]) {
    // you can also spread arrays into the push to add multiple els
    // this.ingredients.push(...ingredients);
    ingredients.forEach(ing => this.ingredients.push(ing));
    this.ingredientsChanged.emit(this.ingredients.slice());
  }
}
