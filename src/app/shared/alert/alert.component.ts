import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-alert",
  templateUrl: "./alert.component.html",
  styleUrls: ["./alert.component.css"]
})
export class AlertComponent {
  // add input to be able to set message from outside of component template and ts file
  @Input() message: string;
  /**
   * Make listenable from outside to get rid of the Alert
        - no need to transfer data so pass in void as generic type of data to send
        - the only purpose is to emit an event to say the alert was closed
   * 
   *   In the auth component html you can listen to the (close) event on app-alert injected
   *      - you can call a method on the auth component when this event is emitted (a handle error method for example which sets the error back to null to clear it)
   *        - purpose of this alert in this case is to pop up if there is an error on the auth component when logging in, etc.
   *  
   * 
   * */

  @Output() close = new EventEmitter();

  // This method is triggered via a (click) listener on the alert component html
  // on the close button and on the backdrop element
  onClose() {
    // manually emit the close event created above
    this.close.emit();
  }
}
