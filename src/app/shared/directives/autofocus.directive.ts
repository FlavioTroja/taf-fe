import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective implements OnChanges {
  @Input('appAutofocus') enabled = true;

  constructor(private host: ElementRef<HTMLElement>) {
  }

  ngOnChanges() {
    if ( this.enabled ) {
      setTimeout(() => {
        const nativeInput = this.host.nativeElement.querySelector('input');
        if ( nativeInput ) {
          nativeInput.focus();
        } else {
          this.host.nativeElement.focus?.();
        }
      });
    }
  }
}
