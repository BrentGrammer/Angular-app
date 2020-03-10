import {
  Component,
  ComponentFactoryResolver,
  ViewChild,
  OnDestroy
} from "@angular/core";
import { Router } from "@angular/router";
import { NgForm } from "@angular/forms";
import { AuthService, AuthResponseData } from "./auth.service";
import { Observable, Subscription } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceHolderDirective } from "../shared/placeholder/placeholder.directive";

@Component({
  templateUrl: "./auth.component.html",
  selector: "app-auth"
})
export class AuthComponent implements OnDestroy {
  // determines what gets submitted in the form for switching from signup or login
  isLoginMode = true;
  // used to show spinner or not
  // on the html template, set ngIf="!isLoading" on the form to not show it if loading
  isLoading = false;
  error: string = null;

  // Use @ViewChild to get the ViewContainerRef for error alert
  // can pass in a type which viewchild will look for in the template - pass in the placeholder directive on the ng-template in html
  // as the type - ViewChild will find the first instance of the element using it.  The directive exposes the ViewContainerRef as a public property
  @ViewChild(PlaceHolderDirective, { static: false })
  alertHost: PlaceHolderDirective;

  // storing subscription to close alert event to clear it:
  private closeSub: Subscription;

  // inject the auth service to handle signing in and signing up the user etc
  // inject the router to handle redirecting after user is logged in
  /**
   * Note for programatic approach to creating error Alert:
   * @param componentFactoryResolver - this is needed to programmatically create dynamic components (such as the error Alert)
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

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
        // NOTE: if using programatic approach below this, then you wouldn't need this since it wouldn't be used in the template anymore. this is used for the ngIf Approach to creating the dynamic alert component
        this.error = errorMessage;
        // when there is an error, programatically create the error alert
        // pass in the error
        this.showErrorAlert(errorMessage);
        this.isLoading = false;
      }
    );
    form.reset();
  }

  /**
   * called from listening to the (close) event emitted from the alert component.
   * Purpose is to clear the error when error alert is closed.
   * This hinges on the ngIf pattern where the alert component in auth html is only displaying if this.error is truthy ( Ex: *ngIf="error")
   */
  onHandleError() {
    this.error = null;
  }

  /**
   * Imperative Programmatic approach to creating a dynamic component:
   *
   * This is called in the authObservable.subscribe callback when an error occurs
   *
   * To create the Alert component programmatically, you need to inject Angular's ComponentFactoryResolver in the constructor and
   *   use that to create a component.
   */
  private showErrorAlert(message: string) {
    //create the component by calling the resolveComponentFactory method and pass in just the type of the component
    // This method returns a component factory (NOT the component itself!!)
    const alertComponentFactory = this.componentFactoryResolver.resolveComponentFactory(
      AlertComponent
    );

    // find and access the viewContainerRef from the @ViewChild(placeholderDirective) - the directive exposes the ViewContainerRef created as a public property
    // constant created to keep code less verbose, it is not necessary
    const hostViewContainerRef = this.alertHost.viewContainerRef;
    // clear anything there that might have been rendered before:
    hostViewContainerRef.clear(); //clear everything before you render something new

    // use factory to create new component in hostViewContainer using built in method on the ViewContainerRef:
    // Pass in the factory created for generating the component
    const componentRef = hostViewContainerRef.createComponent(
      alertComponentFactory
    );

    // interact with the ref to the component created by accessing built in instance property
    // instance has access to attributes and properties on the component (the alert component)
    // set props on the component using the instance prop:
    componentRef.instance.message = message; // set the message to the error message passed in

    // normally you want to use a subject instead of an event emitter when manually subscribing to something.  Here is an exception:
    this.closeSub = componentRef.instance.close.subscribe(() => {
      // clear the close subscription since the component will be removed (destroyed) on close to prevent memory leak.
      // *** REmember to unsunscribe in the onDestroy of the parent component here as well
      this.closeSub.unsubscribe();
      // clear all content rendered in the view container ref:
      hostViewContainerRef.clear();
    });
  }

  ngOnDestroy() {
    // first check if there is a subscription - there is only a sub if there is an error, otherwise there is no sub to unsubscribe from.
    if (this.closeSub) this.closeSub.unsubscribe();
  }
}
