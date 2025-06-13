import { Directive, inject, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { AppState } from "../../app.config";
import { Store } from "@ngrx/store";
import { getAccessToken } from "../../core/auth/store/auth.selectors";
import { distinctUntilChanged, map } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Directive({
  selector: "[fbIfLogged]",
  standalone: true
})
export class IfLoggedDirective implements OnInit {
  private template: TemplateRef<any> = inject(TemplateRef);
  private view: ViewContainerRef = inject(ViewContainerRef);
  private store: Store<AppState> = inject(Store);

  isLogged = this.store.select(getAccessToken).pipe(
    map(token => !!token),
    distinctUntilChanged(),
    takeUntilDestroyed()
  );

  ngOnInit(): void {
    this.isLogged.subscribe(isLogged => {
      if(isLogged) {
        this.view.createEmbeddedView(this.template);
      } else {
        this.view.clear();
      }
    })
  }

}
