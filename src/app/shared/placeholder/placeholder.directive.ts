import { Directive, ViewContainerRef } from "@angular/core";
/**
 * Created as part of the programmatic approach to creating the Error Alert (alert.component.ts) in auth.componet.ts
 *
 * The purpose of this directive is to inject the ViewContainerRef for creating the Error Alert
 *   (The ViewContainerRef is an internally managed object by ANgular that tells it where to generate a component in the DOM
 *     it not only has coordinatess, but also methods that can be used such as to create the component)
 *
 * The idea is to add this directive to the template html of a component to then get access to @ViewChild and then get
 * access to the ViewContainerRef to work with it from the directive
 *
 * The directive is placed on an ng-template in the html (auth.componet.html) and @ViewChild is used in the ts file to find the
 * first element that has it. This gives access to the public property ViewContainerRef created here.
 */

// Remember to add this directive to the declarations in app.module.ts!
// Directive needs the selector
@Directive({
  //selector should be an attributes selector so you can add this directive to any element:
  // i.e. an attribute on an element that you can bind this directive to
  selector: "[appPlaceholder]"
})
export class PlaceHolderDirective {
  // inject the ViewContainerRef:
  constructor(public viewContainerRef: ViewContainerRef) {}
}
