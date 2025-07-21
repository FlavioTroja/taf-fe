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
        // cerco l'input interno
        const nativeInput = this.host.nativeElement.querySelector('input');
        if ( nativeInput ) {
          nativeInput.focus();
        } else {
          // fallback: provo comunque sul host
          this.host.nativeElement.focus?.();
        }
      });
    }
  }
}
