import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-path-button',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  template: `
    <button class="w-full flex justify-between items-center px-5 py-3 confirm-element shadow-s rounded-[5px]"
          (click)="click.emit()">
      <div>{{ title }}</div>

      <mat-icon class="material-symbols-rounded">
        arrow_forward
      </mat-icon>
  </button>
  `,
  styles: [
  ]
})
export class PathButtonComponent {
  @Input() title!: string;
  @Output() click = new EventEmitter<void>();
}
