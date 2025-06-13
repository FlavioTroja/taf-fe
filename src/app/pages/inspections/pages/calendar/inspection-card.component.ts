import { Component, inject, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { StatusPillComponent } from "../../../../components/pill/status-pill.component";
import { TableButtonComponent } from "../../../../components/table/components/button/button.component";
import { TableButton } from "../../../../models/Table";
import { Inspection, InspectionStatus, PartialInspection } from "../../../../models/Inspection";
import *  as InspectionActions from "../../store/actions/inspections.actions"
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { MatDialog } from "@angular/material/dialog";
import *  as RouterActions from "../../../../core/router/store/router.actions";
import { HyperPillComponent } from "../../../../components/pill/hyper-pill.component";
import { PartialUser, Roles } from "../../../../models/User";
import { getProfileUser } from "../../../../core/profile/store/profile.selectors";
import { map, Observable } from "rxjs";
import { HideByCodeSelectorDirective } from "../../../../shared/directives/hide-by-code-selector.directive";
import { hasRoles } from "../../../../../utils/utils";

@Component({
  selector: 'app-inspection-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatTooltipModule, StatusPillComponent, TableButtonComponent, HyperPillComponent, HideByCodeSelectorDirective],
  template: `
    <div class="flex flex-col p-2.5 gap-2.5 bg-foreground rounded shadow-md w-full">
      <div>
        <div class="font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
          {{ inspection.setup?.title }}
        </div>
        <div class="whitespace-nowrap overflow-hidden text-ellipsis">
          {{ inspection.setup?.description }}
        </div>
        <div class="flex justify-between">
          <div class="flex justify-start gap-1">
            <app-status-pill [status]="inspection.inspectionStatus"/>
            <div
              class="bg-foreground default-shadow rounded-full max-w-max px-2 py-1.5 flex gap-1 items-center break-keep cursor-pointer"
              [matTooltip]="inspection.setup?.customer?.name!"
              (click)="navigateOnCustomer(inspection.setup?.customer?.id!)">
              <div class="pr-1 flex self-center">
                <mat-icon class="material-symbols-rounded">person</mat-icon>
              </div>
              <div class="font-bold whitespace-nowrap text-sm pr-0.5 text-ellipsis overflow-hidden"
                   style="max-width: 10rem">
                {{ truncatePillText(inspection.setup?.customer?.name!) }}
              </div>
            </div>
            <app-hyper-pill iconName="person_apron"
                            [tooltipText]="!inspection.user?.username ? 'Non è stato associato nessun responsabile' : ''"
                            [text]="!inspection.user?.username ? 'Responsabile non asscoiato' : inspection.user?.username!"/>
          </div>
          <div *ngIf="(!isInspectionStatusRejected() && (isUserInspector() | async)) || (isUserPlanner() | async)" class="flex flex-col justify-end">
            <mat-icon class="material-symbols-rounded arrow rounded-full"
                      (click)="isInspectionCardOpen = !isInspectionCardOpen">
              {{ isInspectionCardOpen ? "keyboard_arrow_up" : "keyboard_arrow_down" }}
            </mat-icon>
          </div>
        </div>
      </div>
      <div *ngIf="isInspectionCardOpen" class="flex justify-end gap-2.5 w-full">
        <ng-container *ngIf="!isRejectReasonBoxOpen">
          <div class="accent rounded-lg">
            <app-table-button [item]="view"
                              [row]="inspection"
                              class="accent rounded-lg"/>
          </div>
        </ng-container>
        <ng-container *ngIf="!isRejectReasonBoxOpen && !isInspectionStatusDone()">
          <div class="warning rounded-lg" *fbHideByCodeSelector="'inspections.selective-list.edit-button'">
            <app-table-button [item]="edit"
                              [row]="inspection"
                              class="warning rounded-lg"/>
          </div>
        </ng-container>
        <ng-container *ngIf="!isRejectReasonBoxOpen && isInspectionStatusAccepted() && isCurrentUserInspectionOwner">
          <div class="accent rounded-lg" *fbHideByCodeSelector="'inspections.selective-list.compile-button'">
            <app-table-button [item]="compile"
                              [row]="inspection"
                              class="accent rounded-lg"/>
          </div>
        </ng-container>
        <ng-container *ngIf="!isRejectReasonBoxOpen && !isInspectionStatusDone()">
          <div class="error rounded-lg" *fbHideByCodeSelector="'inspections.selective-list.delete-button'">
            <app-table-button [item]="delete"
                              [row]="inspection"
                              class="error rounded-lg"/>
          </div>
        </ng-container>
        <ng-container *ngIf="!isRejectReasonBoxOpen && isInspectionStatusPending()">
          <div class="green-buttons rounded-lg" *fbHideByCodeSelector="'inspections.selective-list.accept-button'">
            <app-table-button
                              [item]="accept"
                              [row]="inspection"
                              class="green-buttons rounded-lg"/>
          </div>
        </ng-container>
        <ng-container *ngIf="!isRejectReasonBoxOpen && isInspectionStatusPending()">
          <div class="red-buttons rounded-lg" *fbHideByCodeSelector="'inspections.selective-list.refuse-button'">
            <app-table-button
              [item]="refuse"
              [row]="inspection"
              class="red-buttons rounded-lg"/>
          </div>
        </ng-container>
        <div *ngIf="isRejectReasonBoxOpen" class="w-full flex flex-col gap-2.5">
          <label class="pl-2">motivazione</label>
          <textarea class="focus:outline-none p-3 rounded-md w-full shadow-md resize-none"
                    [formControl]="rejectReasonControl"></textarea>
          <div class="flex gap-4 items-center justify-end">
            <span class="underline text-sm self-center cursor-pointer" (click)="openRejectReasonBox()">Annulla</span>
            <button class="flex items-center p-2 gap-2 rounded-lg shadow-md default-shadow-hover red-buttons"
                    (click)="updateInspectionStatusOnRefuse()">
              <mat-icon class="material-symbols-rounded">close</mat-icon>
              <span class="font-bold">Rifiuta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .arrow {
      background-color: #D9D9D9;
    }
  `]
})
export default class InspectionCardComponent implements OnInit {
  @Input({ required: true }) inspection!: Inspection;

