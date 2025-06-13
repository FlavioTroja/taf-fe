import { AfterViewInit, Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HyperPillComponent } from "../../../../../components/pill/hyper-pill.component";
import { MatIconModule } from "@angular/material/icon";
import { ReactiveFormsModule } from "@angular/forms";
import { StatusPillComponent } from "../../../../../components/pill/status-pill.component";
import { TableButtonComponent } from "../../../../../components/table/components/button/button.component";
import { getComplexityFromRank, PartialSetup, Setup, SetupStatus } from "../../../../../models/Setup";
import * as DraftsActions from "../../../store/actions/drafts.actions";
import { TableButton } from "../../../../../models/Table";
import * as RouterActions from "../../../../../core/router/store/router.actions";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../app.config";
import { ModalComponent, ModalDialogData } from "../../../../../components/modal/modal.component";
import { MatDialog } from "@angular/material/dialog";
import { HideByCodeSelectorDirective } from "../../../../../shared/directives/hide-by-code-selector.directive";


@Component({
  selector: 'app-draft-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, StatusPillComponent, TableButtonComponent, HideByCodeSelectorDirective],
  template: `
    <div class="flex flex-col p-2.5 gap-2.5 bg-foreground rounded shadow-md w-full">
      <div class="flex flex-col gap-2">
        <div class="text-lg whitespace-nowrap overflow-hidden text-ellipsis">
          {{ setup.title }}
        </div>
        <div class="flex justify-between">
          <div class="flex justify-start gap-1">
            <app-status-pill [status]="setup.setupStatus.toString()!"/>
            <app-status-pill [status]="setup.isInspectionNeeded ? 'SETUP' : 'SERVICE'"/>
            <app-status-pill *ngIf="setup.setupStatus !== SetupStatus.DONE" [status]="getComplexityFromRank(setup.complexity)!"/>
            <div
              class="bg-foreground default-shadow rounded-full max-w-max px-2 py-1.5 flex gap-1 items-center break-keep cursor-pointer">
              <div class="pr-1 flex self-center">
                <mat-icon class="material-symbols-rounded">person</mat-icon>
              </div>
              <div class="font-bold whitespace-nowrap text-sm pr-0.5 text-ellipsis overflow-hidden max-w-[10rem]">
                {{ truncatePillText(setup.customer?.name!) }}
              </div>
            </div>
            <div *ngIf="setup?.quoteCode"
                 class="flex-initial whitespace-nowrap self-center rounded-full bg-gray-100 px-2 py-1 flex justify-between gap-2">
              <div class="flex self-center">
                <mat-icon class="material-symbols-rounded">contract_edit</mat-icon>
              </div>
              <div class="self-center">
                {{ setup.quoteCode }}
              </div>
            </div>
            <div *ngIf="setup?.dueDate"
                 class="flex-initial whitespace-nowrap self-center rounded-full bg-gray-100 px-2 py-1 flex justify-between gap-2">
              <div class="flex self-center">
                <mat-icon class="material-symbols-rounded">calendar_month</mat-icon>
              </div>
              <div class="self-center">
                {{ (setup.setupStatus === SetupStatus.DONE ? setup.updatedAt : setup.dueDate) | date: 'dd/MM/yyyy' }}
              </div>
            </div>
          </div>
          <div class="flex flex-col justify-end">
            <mat-icon class="material-symbols-rounded arrow rounded-full"
                      (click)="toggleIsDraftCardOpen()">
              {{ isDraftCardOpen ? "keyboard_arrow_up" : "keyboard_arrow_down" }}
            </mat-icon>
          </div>
        </div>
      </div>
      <div *ngIf="isDraftCardOpen" class="flex justify-end gap-2.5 w-full">
        <app-table-button
          *ngFor="let button of buttons"
          [item]="button"
          [row]="setup"
        />

        <ng-container *fbHideByCodeSelector="'drafts.selective-list.delete-button'">
          <app-table-button
            *ngIf="!!deleteButton"
            [item]="deleteButton"
            [row]="setup"
          />
        </ng-container>

      </div>
    </div>
  `,
  styles: [``]
})
export class DraftCardComponent implements AfterViewInit {
  @Input({ required: true }) setup!: Setup;

  store: Store<AppState> = inject(Store);
  dialog = inject(MatDialog);

  isDraftCardOpen: boolean = false;

  buttons: TableButton<Setup>[];

  deleteButton?: TableButton<Setup>;

  constructor() {
    this.buttons = [
      {
        callback: elem => this.store.dispatch(RouterActions.go({ path: [`drafts/${elem.id}/view`] })),
        iconName: 'visibility',
        bgColor: 'sky'
      }
    ];
  }

  ngAfterViewInit(): void {
    if(this.setup.setupStatus !== SetupStatus.DONE) {
      this.buttons.push({
        callback: elem => this.store.dispatch(RouterActions.go({ path: [`drafts/${elem.id}`] })),
        disabled: elem => elem.setupStatus !== SetupStatus.DRAFT,
        iconName: 'edit',
        bgColor: 'orange'
      });

      this.deleteButton = {
        callback: elem => this.openDialog(elem),
        disabled: elem => elem.setupStatus !== SetupStatus.CANCELED,
        iconName: 'delete',
        bgColor: 'red'
      }
    }
  }

  openDialog(setUp: PartialSetup) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData> {
        title: "Conferma rimozione",
        content: `
        Si sta eliminando l'allestimento del cliente '${setUp.customer?.name}'.
        <br>
        Questa operazione non è reversibile.
        `,
        buttons: [
          { iconName: "delete", label: "Elimina", bgColor: "remove", onClick: () => dialogRef.close(true) },
          { iconName: "clear", label: "Annulla",  onClick: () => dialogRef.close(false) }
        ]
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if(!result) {
        return;
      }
      this.deleteDraft(setUp);
    });
  }

  deleteDraft(row: PartialSetup) {
    this.store.dispatch(DraftsActions.deleteSetup({ id: row.id! }));
  }

  toggleIsDraftCardOpen() {
    this.isDraftCardOpen = !this.isDraftCardOpen;
  }

  truncatePillText(row: string) {
    return row?.length > 25 ? row?.substring(0, 22) + '...' : row;
  }

  protected readonly getComplexityFromRank = getComplexityFromRank;
  protected readonly SetupStatus = SetupStatus;
}
