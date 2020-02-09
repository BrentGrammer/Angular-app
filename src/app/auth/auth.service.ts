import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
// throwError is used in the error handling to return an observable since the auth component is subscribed and expects an observable in the error handling code
import { throwError, Subject, BehaviorSubject } from "rxjs";
import { User } from "./user.model";
import { Router } from "@angular/router";

/**
 * This auth service deals with sending requests to firebase to signup/in users and managing the user token
 */

// res payload properties got from Firebase docs: https://firebase.google.com/docs/reference/rest/auth#section-create-email-password
// You can use this now in the http.post generic so it knows what type the response data is.
export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean; // sign in response has this, but sign up response from firebase doesn't - optional for resusable interface
}

const API_KEY = "AIzaSyAKfSJsIDG4A0__gCkhibuWfJSG18hqS5s";

// use the shortcut for providing it in app module
@Injectable({ providedIn: "root" })
export class AuthService {
  /**
   *  store as a subject to be able to next the user when logging in/signing out etc in the handlers to emit the user
   *    - This will serve as a source of truth the app can subscribe to to see if a user exists and is logged in
   *      - used in the header component for example to determine which nav links to show
   *
   * **BehaviorSubject is used so that protected methods/components (like the data-storage service) can access the user token
   *   after user has already been emitted when logging in.
   *   Behavior Subject is used for this because it allows access to a previously emitted value (the user).
   *  */
  user = new BehaviorSubject<User>(null);
  // store timer keeping track of token expiration in auto logout to clear it when user logs out
  private tokenExpirationTimer: any;

  // inject the HttpClient module to make requests to firebase
  constructor(private http: HttpClient, private router: Router) {}

  // sends request to firebase url to sign user up: Needs Angular HttpClient to do this
  signup(email: string, password: string) {
    // endpoint from firebase docs: https://firebase.google.com/docs/reference/rest/auth#section-create-email-password

    // return the prepared observable so you can subscribe to it in the auth component and be aware of the state of the request
    // to show a loading indicator and handle a response or error when it occurs
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
        {
          email,
          password,
          // should always be true according to firebase docs:
          returnSecureToken: true
        }
      )
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          // create a new user - tap used for this - does not alter response data, just taps into the flow to do something with it
          const { localId, idToken, email, expiresIn } = resData;
          this.handleAuthentication(email, localId, idToken, expiresIn);
        })
      );
  }

  // run this in app.component.ts (runs early in app lifecycle) to relogin user on refresh of app if logged in and token is valid
  autoLogin() {
    // stored as string in local storage so need to parse it to object
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string; // parsed as a string from localstorage not a Date object as in the model
    } = JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
      return;
    }
    const { email, id, _token, _tokenExpirationDate } = userData;
    const loadedUser = new User(
      email,
      id,
      _token,
      new Date(_tokenExpirationDate)
    );

    // check if token is valid - getter returns null if expiration date is past
    if (loadedUser.token) {
      //emit user to app if token is present
      this.user.next(loadedUser);
      // start timer to check expiration of token
      this.autoLogout(
        new Date(_tokenExpirationDate).getTime() - new Date().getTime()
      );
    }
  }

  logout() {
    console.log("logout");
    this.user.next(null);
    // redirecting is done here and not in the component since logging out can occur from outside of the component in other places
    // (i.e. automatically logging out after expired token, etc)
    this.router.navigate(["/auth"]);
    // clear localstorage of user data:
    localStorage.removeItem("userData");
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  // sets and manages a timer to log out user if token expires
  // duration is in millisecs - the function to logout is called after this time elapses
  // this needs to be called whenever a new user is emitted to the app (in autlogin and handleAuthentication())
  autoLogout(expirationDuration: number) {
    console.log("autologout");
    // store timer to clear it on logout
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  login(email: string, password: string) {
    // pass in the data type returned in response- contains the optional registration prop per firebase docs
    // return the observable from this function so you can subscribe to it in the auth component ts class
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        {
          email,
          password,
          // should always be true according to firebase docs:
          returnSecureToken: true
        }
      )
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          const { localId, idToken, email, expiresIn } = resData;
          this.handleAuthentication(email, localId, idToken, expiresIn);
        })
      );
  }

  /** Runs when the user is successfully logged in to Firebase after request - creates a user to emit to the app and store in localstorage*/
  private handleAuthentication(
    email: string,
    userId: string,
    idToken: string,
    expiresIn: string
  ) {
    // create a date for the expiration date - this is not included in the response.  Firebase sends expiresIn which is the number of seconds until the token expires
    const currentDateInMilliSecs = new Date().getTime();
    // + converts expiresIn (string in seconds) to a number
    const expiresInMillisecs = +expiresIn * 1000;
    // wrap time millisecs in Date to turn it into a date object
    const expiration = new Date(currentDateInMilliSecs + expiresInMillisecs);
    // comes from localId: generated user id from the response from firebase
    const user = new User(email, userId, idToken, expiration);

    // use the Subject created in the user prop to emit the logged in user throughout the app by calling next on the property:
    this.user.next(user);
    // start autologout timer to check expiration:
    this.autoLogout(+expiresIn * 1000);
    // store user in local storage to persist after app refresh:
    localStorage.setItem("userData", JSON.stringify(user));
  }

  // method for error handling since the logic is the same for either signing up or logging in
  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = "An Error occurred.";

    // guard against other non firebase errors i.e. network errors:
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }

    // firebase sends back error codes in error.error.message which can be used to create messages:
    switch (errorRes.error.error.message) {
      case "EMAIL_EXISTS":
        errorMessage = "Email already exists.";
        break;
      case "EMAIL_NOT_FOUND":
        errorMessage = "The Email does not exist!";
        break;
      case "INVALID_PASSWORD":
        errorMessage = "Password invalid.";
        break;
    }

    // subscription in auth component expects a observable returned since it is subscribed.  throwError wraps the error in an observable
    // the auth component can now simply access the message in the error case
    return throwError(errorMessage);
  }
}
