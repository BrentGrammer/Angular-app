import { Component } from "@angular/core";

@Component({
  selector: "app-loading-spinner",
  // from loading.io/css -- since it is so short, just inline the template html
  template: '<div class="lds-spinner"><div></div><div></div><div></div><div>',
  styleUrls: ["./loading-spinner.component.css"]
})
export class LoadingSpinnerComponent {}
