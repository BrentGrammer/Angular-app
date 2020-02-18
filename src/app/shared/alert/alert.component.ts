import { Component, Input } from "@angular/core";

@Component({
  selector: "app-alert",
  templateUrl: "./alert.component.html",
  styleUrls: ["./alert.component.css"]
})
export class AlertComponent {
  // add input to be able to set message from outside of component template and ts file
  @Input() message: string;
}
