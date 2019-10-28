import { Component, OnInit } from "@angular/core";

import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "./shoppingList.service";

@Component({
  selector: "app-shopping-list",
  templateUrl: "./shopping-list.component.html",
  styleUrls: ["./shopping-list.component.css"]
})
export class ShoppingListComponent implements OnInit {
  ingredients: Ingredient[];

  constructor(private shoppingListService: ShoppingListService) {}

  ngOnInit() {
    this.ingredients = this.shoppingListService.getIngredients();
    this.shoppingListService.ingredientsChanged.subscribe(
      (ingredients: Ingredient[]) => (this.ingredients = ingredients)
    );
  }

  // handler when an item in the list is clicked to edit
  onEditItem(index: number) {
    // startedEditing is a Subject created which will emit the index of the item being edited
    // The shopping-edit component is listening for this emission with the item index/id to edit
    this.shoppingListService.startedEditing.next(index);
  }
}
