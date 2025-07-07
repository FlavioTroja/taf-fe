import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [ CommonModule ],
  template: `
    <div class="flex flex-wrap gap-1 items-center">

      <ng-container *ngFor="let hour of row | slice:0:4">
          <span class="whitespace-nowrap bg-gray-100 text-sm px-2.5 py-0.5 rounded">
            {{ hour }}
          </span>
      </ng-container>

      <ng-container *ngIf="isExpanded(index)">
        <ng-container *ngFor="let hour of row | slice:4">
            <span class="whitespace-nowrap bg-gray-100 text-sm px-2.5 py-0.5 rounded">
              {{ hour }}
            </span>
        </ng-container>
      </ng-container>

      <ng-container *ngIf="!isExpanded(index) && row.length > 4">
        <button
          class="whitespace-nowrap bg-gray-200 text-sm px-2.5 py-0.5 rounded-full hover:bg-gray-300"
          (click)="toggleRow(index)">
          +{{ row.length - 4 }}
        </button>
      </ng-container>

      <ng-container *ngIf="isExpanded(index)">
        <button
          class="whitespace-nowrap bg-gray-200 text-sm px-2.5 py-0.5 rounded-full hover:bg-gray-300"
          (click)="toggleRow(index)">
          Mostra meno
        </button>
      </ng-container>

    </div>
  `,
  styles: []
})
export class TagListComponent {
  @Input({ required: true }) row: any;
  @Input({ required: true }) index: number = 0;


  expandedRows = new Set<number>();

  toggleRow(index: number) {
    if (this.expandedRows.has(index)) {
      this.expandedRows.delete(index);
    } else {
      this.expandedRows.add(index);
    }
  }

  isExpanded(index: number): boolean {
    return this.expandedRows.has(index);
  }
}
