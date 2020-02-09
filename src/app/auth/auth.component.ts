import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { NgForm } from "@angular/forms";
import { AuthService, AuthResponseData } from "./auth.service";
import { Observable } from "rxjs";

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
  // inject the router to handle redirecting after user is logged in
  constructor(private authService: AuthService, private router: Router) {}

  //called from ui when switch button is clicked to change/toggle the isLoginMode property:
  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const { email, password } = form.value;

    // since the subscription logic for signin/up is the same, this holds that logic so you can just call it one time
    let authObservable: Observable<AuthResponseData>;

    // set loading flag to show spinner
    this.isLoading = true;

    if (this.isLoginMode) {
      authObservable = this.authService.login(email, password);
    } else {
      // subscribe to the observable from the auth service
      authObservable = this.authService.signup(email, password);
    }

    // subscribe logic done once after the observable is returned from login or signup
    authObservable.subscribe(
      resData => {
        console.log(resData);
        this.isLoading = false;
        this.router.navigate(["/recipes"]);
      },
      errorMessage => {
        // aervice uses pipe with catch/throwError operators to return an observable in an error case
        this.error = errorMessage;
        this.isLoading = false;
      }
    );
    form.reset();
  }
}
