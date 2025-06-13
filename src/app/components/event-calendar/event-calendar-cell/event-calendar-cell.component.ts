import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { NgClass, NgTemplateOutlet } from "@angular/common";


@Component({
  selector: 'app-event-calendar-cell',
  standalone: true,
  template: `
    <div
      class="flex flex-col bg-foreground justify-between rounded shadow p-1 w-full text-sm cursor-pointer select-none transition duration-300 h-[70px] relative"
      [ngClass]="{
        'border-selected': selected,
        'holiday': holiday,
        'past-date': daysUntilToday < 0,
      }"
      (click)="handleOnClick()"
    >
      <ng-container *ngTemplateOutlet="cellExtraContent; context: {$implicit: cellNumber}"></ng-container>

      <div class="flex h-full w-full justify-end items-end font-bold text-sm absolute bottom-1 right-1" style="line-height: 0.875rem">
        <div [ngClass]="{
          'opacity-50': daysUntilToday < 0,
          'flex justify-center rounded-full icon-error items-center text-center p-0.5 aspect-square min-w-[18px] text-white': !daysUntilToday,
        }">{{ cellNumber }}</div>
      </div>
    </div>
  `,
  imports: [
    MatIconModule,
    NgClass,
    NgTemplateOutlet,

  ],
  styles: [`
    .past-date {
      background: #D7D7D7 !important;
      color: black !important;
    }

    .holiday {
      background: rgb(248, 233, 232);
      color: rgb(229, 79, 71);
    }

    mat-icon {
      font-size: 1.375rem;
      height: 1.250rem;
      width: 1.250rem;
    }

    .border-selected {
      border-color: #323A46 !important;
      border-style: solid !important;
      border-width: 1px !important;
    }
  `]
})
export class EventCalendarCellComponent {
  @Input({ required: true }) cellNumber!: number;
  @Input({ required: false }) selected: boolean = false;
  @Input({ required: false }) holiday: boolean = false;
  @Input({ required: false }) daysUntilToday: number = 0;
  @Input() cellExtraContent: TemplateRef<any> | null = null;
  @Output() selectedEvent: EventEmitter<boolean> = new EventEmitter();

  handleOnClick() {
    this.selected = !this.selected;
    this.selectedEvent.emit(this.selected);
  }
}
