import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { MatSelectChange } from "@angular/material/select";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { PaginateDatasource, Sort, TableButton, TableColumn } from "../../models/Table";
import { PaginationComponent } from "../pagination/pagination.component";
import { TableButtonComponent } from "./components/button/button.component";

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [ CommonModule, MatIconModule, MatSortModule, MatTableModule, PaginationComponent, TableButtonComponent ],
  template: `
    <div class="min-w-full w-min bg-foreground default-shadow rounded-md">
      <div class="table-container">
        <table mat-table [dataSource]="matDataSource" matSort #sort="matSort" (matSortChange)="sortChange($event)">

          <ng-container *ngFor="let column of columns" [matColumnDef]="column.columnDef">
            <th mat-header-cell *matHeaderCellDef mat-sort-header [disabled]="!column.sortable"> {{ column.header }}
            </th>

            <ng-container *ngIf="column.cell">
              <td mat-cell *matCellDef="let row" [ngStyle]="{
                'width': column.width
                }">{{ column.cell(row) }}
              </td>
            </ng-container>

            <ng-container *ngIf="column.template">
              <td mat-cell *matCellDef="let row" [ngStyle]="{
                'width': column.width
                }">
                <ng-template *ngTemplateOutlet="column.template!; context: {$implicit: row}"></ng-template>
              </td>
            </ng-container>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let row">

              <div class="flex flex-row-reverse gap-2 space-x-1 space-x-reverse">
                <ng-template ngFor let-item="$implicit" [ngForOf]="buttons">
                  <app-table-button [item]="item" [row]="row"/>
                </ng-template>

              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true" class="bg-header"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell text-center italic" colspan="4">Nessun risultato trovato!</td>
          </tr>
        </table>
        <app-pagination [paginator]="paginator()"
                        [paginateResults]="dataSource!"
                        (pageSizeToEmit)="getNewSelectedPageSize($event)"
                        (valueToEmit)="getNewSelectedPage($event)"
                        class="sticky bottom-[-4px] z-10"
        />
      </div>

    </div>
  `,
  styles: [ `
    .mat-mdc-header-row {
      font-weight: bold !important;
      background: rgb(255, 255, 255);
      background: linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 40%, rgba(255, 255, 255, 0.8) 60%, rgba(255, 255, 255, 0) 100%);
    }

    .mat-mdc-row, .mat-mdc-header-row, .mat-row {
      font-family: 'Poppins', sans-serif !important;
      font-size: 1rem !important;
    }
  ` ]
})
export class TableComponent<T> implements OnChanges {
  @Input({ required: true }) dataSource!: Partial<PaginateDatasource<T>>;
  @Input({ required: true }) columns: TableColumn<T>[] = [];
  @Input({ required: true }) displayedColumns: string[] = [];
  @Input({ required: true }) buttons!: TableButton<T>[];
  @Input({ required: true }) paginator!: any;
  @Input() sortDisabledColumns: string[] = [];

  @Output() onPageChange = new EventEmitter<number>();
  @Output() onSortChange = new EventEmitter<Sort>();
  @Output() onPageSizeChange = new EventEmitter<number>();

  @ViewChild(MatSort) sort!: MatSort;

  matDataSource!: MatTableDataSource<T>;

  constructor() {
    this.matDataSource = new MatTableDataSource([] as T[]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.matDataSource = new MatTableDataSource(this.dataSource.content);
  }

  getNewSelectedPage(page: number) {
    this.onPageChange.emit(page);
  }

  sortChange(event: Sort | any) {
    this.onSortChange.emit(event);
  }

  getNewSelectedPageSize(page: MatSelectChange) {
    this.onPageSizeChange.emit(+page.value);
  }
}
