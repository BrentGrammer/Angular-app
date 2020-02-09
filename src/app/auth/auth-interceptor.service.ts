import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpParams
} from "@angular/common/http";
import { AuthService } from "./auth.service";
import { take, exhaustMap } from "rxjs/operators";

/**
 * Feature provided by The Http Module
 * Intercepts all requests with functionality so the logic does not have to be diplicated in requests.
 *
 * exhaustMap turns the final returned observable into an http observable after the user subject observable completes.
 */

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  // import auth service to get user token
  constructor(private authService: AuthService) {}

  // add a auth token to the intercepted request
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    //use exhaustMap to get user token from first observable and then return the handle observable
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        // check if user is not logged in and just pass on the request without adding auth token to prevent error being thrown
        // if request is coming from the login page for example to log the user in - cannot have an auth token with this request
        if (!user) {
          return next.handle(request);
        }
        // after getting token, edit the request to add the token and then send it through with next.handle
        const modifiedReq = request.clone({
          params: new HttpParams().set("auth", user.token)
        });
        return next.handle(modifiedReq);
      })
    );
  }
}
