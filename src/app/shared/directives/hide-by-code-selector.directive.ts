import {
  Directive,
  inject,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from "@angular/core";
import { AppState } from "../../app.config";
import { Store } from "@ngrx/store";
import {distinctUntilChanged, filter, Subject, Subscription, takeUntil} from "rxjs";
import { getHideSections } from "../../core/hide/store/hide.selectors";

@Directive({
  selector: "[fbHideByCodeSelector]",
  standalone: true
})
export class HideByCodeSelectorDirective implements OnInit, OnDestroy {
  @Input({ required: true }) fbHideByCodeSelector: string = "";

  private template: TemplateRef<any> = inject(TemplateRef);
  private view: ViewContainerRef = inject(ViewContainerRef);

  private store: Store<AppState> = inject(Store);
  private subscription?: Subscription;
  subject = new Subject<void>();


  sections$ = this.store.select(getHideSections).pipe(
    distinctUntilChanged(),
    filter(arr => arr.length > 0),
    takeUntil(this.subject)
  );

  ngOnInit(): void {
    this.subscription = this.sections$.subscribe(sections => {
      const selector = !!sections.find(selector => selector === this.fbHideByCodeSelector);

      this.view.clear();

      if(!selector) {
        this.view.createEmbeddedView(this.template);
      }
    });
  }

  ngOnDestroy() {
    this.subject.next();
    this.subscription?.unsubscribe();
  }

}
