import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from "@angular/material/input";
import { MatSelectChange, MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-mat-select',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, MatInputModule, MatSelectModule, MatFormFieldModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <mat-form-field class="flex !flex-row-reverse" appearance="fill">
        <mat-select class="self-end" [(value)]="value" (selectionChange)="onChange.emit($event)">
            <mat-option class="!bg-white hover:!bg-gray-200" *ngFor="let option of options" [value]="option">{{option}}</mat-option>
        </mat-select>
    </mat-form-field>
  `,
  styles: [`
    .mdc-line-ripple--deactivating {
      display: none !important;
    }
    .mat-mdc-select-panel {
      padding: 0.5em !important;
      border-radius: 5px !important;
    }
    .mat-mdc-option {
      border-radius: 5px !important;
    }
  `]
})
export class MatSelectComponent {
  @Input({ required: true }) value!: string;
  @Input({ required: false }) options: string[] = [];

  @Output() onChange = new EventEmitter<MatSelectChange>();
}
