import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from "@angular/material/dialog";
import { ButtonComponent } from "../button/button.component";
import { ModalButton } from "../../models/Button";
import { isUndefined } from "lodash-es";

export interface Dialog {
  id: string;
  title: string,
  previousDialog?: string;
  buttons?: ModalButton<any, any>[],
  templateContent: TemplateRef<any>;
}

@Component({
  selector: 'app-staged-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ButtonComponent],
  template: `
    <div class="flex flex-col justify-between gap-2" *ngIf="!!currentDialog">
      <div class="flex flex-col gap-2">
        <div class="font-bold text-xl capitalize">
            {{ currentDialog.title }}
        </div>

        <ng-container *ngTemplateOutlet="currentDialog.templateContent"></ng-container>
      </div>

      <div class="flex justify-between">
        <ng-container *ngIf="!!currentDialog.previousDialog">
          <app-button label="Indietro" iconName="arrow_back" (onClick)="goToDialogById(currentDialog.previousDialog)" />
        </ng-container>

        <div class="flex flex-row-reverse gap-2">
          <ng-template ngFor let-item="$implicit" [ngForOf]="currentDialog.buttons">
            <app-button
              [selectors]="item.selectors"
              [label]="item.label"
              [iconName]="item.iconName"
              [bgColor]="item.bgColor ?? ''"
              [extraContent]="item.extraContent"
              (onClick)="item.onClick()"
            />
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class StagedModalComponent {
  @Input() dialogPath: Dialog[] = [];
  currentDialogIndex: number = 0;

  get currentDialog() {
    return this.dialogPath.at(this.currentDialogIndex);
  }

  goToDialogById(id: string) {
    const newDialogIndex = this.dialogPath?.findIndex((d) => d.id === id);

    this.currentDialogIndex = isUndefined(newDialogIndex) || newDialogIndex === -1 ? 0 : newDialogIndex;
  }
}
