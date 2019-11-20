import { Component } from "@angular/core";
import { DataStorageService } from "../shared/data-storage.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html"
})
export class HeaderComponent {
  constructor(private dataStorageService: DataStorageService) {}

  onSelect(feature: string) {}

  onSaveData() {
    console.log("called");
    this.dataStorageService.storeRecipes();
  }

  // Once data is fetched, the service also calls on the recipes service to update the list with the fetched data
  onFetchData() {
    this.dataStorageService.fetchRecipes();
  }
}
