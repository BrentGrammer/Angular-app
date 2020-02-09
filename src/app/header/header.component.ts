import { Component, OnInit, OnDestroy } from "@angular/core";
import { DataStorageService } from "../shared/data-storage.service";
import { AuthService } from "../auth/auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html"
})
export class HeaderComponent implements OnInit, OnDestroy {
  // this is used by the html template and is updated when the subscription callback to the user subject emitting occurs
  isAuthenticated = false;
  // store the subscription to the user subject so you can unsubscribe later when component is destroyed
  // the user subject is used to listen to and update isAuthenticated as user status changes
  private userSub: Subscription;
  // inject auth service to access User subject for determining navlinks to show based on if a user exists and is logged in
  constructor(
    private dataStorageService: DataStorageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // store sub so you can unsubscribe when component is destroyed
    this.userSub = this.authService.user.subscribe(user => {
      // user is null if not logged in, otherwise there is a user
      this.isAuthenticated = !!user;
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  onSelect(feature: string) {}

  onSaveData() {
    this.dataStorageService.storeRecipes();
  }

  // Once data is fetched, the service also calls on the recipes service to update the list with the fetched data
  onFetchData() {
    // no function passed to subscribe because the header component doesn't care about the response data
    this.dataStorageService.fetchRecipes().subscribe();
  }
}
