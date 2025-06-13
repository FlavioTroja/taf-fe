import {ANIMATION_MODULE_TYPE, Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {NotificationTextComponent} from "./notification-text.component";
import {NgWaitDirective} from "../../shared/directives/ng-wait.directive";
import {animate, style, transition, trigger} from "@angular/animations";
const ANIMATION_DURATION= "300ms";
const ANIMATION_CURVE= "cubic-bezier(0.85, 0, 0.15, 1)";

@Component({
  selector: 'app-notification-content',
  standalone: true,
  imports: [CommonModule, NotificationTextComponent, NgWaitDirective],
  providers: [
    { provide: ANIMATION_MODULE_TYPE, useValue: 'BrowserAnimations' }
  ],
  template: `
    <div class="notification-content flex flex-col gap-1" *fbNgWait="12000" @contentAnimation >
        <span class="font-semibold text-left flex-auto uppercase">{{ title }}</span>
        <app-notification-text [message]="message" ></app-notification-text>
    </div>
  `,
  styles: [`
    .notification-content {
      width: 15em;
      height: auto;
      margin-left: 0.75em;
      opacity: 1;
    }
  `],
  animations: [
    trigger('contentAnimation', [
      transition(':enter', [
        style({ opacity: 0, width: 0, height: 0, marginLeft: 0 }),
        animate(`${ANIMATION_DURATION} 1000ms ${ANIMATION_CURVE}`, style({ opacity: 1, width: '15em', marginLeft: '0.75em' }))
      ]),
      transition(':leave', [
        animate(`${ANIMATION_DURATION} 300ms ${ANIMATION_CURVE}`, style({ opacity: 0, width: 0, height: 0, marginLeft: 0 }))
      ])
    ]),
  ],
})
export class NotificationContentComponent {
  @Input() title: string = "";
  @Input() message: string = "";

}
