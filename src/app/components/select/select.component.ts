import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatOptionModule } from "@angular/material/core";
import { Observable } from "rxjs";

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule, MatAutocompleteModule, MatOptionModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
<!--    NON FUNZIONA, Da capire come mai -->
    <label class="text-md justify-left block px-3 py-0 font-medium">{{ label }}</label>
    <input [type]="type"
           class="focus:outline-none p-3 rounded-md w-full"
           [placeholder]="placeholder"
           aria-label="Number"
           matInput
           [ngClass]="formControl.invalid && formControl.dirty ? ('border-input-error') : ('border-input')"
           [value]="value"
           [(ngModel)]="value"
           [matAutocomplete]="auto"
           [disabled]="disabled"
           (input)="onChange(value)"
           (blur)="onTouched()">

    <mat-autocomplete #auto="matAutocomplete" [displayWith]="currentName" (optionSelected)="selectionChange($event)">
      <mat-option *ngFor="let option of (data | async)" [value]="option">
        {{option?.name}}
      </mat-option>
    </mat-autocomplete>
  `,
  styles: [
  ]
})
export class SelectComponent {
  @Input({ required: true }) data!: Observable<any[]>;
  @Input({ required: true }) formControl!: FormControl;
  @Input({ required: true }) label: string = "";
  @Input({ required: true }) placeholder: string = "";
  @Input({ required: true }) type: string = "text";
  @Input({ required: true }) currentName! : (elem: any) => string;

  @Output() onSelectionChange = new EventEmitter<MatAutocompleteSelectedEvent>();

  value: string = "";
  disabled = false;
  onChange: any = (value: any) => {};
  onTouched: any = () => {};

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  selectionChange(event: MatAutocompleteSelectedEvent) {
    this.onSelectionChange.emit(event);
  }
}
