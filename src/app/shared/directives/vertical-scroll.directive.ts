import {Directive, ElementRef, HostListener} from "@angular/core";

@Directive({
  selector: "[appVerticalScroll]",
  standalone: true
})
export class VerticalScrollDirective {
  constructor(private element: ElementRef) {}

  @HostListener("wheel", ["$event"])
  public onScroll(event: WheelEvent) {
    this.element.nativeElement.scrollTop += event.deltaY;
  }
}
