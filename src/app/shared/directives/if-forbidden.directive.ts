import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { AppState } from "../../app.config";
import { Store } from "@ngrx/store";
import { distinctUntilChanged, Subject, takeUntil } from "rxjs";
import { Roles } from "../../models/User";
import { disabledByRolesSelector } from "../../core/profile/store/profile.selectors";

@Directive({
  selector: "[fbIfForbidden]",
  standalone: true
})
export class IfForbiddenDirective implements OnInit {
  @Input({ required: false }) fbIfForbidden?: Roles[] | undefined;

  private template: TemplateRef<any> = inject(TemplateRef);
  private view: ViewContainerRef = inject(ViewContainerRef);
  private store: Store<AppState> = inject(Store);
  subject = new Subject();

  ngOnInit(): void {
    if(!this.fbIfForbidden) {
      this.view.createEmbeddedView(this.template);
      return;
    }

    this.store.select(disabledByRolesSelector(this.fbIfForbidden || [])).pipe(
      distinctUntilChanged(),
      takeUntil(this.subject)
    ).subscribe(isDisabled => {

      if(!isDisabled) {
        this.view.createEmbeddedView(this.template);
      } else {
        this.view.clear()
      }

    });

  }

}
