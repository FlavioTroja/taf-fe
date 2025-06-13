import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: 'app-icon-counter',
  standalone: true,
  imports: [ CommonModule, MatIconModule, MatTooltipModule ],
  template: `
    <div class="flex gap-1 items-center text-xs h-3.5">
      <mat-icon class="material-symbols-rounded-filled !text-sm !h-auto !w-auto {{iconClass}}">{{icon}}</mat-icon>
      <div class="text-black {{contentClass}}">{{ content }}</div>
    </div>
  `
})
export class IconCounterComponent {
  @Input({ required: true }) content!: string | number;
  @Input({ required: true }) icon!: string;
  @Input() iconClass?: string;
  @Input() contentClass?: string;
}
