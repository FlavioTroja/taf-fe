import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-general-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white justify-around p-1 border border-gray-200 {{roundedProperty}} {{colorProperty}} wave max-w-full text-center main-shadow h-full container">
            <svg *ngIf="waveCard" class="svg-container {{waveAnimation}}" viewBox="0 0 500 200" fill="white">
                <path *ngIf="waveAnimation === 'wave-animation-100'" d="M 0 20 C 200 110 200 110 473 20 L 500 0 L 0 0"></path>
                <path *ngIf="waveAnimation === 'wave-animation-75'" d="M 0 50 C 200 110 200 110 499 60 L 500 0 L 0 0"></path>
                <path *ngIf="waveAnimation === 'wave-animation-50'" d="M 0 100 C 189 134 307 121 515 80 L 500 0 L 0 0"></path>
                <path *ngIf="waveAnimation === 'wave-animation-25'" d="M -1 163 C 146 184 289 148 499 167 L 500 0 L 0 0"></path>
            </svg>
            <div class="content-container flex justify-start grow font-bold h-full">
                <ng-content/>
            </div>
    </div>
  `,
  styles: []
})
export class GeneralCardComponent {
@Input() roundedProperty: string = "";
@Input() colorProperty: string = "";
@Input() waveCard: boolean | undefined;
@Input() waveAnimation: string = "";


}
