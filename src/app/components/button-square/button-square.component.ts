import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemoizedSelector } from "@ngrx/store";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-button-square',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex gap-2 items-center bg-foreground default-shadow-hover p-2 cursor-pointer font-medium rounded-md"
         [ngStyle]="{
         'background-color': bgColor,
         'color': color
         }"
         [ngClass]="{
         'opacity-50 pointer-events-none' : disabled
         }"
         (click)="click()"
    >
      <div class="flex flex-row items-center justify-center w-full">
        <mat-icon class="icon-size material-symbols-rounded-filled cursor-pointer">{{ iconName }}</mat-icon>
        <div *ngIf="label" class="font-bold text-2xl" >{{ label | uppercase }}</div>
      </div>
    </div>
  `,
  styles: [`

  `]
})
export class ButtonSquareComponent {
  @Input({ required: true }) iconName: string = "";
  @Input({ required: false }) selector: MemoizedSelector<any, any> | undefined;
  @Input({ required: false }) label: string = "";
  @Input({ required: false }) bgColor: string = "";
  @Input({ required: false }) color: string = "";
  @Input({ required: false }) disabled: boolean = false;

  @Output() onClick = new EventEmitter<string>();

  click() {
    if(this.disabled) {
      return;
    }
    this.onClick.emit();
  }
}