  store: Store<AppState> = inject(Store);
  dialog = inject(MatDialog);

  isInspectionCardOpen: boolean = false;
  isRejectReasonBoxOpen: boolean = false;

  rejectReasonControl = new FormControl('');

  user!: PartialUser;

  currentUser$ = this.store.select(getProfileUser);

  view: TableButton<PartialInspection> = {
    callback: elem => this.store.dispatch(RouterActions.go({ path: [`inspections/${elem.id}/view`] })),
    iconName: 'visibility',
    bgColor: 'accent'
  };
  edit: TableButton<PartialInspection> = {
    callback: elem => this.store.dispatch(RouterActions.go({ path: [`inspections/${elem.id}`] })),
    iconName: 'edit',
    bgColor: 'warning'
  };
  delete: TableButton<PartialInspection> = {
    callback: elem => this.openDialog(elem),
    iconName: 'delete',
    bgColor: 'error'
  };
  compile: TableButton<PartialInspection> = {
    callback: elem => this.store.dispatch(RouterActions.go({ path: [`inspections/${elem.id}`] })),
    iconName: 'contract_edit',
    bgColor: 'accent',
    tooltipOpts: {
      text: 'Compila Sopralluogo'
    }
  };
  accept: TableButton<PartialInspection> = {
    callback: () => this.store.dispatch(InspectionActions.updateInspectionStatus({
      id: this.inspection.id,
      inspectionStatusPayload: {
        newStatus: InspectionStatus.ACCEPTED
      }
    })),
    iconName: 'check',
    bgColor: 'green',
    tooltipOpts: {
      text: 'Accetta'
    }
  };
  refuse: TableButton<PartialInspection> = {
    callback: () => this.openRejectReasonBox(),
    iconName: 'close',
    bgColor: 'red',
    tooltipOpts: {
      text: 'Rifiuta'
    }
  };

  ngOnInit() {
    this.currentUser$.subscribe(user => this.user = user!)
  }

  openDialog(inspection: PartialInspection) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData> {
        title: "Conferma rimozione",
        content: `
        Si sta eliminando l'allestimento del ${inspection.date} relativo al cliente '${inspection.setup?.customer?.name}'.
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
      this.deleteInspection(inspection);
    });
  }

  private deleteInspection(row: PartialInspection) {
    this.store.dispatch(InspectionActions.deleteInspection({ id: row.id! }));
  }


  navigateOnCustomer(id: number) {
    this.store.dispatch(InspectionActions.navigateOnInspectionCustomer({ id }));
  }

  truncatePillText(row: string) {
    return row?.length > 25 ? row?.substring(0, 22) + '...' : row;
  }

  openRejectReasonBox() {
    this.isRejectReasonBoxOpen = !this.isRejectReasonBoxOpen;
  }

  updateInspectionStatusOnRefuse() {
    this.store.dispatch(InspectionActions.updateInspectionStatus({
      id: this.inspection.id,
      inspectionStatusPayload: {
        newStatus: InspectionStatus.REJECTED,
        rejectionReason: this.rejectReasonControl.value ?? ""
      }
    }))
  }

  isInspectionStatusAccepted() {
    return this.inspection.inspectionStatus === InspectionStatus.ACCEPTED;
  }

  isInspectionStatusRejected() {
    return this.inspection.inspectionStatus === InspectionStatus.REJECTED;
  }

  isInspectionStatusDone() {
    return this.inspection.inspectionStatus === InspectionStatus.DONE;
  }

  isInspectionStatusPending() {
    return this.inspection.inspectionStatus === InspectionStatus.PENDING;
  }

  isUserInspector(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => hasRoles(user, [{ role: Roles.USER_INSPECTOR}])));
  }

  isUserPlanner(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => hasRoles(user, [{ role: Roles.USER_PLANNER}])));
  }

  get isCurrentUserInspectionOwner() {
    return this.user.roles?.some(r => r.roleName === Roles.GOD) ? true : this.user.id === this.inspection.userId;
  }

}
