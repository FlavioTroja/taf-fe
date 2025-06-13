import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef} from '@angular/core';
import { EventCalendarCellComponent } from "./event-calendar-cell/event-calendar-cell.component";
import { NgClass, NgForOf } from "@angular/common";
import { DateTime } from "luxon";
import { MatIconModule } from "@angular/material/icon";
import { Subject } from "rxjs";
import { MatDialogModule } from "@angular/material/dialog";

@Component({
  selector: 'app-event-calendar',
  standalone: true,
  template: `
    <div class="flex flex-col gap-2">
      <!-- header -->
      <div class="w-full flex flex-row justify-between self-center items-center p-2">
        <button class="pt-1.5" (click)="shiftPeriod('month', -1)">
          <mat-icon class="material-symbols-rounded">arrow_back_ios</mat-icon>
        </button>
        <div class="flex gap-2 cursor-default select-none">
          <div class="flex font-bold text-red-500 bg-foreground default-shadow rounded max-w-max px-2">{{ periodMonthLabel }}</div>
          <div class="flex font-bold bg-foreground default-shadow rounded max-w-max px-2">{{ periodYearLabel }}</div>
        </div>
        <button class="pt-1.5" (click)="shiftPeriod('month', 1)">
          <mat-icon class="material-symbols-rounded">arrow_forward_ios</mat-icon>
        </button>
      </div>

      <!-- weekdays -->
      <div class="calendar-grid">
        <div class="flex font-bold justify-center">Lunedì</div>
        <div class="flex font-bold justify-center">Martedì</div>
        <div class="flex font-bold justify-center">Mercoledì</div>
        <div class="flex font-bold justify-center">Giovedì</div>
        <div class="flex font-bold justify-center">Venerdì</div>
        <div class="flex font-bold justify-center">Sabato</div>
        <div class="flex font-bold justify-center text-error">Domenica</div>
      </div>

      <!-- cells -->
      <div class="calendar-grid">
        <div *ngFor="let day of daysInMonth; let i = index">
          <app-event-calendar-cell
            [cellNumber]="day.day"
            [selected]="day.isSelected"
            [holiday]="(i+1) % 7 === 0"
            [daysUntilToday]="day.daysUntilToday"
            [ngClass]="{'hidden pointer-events-none cursor-default': !day.day}"
            (selectedEvent)="cleanSelectedDays(i, day.day, $event)"
            [cellExtraContent]="template"
          />
        </div>
      </div>
    </div>
  `,
  imports: [
    EventCalendarCellComponent,
    NgForOf,
    MatIconModule,
    NgClass,
    MatDialogModule
  ],
  styles: [`
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.250rem;
    }
  `]
})
export class EventCalendarComponent implements OnInit, OnDestroy {
  @Input() template: TemplateRef<any> | null = null;
  @Input() date!: DateTime;
  @Input() selectedDay: number | undefined;
  @Output() onCalendarChange = new EventEmitter<{ selectedDay: number, baseDate: DateTime }>();

  daysInMonth!: { day: number, isSelected: boolean, daysUntilToday: number }[];

  private _destroyed = new Subject<void>();

  constructor() {
    this.date = DateTime.now();
  }

  ngOnInit() {
    this.updateCalendar();
  }

  get periodMonthLabel() {
    return this.capitalizeFirstCharOfAString(this.date.monthLong || '');
  }

  get periodYearLabel() {
    return this.date.year;
  }

  updateCalendar() {
    this.daysInMonth = [
      ...Array(this.date.startOf('month').weekday-1).fill(null).map(() => ({ day: 0, isSelected: false, daysUntilToday: 1 })),  //offset for the empty cells
      ...this.generateDays(this.date.daysInMonth || 0)        //get the days in the month
    ];
  }

  generateDays(num: number) {
    const temp = this.date;
    return Array(num)
      .fill(0)
      .map((_, index) => ({
        day: index + 1,
        isSelected: index +1 === (this.selectedDay ? +this.selectedDay : this.selectedDay),
        daysUntilToday: temp.set({ day: index+1 }).diff(DateTime.now().startOf("day"), "day").days,
      }));
  }

  shiftPeriod(mode: 'month' | 'year', shiftCount: number) {
    if(mode === 'month') this.date = this.date.plus({ month: shiftCount });
    else this.date = this.date.plus({ year: shiftCount });

    this.selectedDay = -1;
    this.updateCalendar();

    this.onCalendarChange.emit({ selectedDay: -1, baseDate: this.date })
  }

  cleanSelectedDays(index: number, selectedDay: number, isSelected: boolean) {
    if (!isSelected) {
      this.onCalendarChange.emit({ selectedDay: -1, baseDate: this.date });
      return;
    }

    this.onCalendarChange.emit({ selectedDay, baseDate: this.date });
    this.daysInMonth = this.daysInMonth.map((item, i) => ({ ...item, isSelected: i === index }));
  }

  capitalizeFirstCharOfAString(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

}

