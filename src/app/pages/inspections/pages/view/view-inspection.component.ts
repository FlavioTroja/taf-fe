import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { HyperPillComponent } from "../../../../components/pill/hyper-pill.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { toSignal } from "@angular/core/rxjs-interop";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import * as InspectionActions from "../../../inspections/store/actions/inspections.actions";
import { getCurrentInspection } from "../../store/selectors/inspections.selectors";
import { StatusPillComponent } from "../../../../components/pill/status-pill.component";
import { AttachmentsComponent } from "../../../../components/attachments/attachments.component";
import { getAttachmentsObjectList } from "../../../../../utils/utils";
import { StatusBannerComponent } from "../../../drafts/pages/view/components/status-banner.component";
import { getProfileUser } from "../../../../core/profile/store/profile.selectors";
import { PartialUser, Roles } from "../../../../models/User";
import { InspectionStatus } from "../../../../models/Inspection";

@Component({
  selector: 'app-inspection-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, HyperPillComponent, StatusPillComponent, AttachmentsComponent, StatusBannerComponent],
  template: `
    <div class="flex flex-col gap-11" *ngIf="active() as inspection">
      <div *ngIf="inspection.rejectionReason">
        <div class="black font-bold text-2xl uppercase">Notifiche e aggiornamenti</div>
        <div class="flex flex-row w-full p-2.5 gap-3.5 border rounded bg-light-gray"
             [ngClass]="inspection.rejectionReason ? 'border-error' : 'border-success'">
          <div class="flex items-center">
            <div class="rounded-full flex p-2.5 gap-1 "
                 [ngClass]="inspection.rejectionReason ? 'icon-error' : 'icon-success'">
              <mat-icon class="material-symbols-rounded-filled"
                        [ngClass]="inspection.rejectionReason ? 'icon-text-error' : 'icon-text-success'">feedback
              </mat-icon>
            </div>
          </div>
          <div class="flex flex-col justify-center">
            <div class="font-bold text-lg uppercase"
                 [ngClass]="inspection.rejectionReason ? 'text-error' : 'text-success'">
              {{ inspection.rejectionReason ? 'data rifiutata' : 'data accettata' }}
            </div>
            <div *ngIf="inspection.rejectionReason" class="flex flex-row gap-1">
              <div class="font-bold">
                {{ inspection.user?.username }}:
              </div>
              <div>
                {{ inspection.rejectionReason }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="inspection.inspectionStatus === InspectionStatus.ACCEPTED && getIsUserInspectionOwner(inspection.userId!)">
        <app-status-banner
          [isForNotOwnerUser]="true"
        />
      </div>
      <div class="flex flex-col rounded bg-white shadow p-2.5 gap-2.5">
        <div class="flex flex-row justify-between w-full">
          <div class="flex flex-col gap-2.5">
            <div class="flex flex-row">
              <app-hyper-pill iconName="person_apron"
                              [tooltipText]="!inspection?.user?.username ? 'Non è stato associato nessun responsabile' : ''"
                              [text]="inspection?.user?.username ?? 'Responsabile non asscoiato'"></app-hyper-pill>
            </div>
            <div class="flex flex-col font-bold">
              <div class="flex flex-row text-4xl">{{ inspection.setup?.title }}</div>
              <div class="flex flex-row text-2xl">{{ inspection.setup?.customer?.name }}</div>
            </div>
            <app-status-pill [status]="inspection.inspectionStatus"/>
            <div>
              <span class="font-bold">Indirizzo:</span>
              {{ inspection.setup?.address?.address }},
              <span *ngIf="inspection.setup?.address?.number">{{ inspection.setup?.address?.number }},</span>
              {{ inspection.setup?.address?.city }}
            </div>
            <div>
              <span class="font-bold">Descrizione:</span> {{ inspection.setup?.description }}
            </div>
          </div>
          <div class="flex flex-col gap-2.5">
            <div *ngIf="inspection.date"
                 class="flex-initial whitespace-nowrap self-center rounded-full bg-gray-100 px-2 py-1 flex justify-between gap-2">
              <div class="flex self-center">
                <mat-icon class="material-symbols-rounded">calendar_month</mat-icon>
              </div>
              <div class="self-center">
                {{ inspection.date  | date: 'dd/MM/yyyy' }}
              </div>
            </div>
            <div *ngIf="inspection.setup?.dueDate"
                 class="flex-initial whitespace-nowrap self-center rounded-full bg-gray-100 px-2 py-1 flex justify-between gap-2">
              <div class="flex self-center">
                <mat-icon class="material-symbols-rounded">calendar_clock</mat-icon>
              </div>
              <div class="self-center">
                {{ inspection.setup?.dueDate  | date: 'dd/MM/yyyy' }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col w-full" *ngIf="!!getSetupAttachments.length">
          <div class="text-xl font-extrabold uppercase py-1">Allegati allestimento</div>
          <div class="overflow-x-auto default-shadow">
            <app-attachments
              [viewOnly]="true"
              [onlyImages]="false"
              title="allegati"
              label="aggiungi allegato"
              [attachmentList]="getAttachmentsObjectList(getSetupAttachments)"
              [currentAttachment]="getSetupAttachments">
            </app-attachments>
          </div>
        </div>
        <div class="flex flex-col gap-2.5" *ngIf="inspection.description">
          <div class="font-bold">
            Esito sopralluogo
          </div>
          <div>
            {{ inspection.description }}
          </div>
        </div>
        <div class="flex flex-col w-full" *ngIf="!!getInspectionAttachments.length">
          <div class="text-xl font-extrabold uppercase py-1">Allegati sopralluogo</div>
          <div class="overflow-x-auto default-shadow">
            <app-attachments
              [viewOnly]="true"
              [onlyImages]="false"
              title="allegati"
              label="aggiungi allegato"
              [attachmentList]="getAttachmentsObjectList(getInspectionAttachments)"
              [currentAttachment]="getInspectionAttachments">
            </app-attachments>
          </div>
        </div>
      </div>
    </div>

  `,
  styles: [`
    .icon-text-success {
      color: #ECF5F0;
    }

    .icon-text-error {
      color: #F8E9E8;
    }
  `]
})
export default class ViewInspectionComponent implements OnInit {
  store: Store<AppState> = inject(Store);
  active = this.store.selectSignal(getCurrentInspection);
  id = toSignal(this.store.select(selectCustomRouteParam("id")));

  user!: PartialUser;

  currentUser$ = this.store.select(getProfileUser);

  ngOnInit() {
    this.store.dispatch(
      InspectionActions.getInspection({ id: this.id()})
    );

    this.currentUser$.subscribe(user => this.user = user!)
  }

  get getInspectionAttachments(): string[] {
    return this.active()?.attachments || [];
  }

  get getSetupAttachments(): string[] {
    return this.active()?.setup?.attachments || [];
  }

  getIsUserInspectionOwner(userId: number) {
    // console.log('ff', this.user.roles?.some(r => ((r.roleName === Roles.GOD) || (r.roleName === Roles.USER_PLANNER))))
    return this.user.roles?.some(r => ((r.roleName === Roles.GOD) || (r.roleName === Roles.USER_PLANNER))) ? false : this.user.id !== userId;
  }

  protected readonly getAttachmentsObjectList = getAttachmentsObjectList;
  protected readonly InspectionStatus = InspectionStatus;
}
