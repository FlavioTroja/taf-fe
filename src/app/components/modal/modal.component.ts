import { Component, Inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { ButtonComponent } from "../button/button.component";
import { ModalButton } from "../../models/Button";

export interface ModalDialogData {
  title: string,
  content: string,
  buttons: ModalButton<any, any>[],
  templateContent?: TemplateRef<any>;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ButtonComponent],
  template: `
    <div class="p-2.5 flex flex-col justify-between min-h-[14em] min-w-[28em]">
      <div class="flex flex-col gap-2">
        <div class="font-bold text-xl capitalize">
            {{ data.title }}
        </div>
        <div [innerHTML]="data.content"></div>
        <div *ngIf="!!data.templateContent">
          <ng-container *ngTemplateOutlet="data.templateContent"></ng-container>
        </div>
      </div>
      <div class="flex flex-row-reverse gap-2">
        <ng-template ngFor let-item="$implicit" [ngForOf]="data.buttons">
          <app-button [selectors]="item.selectors" [label]="item.label" [iconName]="item.iconName" [bgColor]="item.bgColor ?? ''" (onClick)="item.onClick()" />
        </ng-template>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class ModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalDialogData,
  ) {}


}
