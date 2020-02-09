import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { map, take } from "rxjs/operators";

type GuardReturn =
  | boolean
  | UrlTree
  | Promise<boolean | UrlTree>
  | Observable<boolean | UrlTree>;

/**
 * Auth guard to prevent user accessing recipes route when not logged in
 *
 */
@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot
  ): GuardReturn {
    // return the observable user and use pipe to transform the user it resolves to to a boolean:
    // use take(1) so that you do not remain subscribed to the user Subject which could lead to side effects
    return this.authService.user.pipe(
      take(1),
      map(user => {
        const isAuth = !!user;
        if (isAuth) {
          return true;
        }
        // new feature in A8: you can return a UrlTree in a guard which will redirect if false condition and prevent race conditions
        return this.router.createUrlTree(["/auth"]);
      })
    );
  }
}
