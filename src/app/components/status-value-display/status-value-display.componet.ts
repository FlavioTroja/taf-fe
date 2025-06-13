import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Directions, paymentDirectionStylesArray } from 'src/app/models/Payment';


/** Component made for formatting the values
 * if you want the small version (only if you have a label, otherwise it's the same) use "w-min" ||  "width: min-content;"
 * @value required number;
 * @label not strictly required string;
 * @border not strictly required boolean;
 */
@Component({
  selector: 'app-status-value-display',
  standalone: true,
  template: `
  <div class="flex flex-wrap justify-end items-end rounded p-2.5 gap-2.5 min-w-[10rem]" 
      [ngClass]="{'border-solid border-[rgba(var(--soko-error))] border-2': border}"
      [style.border-color]="valueDirection === Directions.IN ? 'rgba(var(--soko-success))' : 'rgba(var(--soko-error))'">
    <div *ngIf="!!label" 
          class="whitespace-nowrap font-bold self-center" 
          [style.color]="valueDirection === Directions.IN ? 'rgba(var(--soko-success))' : 'rgba(var(--soko-error))'">
      {{ label }}
    </div>
    <div class="whitespace-nowrap rounded currency px-4 py-1" 
        [style]="getDirectionStyle(valueDirection)" 
        [ngClass]="{'negative': valueDirection === Directions.OUT}">
      {{ abs(+value) | currency:'':''}}
    </div>
  </div>
  `,
  styles: [`
    .currency {
  font-weight: normal;
}

.currency::before {
  content: "€ ";
  font-weight: bold;
}

.currency.negative::before {
  content: "- € ";
  font-weight: bold;
}  
  `],
  imports: [CommonModule]
})
export class StatusValueDisplayComponent implements OnChanges {
  @Input({ required: true }) value: number = 0;
  /** if you want a label in it, default = false*/
  @Input({ required: false }) label: string = '';
  /** if you want a border in it, default = true*/
  @Input({ required: false }) border: boolean = true;
  
  readonly Directions = Directions;
  valueDirection: Directions = Directions.OUT;
    
  constructor() {}
  
  ngOnChanges(changes: SimpleChanges): void {
    this.valueDirection = +(this.value) >= 0 ? Directions.IN : Directions.OUT;
  }

  /** take a number and returns his absolute
   * 
   * @param value number
   * @returns Math.abs(value)
  */
 abs(value: number):number {
   return Math.abs(value);
  }

  getDirectionStyle(direction: Directions) {
    return paymentDirectionStylesArray.find(s => s.key === direction)?.value;
  }

}
