import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
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
  // Get a reference to the edit form in the html to assign item being edited data to
  @ViewChild("f") shoppingListForm: NgForm;
  // store the subscription for clean up if component is destroyed
  subscription: Subscription;
  // this is set to determine what should be done when the form is submiteed - should we create a new item or
  // edit an existing one.
  editMode = false;
  // store the item index/id if editing:
  editedItemIndex: number;
  editedItem: Ingredient;

  constructor(private shoppingListService: ShoppingListService) {}

  ngOnInit() {
    // This subject is emitted from the shopping-list component when an item is clicked with it's index/id
    // store the subscription for clean up if component is destroyed
    this.subscription = this.shoppingListService.startedEditing.subscribe(
      (index: number) => {
        this.editedItemIndex = index;
        // determines submit behavior to edit an existing item instead of creating a new one
        this.editMode = true;
        // get the ingredient being edited from the list in the service:
        this.editedItem = this.shoppingListService.getIngredient(index);
        // assign editing item data to fill out form:
        this.shoppingListForm.setValue({
          name: this.editedItem.name,
          amount: this.editedItem.amount
        });
      }
    );
  }

  onSubmit(form: NgForm) {
    const { value } = form;
    const newIngredient = new Ingredient(value.name, value.amount);
    // prevent adding an item if editing, just add item info to array in service:
    if (this.editMode) {
      this.shoppingListService.updateIngredient(
        this.editedItemIndex,
        newIngredient
      );
    } else {
      this.shoppingListService.addIngredient(newIngredient);
    }
    // reset editMode to prevent bug if editing a item and submitting - update button remains since mode isn't reset
    this.editMode = false;
    form.reset();
  }

  onClear() {
    this.shoppingListForm.reset();
    // reset flag so user isn't updating anything when entering a new entry
    this.editMode = false;
  }

  onDelete() {
    this.shoppingListService.deleteIngredient(this.editedItemIndex);
    this.onClear();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
