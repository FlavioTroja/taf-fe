import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { TableButton } from "../../../../models/Table";
import { IfForbiddenDirective } from "../../../../shared/directives/if-forbidden.directive";
import { MatTooltipModule } from "@angular/material/tooltip";
import {HideByCodeSelectorDirective} from "../../../../shared/directives/hide-by-code-selector.directive";

@Component({
  selector: 'app-table-button',
  standalone: true,
  imports: [CommonModule, MatIconModule, IfForbiddenDirective, MatTooltipModule, HideByCodeSelectorDirective],
  template: `
      <button [disabled]="isDisabled" class="flex items-center p-2 rounded-lg shadow-md default-shadow-hover" [ngClass]="{
                  'error': item.bgColor === 'red',
                  'warning': item.bgColor === 'orange',
                  'accent': item.bgColor === 'sky',
                  'green-buttons': item.bgColor === 'green',
                  'red-buttons': item.bgColor === 'red',
                  'opacity-50 pointer-events-none' : isDisabled
                  }"
              (click)="item.callback ? item.callback(row) : null"
              [matTooltip]="item.tooltipOpts?.text || getDefaultTooltipMessage"
              [matTooltipPosition]="item.tooltipOpts?.position || 'below'"
      >
        <mat-icon class="material-symbols-rounded">{{ item.iconName }}</mat-icon>
      </button>
  `,
  styles: [
  ]
})
export class TableButtonComponent<T> {
  @Input({ required: true }) item!: TableButton<T>;
  @Input({ required: true }) row!: T;

  tooltipDefaultMessage = [
    { iconName: "visibility", message: "Visualizza" },
    { iconName: "edit", message: "Modifica" },
    { iconName: "delete", message: "Elimina" }
  ];

  get getDefaultTooltipMessage() {
    return this.tooltipDefaultMessage.find(opt => opt.iconName === this.item.iconName)?.message || "";
  }

  get isDisabled() {
    return this.item.disabled ? this.item.disabled(this.row) : false
  }

}
