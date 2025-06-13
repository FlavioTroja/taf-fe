import { Component, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { AppState } from "../../app.config";
import { animate, style, transition, trigger } from "@angular/animations";
import { CurrentNotification, NOTIFICATION_LISTENER_TYPE, NotificationData } from "../../models/Notification";
import { map, Observable } from "rxjs";
import { selectUINotification } from "../../core/ui/store/ui.selectors";
import { NotificationTextComponent } from "./notification-text.component";
import { NotificationContentComponent } from "./notification-content.component";
import { NgWaitDirective } from "../../shared/directives/ng-wait.directive";
const ANIMATION_DURATION= "300ms";
const ANIMATION_CURVE= "cubic-bezier(0.85, 0, 0.15, 1)";

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule, MatIconModule, NotificationTextComponent, NotificationContentComponent, NgWaitDirective],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-5em)' }),
        animate(`${ANIMATION_DURATION} ${ANIMATION_CURVE}`, style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate(`${ANIMATION_DURATION} ${ANIMATION_CURVE}`, style({ opacity: 0, transform: 'translateY(-5em)' }))
      ])
    ])
  ],
  template: `
      <div class="notification-list">
          <ng-container *ngFor="let notification of notifications">
              <div class="p-2 items-start text-indigo-100 leading-none rounded-[1.7em] flex lg:inline-flex default-shadow-hover w-min"
                   [ngClass]="{
                 'error' : notification.type === NOTIFICATION_LISTENER_TYPE.ERROR,
                 'warning' : notification.type === NOTIFICATION_LISTENER_TYPE.WARNING,
                 'accent' : notification.type === NOTIFICATION_LISTENER_TYPE.INFO,
                 'success' : notification.type === NOTIFICATION_LISTENER_TYPE.SUCCESS
               }"
                   role="alert" *fbNgWait="13000"  @fadeAnimation>
              <span class="flex rounded-full uppercase p-2 text-xs font-bold"
                    [ngClass]="{
                 'icon-error' : notification.type === NOTIFICATION_LISTENER_TYPE.ERROR,
                 'icon-warning' : notification.type === NOTIFICATION_LISTENER_TYPE.WARNING,
                 'icon-accent' : notification.type === NOTIFICATION_LISTENER_TYPE.INFO,
                 'icon-success' : notification.type === NOTIFICATION_LISTENER_TYPE.SUCCESS
                }"
              >
                  <mat-icon class="material-symbols-rounded-filled cursor-pointer text-white">{{ notification.icon }}</mat-icon>
              </span>
                  <app-notification-content [title]="notification.title" [message]="notification.message" ></app-notification-content>
              </div>
          </ng-container>
      </div>
  `,
  styles: [`
    .notification-list {
      position: fixed;
      display: flex;
      flex-direction: column-reverse;
      align-items: center;
      gap: 0.5em;
      width: 100vw;
      left: 0;
      z-index: 1000;
      pointer-events: none;
    }
  `]
})
export class ToastNotificationComponent implements OnChanges {

  store: Store<AppState> = inject(Store);
  boxState: string = "hide";

  notifications$: Observable<CurrentNotification[]> = this.store.select(selectUINotification).pipe(
    map((notifications) => {
      return notifications.map(n => {
        const defaultNotification = NotificationData.find(not => not.type === n.type);
        return {
          code: n.code,
          type: n.type as NOTIFICATION_LISTENER_TYPE,
          icon: defaultNotification?.icon || "",
          title: n.title || defaultNotification!.defaultTitle,
          message: n.message
        }
      })
    })
  );
  notifications: CurrentNotification[] = [];

  constructor() {
    this.notifications$.subscribe(arr => {
      if(!arr.length) return;
      this.notifications.push(arr[arr.length-1]);
      this.showBox();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.boxState)
    this.showBox();
  }

  showBox() {
    this.boxState = "show";
  }

  hideBox(code: string) {
    // this.store.dispatch(UIActions.removeSelectedNotification({ code }));
    // this.boxState = "hide";
    console.log("box state", this.boxState)
  }

  protected readonly NOTIFICATION_LISTENER_TYPE = NOTIFICATION_LISTENER_TYPE;
}
