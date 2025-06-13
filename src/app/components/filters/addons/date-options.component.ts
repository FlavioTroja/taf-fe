import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CUSTOM_DATE_FORMAT } from '../../date-interval-selector/custom-date-modules/custom-date-adapter.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateInterval, FilterOption } from 'src/app/models/Filters';

export const regexISODate = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/
@Component({
  selector: 'app-date-options',
  standalone: true,
  imports: [ CommonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule, MatNativeDateModule, ReactiveFormsModule, FormsModule ],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMAT }
  ],
  template: `
    <div>
      <div *ngFor="let option of options, index as i" class="gap-1">
        <label for="option_{{option.name}}">
          <input id="option_{{option.name}}" [value]="option.id" type="radio"
                 [name]="tabField"
                 (click)="handleOnSelectOption(option, $event)"
                 class="checkbox-radius"
          >
          {{ option.name }}
        </label>
      </div>
    </div>
    <div class="flex flex-col" *ngIf="dateIntervalPicker">
      <label for="date_interval" class="flex">
        <input id="date_interval" value='customInterval'
               type="checkbox"
               [name]="tabField"
               [(ngModel)]="toggleCustomInterval"
               (click)="customIntervalSelected()">

        <div class="flex flex-row" [formGroup]="customIntervalForm">
          <div class="flex items-center gap-2.5 p-2.5">
            da
            <div class="flex shadow-md w-full rounded-md pl-2 font-bold"
                 [ngClass]="{'opacity-50 pointer-events-none': !toggleCustomInterval}">
              <input matInput [matDatepicker]="datePickerFrom"
                     formControlName="fromDate"
                     placeholder="Data Inizio"
                     class="focus:outline-none w-24"
                     (dateChange)="setFromDate($event)">
              <mat-datepicker-toggle matIconSuffix [for]="datePickerFrom" [disabled]="!toggleCustomInterval"
                                     class="pb-1.5">
                <mat-icon matDatepickerToggleIcon class="material-symbols-rounded">calendar_month</mat-icon>
              </mat-datepicker-toggle>
              <mat-datepicker #datePickerFrom></mat-datepicker>
            </div>
          </div>
          <div class="flex items-center gap-2.5 pr-2.5">
            a
            <div class="flex shadow-md w-full rounded-md pl-2 font-bold"
                 [ngClass]="{'opacity-50 pointer-events-none': !toggleCustomInterval}">
              <input matInput [matDatepicker]="datePickerTo"
                     formControlName="toDate"
                     placeholder="Data Fine"
                     class="focus:outline-none w-24"
                     (dateChange)="setToDate($event)">
              <mat-datepicker-toggle matIconSuffix [for]="datePickerTo" [disabled]="!toggleCustomInterval"
                                     class="pb-1.5">
                <mat-icon matDatepickerToggleIcon class="material-symbols-rounded">calendar_month</mat-icon>
              </mat-datepicker-toggle>
              <mat-datepicker #datePickerTo></mat-datepicker>
            </div>
          </div>
        </div>
      </label>
      <div class="flex justify-end pb-2.5 pr-2.5" *ngIf="toggleCustomInterval">
        <button class="flex flex-row items-center text-white shadow-lg rounded-full py-2 5 px-5 gap-2"
                [ngClass]="{'pointer-events-none opacity-50': !customIntervalForm.valid}"
                style="background-color: #53ABDE;"
                (click)="submitCustomInterval()"
        >
          <mat-icon class="material-symbols-rounded">check</mat-icon>
          <span class="font-semibold">Applica</span>
        </button>
      </div>
    </div>
  `,
  styles: [`

  `],
})
export class DateOptionsComponent implements OnInit {
  @Input({ required: true }) tabField!: string;
  @Input({ required: true }) options!: FilterOption[];
  @Input({ required: true }) dateIntervalPicker: boolean | undefined;
  @Input({ required: false }) radioName: string = "radio_date_options";
  @Input() selectedDates: DateInterval | undefined;

  @Output() onSelectInterval = new EventEmitter<FilterOption>();

  fb = inject(FormBuilder);
  toggleCustomInterval: boolean = false;

  customIntervalForm  = this.fb.group({
    fromDate: ["" , [Validators.required, Validators.pattern(regexISODate)]],
    toDate: ["" , [Validators.required, Validators.pattern(regexISODate)]],
  });

  ngOnInit() {
    if (this.selectedDates) {
      this.toggleCustomInterval = true;

      this.customIntervalForm.patchValue({
        fromDate: this.selectedDates.from,
        toDate: this.selectedDates.to,
      })
    }
  }

  get f() {
    return this.customIntervalForm.controls;
  }

  setFromDate( event: any ) {
    const dirtyFromDate = new Date(event.value).toISOString();
    if(!regexISODate.test(dirtyFromDate)) {
      return;
    }
    this.f.fromDate.setValue(dirtyFromDate);
  }

  setToDate( event: any ) {
    const dirtyToDate = new Date(event.value).toISOString();
    if(!regexISODate.test(dirtyToDate)) {
      return;
    }
    this.f.toDate.setValue(dirtyToDate);
  }

  handleOnSelectOption(option: FilterOption, event: any) {
    this.onSelectInterval.emit({ ...option, checked: true });
  }

  customIntervalSelected() {
    if (this.toggleCustomInterval) {
      this.customIntervalForm.reset();
      this.onSelectInterval.emit({ id: -1, name: "customInterval", checked: false });
    }
    this.toggleCustomInterval = !this.toggleCustomInterval;
  }

  submitCustomInterval() {
    const option: FilterOption = {
      id: -1,
      checked: true,
      name: "customInterval",
      dateInterval: { from: this.f.fromDate.value!, to: this.f.toDate.value! }
    }
    this.onSelectInterval.emit(option);
    this.toggleCustomInterval = false;

    // filter.onSelectOption ? filter.onSelectOption(filter.field, {
    //   id: -1,
    //   name: 'customInterval',
    //   checked: true,
    //   dateInterval: { from: this.f.fromDate.value!, to: this.f.toDate.value! }
    // }) : null
  }
}
