import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-message-container',
  standalone: true,
  imports: [ CommonModule, MatIconModule ],
  template: `
    <div class="rounded-[1.7em] fit-content p-1 default-shadow"
        [ngClass]="[type === 'warning' ? 'light-orange' : '', type === 'success' ? 'success' : '', type === 'info' ? 'accent' : '']" >
      <div class="p-2 items-start text-indigo-100 rounded-[1.7em] flex">
                    <span class="flex rounded-full p-3 text-xs"
                          [ngClass]="[type === 'warning' ? 'orange' : '', type === 'success' ? 'icon-success' : '', type === 'info' ? 'priority-accent' : '']">
                        <mat-icon class="material-symbols-rounded-filled"
                          [ngClass]="[type === 'warning' ? 'font-light-orange' : '', type === 'success' || type === 'info' ? 'scale-150' : '']">
                          {{icon}}
                        </mat-icon>
                    </span>
        <div class="flex flex-col gap-1 w-80">
          <span class="text-left flex-auto pl-2 font-semibold"
                [ngClass]="[type === 'warning' ? 'font-orange' : '', type === 'success' ? 'success' : '', type === 'info' ? 'accent' : '']">
            {{title}}
          </span>
          <span class="text-left text-sm text-black flex-auto font-normal pl-2">{{message}}
            <div *ngIf="add" class="flex">
              premi il tasto "<span class="h-5 w-5 rounded-full bg-foreground pl-1 pt-1">
                                <mat-icon class="icon-size material-symbols-rounded"
                                          style="font-size: 0.75rem">add</mat-icon>
                              </span>" a destra
            </div>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class MessageContainerComponent {
  @Input({ required: true }) type: string = '';
  @Input({ required: true }) icon: string = '';
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) message: string = '';
  @Input({ required: false }) add: boolean = false;
}
