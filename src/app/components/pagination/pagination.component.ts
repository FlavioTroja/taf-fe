import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectChange } from "@angular/material/select";
import { PaginateDatasource, Table } from "../../models/Table";
import { MatSelectComponent } from "../mat-select/mat-select.component";

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [ CommonModule, MatIconModule, FormsModule, MatSelectComponent ],
  template: `
    <div class="flex flex-row-reverse space-x-5 space-x-reverse items-center p-5 bg-gradient rounded-md">
      <div class="flex flex-row gap-2">
        <button class="flex items-center bg-foreground rounded-full p-2 default-shadow-hover cursor-pointer"
                [ngClass]="{ 'text-gray-400' : paginator.pageIndex == 0 }"
                [disabled]="paginator.pageIndex == 0" (click)="valueToEmit.emit(1)">
          <mat-icon class="icon-size material-symbols-rounded">first_page</mat-icon>
        </button>

        <button class="flex items-center bg-foreground rounded-full p-2 default-shadow-hover cursor-pointer"
                [ngClass]="{ 'text-gray-400' : paginateResults.first }"
                [disabled]="paginateResults.first" (click)="valueToEmit.emit((paginateResults.number || 1) - 1)">
          <mat-icon class="icon-size material-symbols-rounded">chevron_left</mat-icon>
        </button>

        <button class="flex items-center bg-foreground rounded-full p-2 default-shadow-hover cursor-pointer"
                [ngClass]="{ 'text-gray-400' : paginateResults.last }"
                [disabled]="paginateResults.last" (click)="valueToEmit.emit(paginateResults.nextPage)">
          <mat-icon class="icon-size material-symbols-rounded">chevron_right</mat-icon>
        </button>

        <button class="flex items-center bg-foreground rounded-full p-2 default-shadow-hover cursor-pointer"
                [ngClass]="{ 'text-gray-400' : paginateResults.number! + 1 === paginateResults.totalPages || paginateResults.totalPages === 0 }"
                [disabled]="paginateResults.number! + 1 === paginateResults.totalPages || paginateResults.totalPages === 0"
                (click)="valueToEmit.emit(paginateResults.totalPages)">
          <mat-icon class="icon-size material-symbols-rounded">last_page</mat-icon>
        </button>
      </div>
      <div class="flex flex-col">
        {{ ((paginator.pageIndex) * paginator.pageSize) + 1 }}
        - {{ ((paginator.pageIndex + 1) * paginator.pageSize) > (paginateResults.totalElements || 0) ? paginateResults.totalElements : (paginator.pageIndex + 1) * paginator.pageSize }}
        di {{ (paginateResults.totalElements || 0) }}
      </div>
      <div class="flex flex-col">
        <app-mat-select [value]="paginator.pageSize.toString()" [options]="['10', '25', '50']"
                        (onChange)="pageSizeToEmit.emit($event)"/>
      </div>
    </div>
  `,
  styles: [ `
    .bg-gradient {
      background: rgb(255, 255, 255);
      background: linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
    }
  ` ]
})
export class PaginationComponent<T> {
  @Input() paginator!: Table;
  @Input() paginateResults!: Partial<PaginateDatasource<T>>;

  @Output() valueToEmit = new EventEmitter<number>();
  @Output() pageSizeToEmit = new EventEmitter<MatSelectChange>();

}
