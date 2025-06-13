import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableButton, TableColumn } from "../../models/Table";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { PaginationComponent } from "../pagination/pagination.component";
import { TableButtonComponent } from "../table/components/button/button.component";

@Component({
  selector: 'app-table-without-pagination',
  standalone: true,
  imports: [ CommonModule, MatSortModule, MatTableModule, PaginationComponent, TableButtonComponent ],
  template: `
    <div class="w-full bg-foreground default-shadow rounded-md">
      <div class="table-container">
        <table mat-table [dataSource]="matDataSource" matSort #sort="matSort">

          <ng-container *ngFor="let column of columns" [matColumnDef]="column.columnDef">
            <th mat-header-cell *matHeaderCellDef mat-sort-header [disabled]="!column.sortable" > {{column.header}} </th>

            <ng-container *ngIf="column.cell" >
              <td mat-cell *matCellDef="let row" [ngStyle]="{
                'width': column.width
                }" >{{ column.cell(row) }}</td>
            </ng-container>

            <ng-container *ngIf="column.template">
              <td mat-cell *matCellDef="let row" [ngStyle]="{
                'width': column.width
                }" >
                <ng-template *ngTemplateOutlet="column.template!; context: {$implicit: row}"></ng-template>
              </td>
            </ng-container>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let row">

              <div class="flex flex-row-reverse gap-2 space-x-1 space-x-reverse">
                <ng-template ngFor let-item="$implicit" [ngForOf]="buttons">
                  <app-table-button [item]="item" [row]="row" />
                </ng-template>

              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell text-center italic" colspan="4">Nessun risultato trovato!</td>
          </tr>
        </table>
      </div>

    </div>
  `,
  styles: [`
    .mat-mdc-header-row {
      font-weight: bold !important;
    }

    .mat-mdc-row, .mat-mdc-header-row, .mat-row {
      font-family: 'Poppins', sans-serif !important;
      font-size: 1rem !important;
    }
  `]
})
export class TableWithoutPaginationComponent<T> implements OnChanges {
  @Input({ required: true }) dataSource: Partial<T[]> = [];
  @Input({ required: true }) columns: TableColumn<T>[] = [];
  @Input({ required: true }) displayedColumns: string[] = [];
  @Input({ required: true }) buttons!: TableButton<T>[];

  matDataSource!: MatTableDataSource<T>;

  constructor() {
    this.matDataSource = new MatTableDataSource([] as T[]);
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.matDataSource = new MatTableDataSource(this.dataSource as T[]);
  }


}
