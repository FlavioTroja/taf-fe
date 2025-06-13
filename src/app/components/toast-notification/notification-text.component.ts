import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgWaitDirective} from "../../shared/directives/ng-wait.directive";
import {animate, style, transition, trigger} from "@angular/animations";
const ANIMATION_DURATION= "300ms";
const ANIMATION_CURVE= "cubic-bezier(0.85, 0, 0.15, 1)";

@Component({
  selector: 'app-notification-text',
  standalone: true,
  imports: [CommonModule, NgWaitDirective],
  template: `
      <span class="text-left text-sm text-black flex-auto notification-text" *fbNgWait="12000" @textAnimation >{{ message }}</span>
  `,
  styles: [`
    .notification-text {
      width: 13em;
    }
  `],
  animations: [
    trigger('textAnimation', [
      transition(':enter', [
        style({ opacity: 0, width: 0, height: 0 }),
        animate(`${ANIMATION_DURATION} 1300ms ${ANIMATION_CURVE}`, style({ opacity: 1, width: '13em', height: '*' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, width: '13em', height: '*' }),
        animate(`${ANIMATION_DURATION} ${ANIMATION_CURVE}`, style({ opacity: 0, width: '0', height: 0 }))
      ])
    ]),
  ],
})
export class NotificationTextComponent {
  @Input() message: string = "";

}
