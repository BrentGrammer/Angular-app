import { Component, OnInit, OnDestroy } from "@angular/core";
import { Ingredient } from "src/app/shared/ingredient.model";
import { ShoppingListService } from "../shoppingList.service";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
  selector: "app-shopping-edit",
  templateUrl: "./shopping-edit.component.html",
  styleUrls: ["./shopping-edit.component.css"]
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  // store the subscription for clean up if component is destroyed
  subscription: Subscription;
  // this is set to determine what should be done when the form is submiteed - should we create a new item or
  // edit an existing one.
  editMode = false;
  // store the item index/id if editing:
  editedItemIndex: number;

  constructor(private shoppingListService: ShoppingListService) {}

  ngOnInit() {
    // This subject is emitted from the shopping-list component when an item is clicked with it's index/id
    // store the subscription for clean up if component is destroyed
    this.subscription = this.shoppingListService.startedEditing.subscribe(
      (index: number) => {
        this.editedItemIndex = index;
        // determines submit behavior to edit an existing item instead of creating a new one
        this.editMode = true;
      }
    );
  }

  onAddItem(form: NgForm) {
    const { value } = form;
    const ingredient = new Ingredient(value.name, value.amount);
    this.shoppingListService.addIngredient(ingredient);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
