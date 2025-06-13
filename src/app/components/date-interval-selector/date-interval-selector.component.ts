import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { DateRange, DefaultMatCalendarRangeStrategy, MAT_DATE_RANGE_SELECTION_STRATEGY, MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from "@angular/material/icon";
import { CustomDateAdapter } from './custom-date-modules/custom-date-adapter.component';
import { CustomHeader } from './custom-date-modules/custom-calendar-header.component';


@Component({
  selector: 'app-date-interval-selector',
  imports: [MatNativeDateModule, MatDatepickerModule, MatIconModule, CommonModule],
  standalone: true,
  providers: [
    {
      provide: DateAdapter,
      useClass: CustomDateAdapter
    },
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: DefaultMatCalendarRangeStrategy,
    }
  ],
  template: `
  <div class="flex flex-col gap-1">
    <div class="flex flex-row">
      <div class="flex flex-col">
        <div>Da {{ startDate | date: 'dd/MM/yyyy' }}</div>
        <mat-calendar id="firstCalendar" class="bg-calendar h-full rounded"
          [headerComponent]="customHeader"
          [comparisonStart]="startDate"
          [comparisonEnd]="endDate"
          [selected]="startDate"
          (selectedChange)="onSelectStart($event)"/>
      </div>
      <div class="items-center text-center self-center">
        <mat-icon class="material-symbols-rounded">arrow_forward</mat-icon>
      </div>
      <div class="flex flex-col">
        <div>A {{ endDate | date: 'dd/MM/yyyy' }}</div>
        <mat-calendar id="secondCalendar" class="bg-calendar h-full rounded"
          [headerComponent]="customHeader"
          [comparisonStart]="startDate"
          [comparisonEnd]="endDate"
          [selected]="endDate"
          (selectedChange)="onSelectEnd($event)"/>
          <div class="bg-calendar"></div>
      </div>
    </div>
    <div class="flex flex-row justify-end pt-1">
      <button class="flex items-center text-white shadow-lg rounded-full py-2.5 px-5 gap-2" style="background-color: #53ABDE;">
        <mat-icon class="material-symbols-rounded">check</mat-icon>
        <span class="font-semibold">Applica</span>
      </button>
    </div>
  </div>
  `,
  styles: [`
    .bg-calendar {
      background-color: #E1E1E1;
    }

    ::ng-deep .mat-calendar-body-label {
      opacity:0 !important;
    }

    ::ng-deep .mat-calendar-body-label[colspan="7"] {
      display: none;
    }

    ::ng-deep .mat-calendar-body-selected { background-color: #53ABDE !important; color: black !important; }
    // sundays column
    ::ng-deep .mat-calendar-table-header > tr > th:nth-child(7) { color:red !important; }
    ::ng-deep .mat-calendar-body > tr:nth-child(-n+2) > td:nth-last-child(1) > button > span:nth-child(1) { color:red; background: #F8E9E8; }
    ::ng-deep .mat-calendar-body > tr > td:nth-child(7) > button > span:nth-child(1) { color:red; background: #F8E9E8; }
  `]
})
export class DateIntervalSelectorComponent{
  @Output() onApplyRange = new EventEmitter();

  customHeader = CustomHeader;
  startDate :Date | undefined;
  endDate   :Date | undefined;
  selectedDateRange: DateRange<Date> = {} as DateRange<Date>;

  onSelectStart(date: Date){
    this.startDate = date;
    this._onSelectedChange();
  }

  onSelectEnd(date: Date){
    this.endDate = date;
    this._onSelectedChange();
  }

  private _onSelectedChange(): void {
    this.selectedDateRange = new DateRange(
      this.startDate as Date,
      this.endDate as Date
    );
  }

  applyRangeDate(): void {
    this.onApplyRange.emit();
  }
}
