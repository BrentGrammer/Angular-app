import { Ingredient } from "../shared/ingredient.model";
import { Subject } from "rxjs";

export class ShoppingListService {
  ingredientsChanged = new Subject<Ingredient[]>();
  // used in shopping-list.ts component to emit the index of the item being edited
  startedEditing = new Subject<number>();

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
    // This passes in the new ingredients array to shopping list component ts file which is subscribed to this subject
    this.ingredientsChanged.next(this.ingredients.slice());
    // (In the component(shopping-list) where you want to update the list, subscribe to this event)
  }

  addIngredients(ingredients: Ingredient[]) {
    // you can also spread arrays into the push to add multiple els
    // this.ingredients.push(...ingredients);
    ingredients.forEach(ing => this.ingredients.push(ing));
    this.ingredientsChanged.next(this.ingredients.slice());
  }

  updateIngredient(index: number, newIngredient: Ingredient) {
    this.ingredients[index] = newIngredient;
    // emit the updated ingredients list to components that are subscribed to it
    this.ingredientsChanged.next(this.ingredients.slice());
  }

  // get an ingredient being edited on the shopping-edit component:
  getIngredient(index: number): Ingredient {
    return this.ingredients[index];
  }
}
