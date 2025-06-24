import { CommonModule } from '@angular/common';
import { Component, effect, EventEmitter, inject, Input, Output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { MatIconModule } from "@angular/material/icon";
import { MemoizedSelector, Store } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { AppState } from "../../app.config";
import * as RouterActions from "../../core/router/store/router.actions";
import { getRouterData, getRouterNavigationId, selectCustomRouteParam } from "../../core/router/store/router.selectors";
import { NavBarButton, NavBarButtonDialog } from "../../models/NavBar";
import { HideByCodeSelectorDirective } from "../../shared/directives/hide-by-code-selector.directive";
import { IfLoggedDirective } from "../../shared/directives/if-logged.directive";
import { ButtonComponent } from "../button/button.component";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ CommonModule, IfLoggedDirective, MatIconModule, ButtonComponent, HideByCodeSelectorDirective ],
  template: `
    <div *fbIfLogged class="flex justify-between items-center w-full h-[3.5rem] min-h-[3.5rem]">
      <div class="flex items-center gap-1">
        <mat-icon *ngIf="backPath" (click)="back()" class="icon-size material-symbols-rounded-filled cursor-pointer">
          arrow_back_ios
        </mat-icon>
        <div class="font-bold text-3xl select-none">{{ title }}</div>
      </div>
      <div class="flex flex-row-reverse gap-2" [ngClass]="{'fixed z-40 right-2 bottom-20' : isMobile}">
        <ng-template ngFor let-item="$implicit" [ngForOf]="buttons" *ngIf="buttons">
          <app-button
            *fbHideByCodeSelector="item.roleSelector || ''"
            [selectors]="item.selectors"
            (onClick)="handleClick(item)"
            [iconName]="item.iconName"
            [label]="item.label"
            [tooltipOpts]="item?.tooltipOpts"
          />
        </ng-template>
      </div>
    </div>
  `,
  styles: []
})
export class NavbarComponent {
  store: Store<AppState> = inject(Store);
  routerData$ = toSignal(this.store.select(getRouterData));
  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  navigationId: number | undefined;
  title: string = "";
  buttons: NavBarButton<any, any>[] = [];
  backPath: string | undefined;

  @Input() isMobile: boolean = false;

  @Output() onButtonClick = new EventEmitter<{
    action: string,
    navigate?: string,
    dialog?: NavBarButtonDialog<any, any>
  }>();

  constructor() {
    this.store.select(getRouterNavigationId).pipe(
      takeUntilDestroyed()
    ).subscribe(value => this.navigationId = value);

    effect(() => {
      if (!this.routerData$()) {
        return;
      }

      this.title = this.getCurrentTitle(this.routerData$()!["title"], this.id());
      this.buttons = this.routerData$()!["buttons"];
      this.backPath = this.routerData$()!["backAction"];

      if (this.routerData$()!["backActionSelector"]) {
        this.store.select(this.routerData$()!["backActionSelector"][0]).subscribe(previousUrl => {
          this.backPath = previousUrl ?? this.routerData$()!["backAction"];
        })
      }

    });
  }

  getCurrentTitle(curr: { default: string, other: string }, id: string) {
    if (!curr?.other) {
      return curr?.default || "";
    }

    if (id === 'new') return curr?.other

    return curr.default;
  }

  back() {
    this.store.dispatch(RouterActions.back({ path: this.backPath !== "-" ? [ this.backPath ] : undefined }));
  }

  handleClick(item: NavBarButton<any, any>) {
    this.onButtonClick.emit({ action: item.action, navigate: item.navigate, dialog: item.dialog });
  }

  showButton(hidden?: MemoizedSelector<any, any>): Observable<boolean> {
    if (!hidden) {
      return of(true);
    }
    return this.store.select(hidden);
  }

  protected readonly isFinite = isFinite;
}
