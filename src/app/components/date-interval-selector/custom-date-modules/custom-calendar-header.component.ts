import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  Output
} from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { MatCalendar } from '@angular/material/datepicker';
import { MatIconModule } from "@angular/material/icon";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'custom-header',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="flex flex-row justify-between self-center items-center p-2">
      <button class="pt-1.5" (click)="previousClicked('month')">
        <mat-icon class="material-symbols-rounded">arrow_back_ios</mat-icon>
      </button>
      <div class="flex gap-2">
        <div class="flex font-bold text-red-500 bg-foreground default-shadow rounded max-w-max px-2">{{ periodMonthLabel }}</div> 
        <div class="flex font-bold bg-foreground default-shadow rounded max-w-max px-2">{{ periodYearLabel }}</div>
      </div>
      <button class="pt-1.5" (click)="nextClicked('month')">
        <mat-icon class="material-symbols-rounded">arrow_forward_ios</mat-icon>
      </button>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
  
})
export class CustomHeader<D> implements OnDestroy {
  private _destroyed = new Subject<void>();

  @Output() monthChangeEvent = new EventEmitter<string>();

  constructor(
    private _calendar: MatCalendar<D>, 
    private _dateAdapter: DateAdapter<D>,
    @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats, 
    cdr: ChangeDetectorRef
  ) {
    _calendar.stateChanges
    .pipe(takeUntil(this._destroyed))
    .subscribe(() => cdr.markForCheck());
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  get periodMonthLabel() {
    return this._dateAdapter
        .format(this._calendar.activeDate, this._dateFormats.display.monthYearA11yLabel)
        .split(' ')[0]
        .toLocaleUpperCase();
  }

  get periodYearLabel() {
    return this._dateAdapter
        .format(this._calendar.activeDate, this._dateFormats.display.monthYearA11yLabel)
        .split(' ')[1];
  }

  previousClicked(mode: 'month' | 'year') {
    this._calendar.activeDate = mode === 'month' ?
        this._dateAdapter.addCalendarMonths(this._calendar.activeDate, -1) :
        this._dateAdapter.addCalendarYears(this._calendar.activeDate, -1);
        
    this.monthChangeEvent.emit();
  }

  nextClicked(mode: 'month' | 'year') {
    this._calendar.activeDate = mode === 'month' ?
        this._dateAdapter.addCalendarMonths(this._calendar.activeDate, 1) :
        this._dateAdapter.addCalendarYears(this._calendar.activeDate, 1);

    this.monthChangeEvent.emit();
  }
}