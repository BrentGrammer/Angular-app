import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthService } from "./auth.service";

@Component({
  templateUrl: "./auth.component.html",
  selector: "app-auth"
})
export class AuthComponent {
  // determines what gets submitted in the form for switching from signup or login
  isLoginMode = true;
  // used to show spinner or not
  // on the html template, set ngIf="!isLoading" on the form to not show it if loading
  isLoading = false;
  error: string = null;

  // inject the auth service to handle signing in and signing up the user etc

  constructor(private authService: AuthService) {}

  //called from ui when switch button is clicked to change/toggle the isLoginMode property:
  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const { email, password } = form.value;

    // set loading flag to show spinner
    this.isLoading = true;

    if (this.isLoginMode) {
      //...
    } else {
      // subscribe to the observable from the auth service
      this.authService.signup(email, password).subscribe(
        resData => {
          console.log(resData);
          this.isLoading = false;
        },
        errorMessage => {
          // aervice uses pipe with catch/throwError operators to return an observable in an error case
          this.error = errorMessage;
          this.isLoading = false;
        }
      );
    }
    form.reset();
  }
}
