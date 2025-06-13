import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { MatTableModule } from "@angular/material/table";

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [CommonModule, MatTableModule ,NgxSkeletonLoaderModule],
  template: `
    <div class="w-full bg-foreground default-shadow-hover rounded-md">
      <div class="table-container">
        <table mat-table>

          <ng-container *ngFor="let column of columns" [matColumnDef]="column.columnDef">
            <th mat-header-cell *matHeaderCellDef> {{column.header}} </th>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        </table>
      </div>

      <ul class="pt-4">
          <li class="px-4" *ngFor="let item of generateFake(10)">
            <div class="item">
              <ngx-skeleton-loader [theme]="{ height: '40px', paddingTop: '40px' }"></ngx-skeleton-loader>
            </div>
          </li>
      </ul>
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
export class TableSkeletonComponent implements OnInit {

  @Input() columns!: any[];
  displayedColumns: string[] = [];

  ngOnInit() {
    this.displayedColumns = [...this.columns.map(c => c.columnDef)];
  }

  generateFake(count: number): Array<number> {
    const indexes = [];
    for (let i = 0; i < count; i++) {
      indexes.push(i);
    }
    return indexes;
  }
}
