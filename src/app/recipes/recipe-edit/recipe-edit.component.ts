import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { FormGroup, FormControl, FormArray } from "@angular/forms";
import { RecipeService } from "../recipe.service";

@Component({
  selector: "app-recipe-edit",
  templateUrl: "./recipe-edit.component.html",
  styleUrls: ["./recipe-edit.component.css"]
})
export class RecipeEditComponent implements OnInit {
  id: number;
  editMode = false;
  recipeForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = +params["id"];
      // check if there is an id set in dynamic route param, if not then edit mode is false and item is new and not an edit
      this.editMode = params["id"] !== null;
      this.initForm();
    });
  }

  // Determine whether to populate the form for editing or for creating a new entry based on the edit mode
  // Call this whenever the route params change (in subscription callback to route.params above) which indicates the page is reloaded
  private initForm() {
    // declare vars for form fields to prepare and fill if in edit mode or not
    let recipeName = "";
    let recipeImagePath = "";
    let recipeDescription = "";
    let recipeIngredients = new FormArray([]);

    if (this.editMode) {
      // use the injected service to get the recipe based on the id in the route params (stored in a field id)
      const recipe = this.recipeService.getRecipe(this.id);
      recipeName = recipe.name;
      recipeImagePath = recipe.imagePath;
      recipeDescription = recipe.description;
      // the recipe could possibly have no ingredients, so check before populating the form with the ingredients off the recipe retrieved
      if (recipe["ingredients"]) {
        // loop through the ingredient
        for (let ingredient of recipe.ingredients) {
          // use FormGroup since there is name and amount controls to set for the ingredient entry
          const recipeIngredient = new FormGroup({
            name: new FormControl(ingredient.name),
            amount: new FormControl(ingredient.amount)
          });

          recipeIngredients.push(recipeIngredient);
        }
      }
    }

    this.recipeForm = new FormGroup({
      name: new FormControl(recipeName),
      imagePath: new FormControl(recipeImagePath),
      description: new FormControl(recipeDescription),
      ingredients: recipeIngredients // is a form array initialized above
    });
  }

  // This getter is needed in Angular 8 to get accesses to the controls to loop through on the ingredients form controls in the html
  get controls() {
    return (<FormArray>this.recipeForm.get("ingredients")).controls;
  }

  onSubmit() {
    console.log(this.recipeForm);
  }
}
