import { Injectable } from "@angular/core";
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";
import { Recipe } from "./recipe.model";
import { DataStorageService } from "../shared/data-storage.service";

/**
 * This resolver ensures that when a page loads it has data that it depends on.
 * Since data is stored on the backend, it needs to be fetched for routes that depend on it
 *
 * This resolver loads data before the recipes list page is loaded
 *
 * Used on the recipe-detail and recipe-edit components in case they are refreshed (so data is fetched automatically)
 * (added in the routing module)
 */

@Injectable({ providedIn: "root" }) // Generic takes type that is returned
export class RecipesResolverService implements Resolve<Recipe[]> {
  constructor(private dataStorageService: DataStorageService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // NOte: no subscribe() call is necessary here because the resolver will subscribe automatically to find out once data is present
    return this.dataStorageService.fetchRecipes();
  }
}
