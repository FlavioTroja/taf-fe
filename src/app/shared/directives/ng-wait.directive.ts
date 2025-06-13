import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";

@Directive({
  selector: "[fbNgWait]",
  standalone: true
})
export class NgWaitDirective implements OnInit {
  @Input({ required: true }) fbNgWait!: number;

  private template: TemplateRef<any> = inject(TemplateRef);
  private view: ViewContainerRef = inject(ViewContainerRef);
  ngOnInit(): void {
    setTimeout(() => this.view.createEmbeddedView(this.template));
    setTimeout(() => this.view.clear(), this.fbNgWait);
  }

}
