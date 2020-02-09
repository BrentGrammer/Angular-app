import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError } from "rxjs/operators";
// throwError is used in the error handling to return an observable since the auth component is subscribed and expects an observable in the error handling code
import { throwError } from "rxjs";

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
  // inject the HttpClient module to make requests to firebase
  constructor(private http: HttpClient) {}

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
      .pipe(catchError(this.handleError));
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
      .pipe(catchError(this.handleError));
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
