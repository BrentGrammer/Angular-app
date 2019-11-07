import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { FormGroup, FormControl, FormArray, Validators } from "@angular/forms";
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

  // This getter is needed in Angular 8 to get accesses to the controls to loop through on the ingredients form controls in the html
  get controls() {
    return (<FormArray>this.recipeForm.get("ingredients")).controls;
  }

  // This method adds a new form group of fields for inputting the name and amount of a new ingredient to add to the recipe
  // there is a ngFor loop in the formgroup in the html that renders form group fields for each item in the form array in the
  // form object ingredients property.  This pushes a new empty form group onto that array to generate inputs in the html
  // note that the button in the html receives the type of button to prevent form submission when this is called on click
  onAddIngredient() {
    // need to cast it to FormArray since Typescript doesn't know what type it is
    // This is done so you can call push on the form array
    (<FormArray>this.recipeForm.get("ingredients")).push(
      new FormGroup({
        name: new FormControl(null, Validators.required),
        amount: new FormControl(null, [
          Validators.required,
          Validators.pattern(/^[1-9]+[0-9]*$/)
        ])
      })
    );
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
          // use FormGroup since there is name and amount controls to set for the ingredient entry - a group of inputs
          const recipeIngredient = new FormGroup({
            name: new FormControl(ingredient.name, Validators.required),
            amount: new FormControl(ingredient.amount, [
              Validators.required,
              Validators.pattern(/^[1-9]+[0-9]*$/) // only positive nums
            ])
          });

          recipeIngredients.push(recipeIngredient);
        }
      }
    }

    // Add validation here to controls
    this.recipeForm = new FormGroup({
      name: new FormControl(recipeName, Validators.required),
      imagePath: new FormControl(recipeImagePath, Validators.required),
      description: new FormControl(recipeDescription, Validators.required),
      ingredients: recipeIngredients // is a form array initialized above
    });
  }

  onSubmit() {
    console.log(this.recipeForm);
  }
}
