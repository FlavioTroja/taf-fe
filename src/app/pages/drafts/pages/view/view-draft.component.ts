import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule} from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { toSignal } from "@angular/core/rxjs-interop";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import * as DraftsActions from "../../../../pages/drafts/store/actions/drafts.actions";
import { getCurrentSetup } from "../../store/selectors/drafts.selectors";
import { HyperPillComponent } from "../../../../components/pill/hyper-pill.component";
import { DraftProgressComponent } from "./components/draft-progress.component";
import { StatusPillComponent } from "../../../../components/pill/status-pill.component";
import { getComplexityFromRank, Setup, SetupStatus } from "../../../../models/Setup";
import { AttachmentsComponent } from "../../../../components/attachments/attachments.component";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import DraftCostComponent from "../edit/components/draft-cost.component";
import { TaskCardComponent } from "../edit/components/task-card.component";
import { HideByCodeSelectorDirective } from "../../../../shared/directives/hide-by-code-selector.directive";
import { filteredTasksWithNames, TaskStepStatus } from "../../../../models/TaskSteps";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { map } from "rxjs/operators";
import { Roles, User } from "../../../../models/User";
import { getProfileUser } from "../../../../core/profile/store/profile.selectors";
import { Subject, takeUntil } from "rxjs";
import { hasRoles } from "../../../../../utils/utils";
import { StatusBannerComponent } from "./components/status-banner.component";

@Component({
  selector: 'app-view-draft',
  standalone: true,
  imports: [CommonModule, MatIconModule, HyperPillComponent, DraftProgressComponent, StatusPillComponent, AttachmentsComponent, MatDialogModule, DraftCostComponent, TaskCardComponent, HideByCodeSelectorDirective, StatusBannerComponent],
  template: `
    <div *ngIf="active() as setup">
      <div *ngIf="!isForTaskStepsComponent" class="py-1">
        <div *ngIf="setup.setupStatus !== SetupStatus.CANCELED" class="text-xl font-extrabold uppercase">STATO AVANZAMENTO</div>
        <app-draft-progress
          *ngIf="setup.setupStatus !== SetupStatus.CANCELED"
          [setup]="setup"
        />
<!--          [setupStatus]="setup.setupStatus"-->
<!--          [setupId]="setup.id"-->
<!--        />-->
<!--          [ngClass]="{ 'pointer-events-none': !(isUserCommercial() | async) || !setup.totalAmount }"-->
      </div>

      <div *ngIf="setup.setupStatus === SetupStatus.CANCELED">
        <app-status-banner
          [isForCancelledDraft]="true"
          (isDelete)="fromCanceledToDelete()"
          (isRestore)="fromCanceledToDraft()"
        />
      </div>

      <div class="text-xl font-extrabold uppercase py-1">{{ isForTaskStepsComponent ? 'Scheda tecnica completa' : 'Informazioni Generali' }}</div>
      <div class="flex flex-col rounded bg-white shadow p-2.5 gap-2.5">
        <div class="flex flex-row justify-between w-full">
          <div class="flex flex-col gap-2.5">
            <div class="flex flex-row gap-2">
              <app-hyper-pill *ngIf="setup.quoteCode" tooltipText="Numero Preventivo" [text]="setup.quoteCode" iconName="contract_edit"></app-hyper-pill>
              <app-hyper-pill *ngIf="setup.setupCode" tooltipText="Numero Contratto" [text]="setup.setupCode!" iconName="contract"></app-hyper-pill>
              <app-hyper-pill iconName="person_apron"
                              [tooltipText]="!setup.inspection?.user?.username ? 'Non è stato associato nessun responsabile' : ''"
                              [text]="setup?.inspection?.user?.username ?? 'Responsabile non asscoiato'"></app-hyper-pill>
            </div>
            <div class="flex flex-col font-bold">
              <div class="flex flex-row text-4xl">{{ setup?.title }}</div>
              <div class="flex flex-row text-2xl">{{ setup?.customer?.name }}</div>
            </div>
            <div class="flex gap-2">
              <app-status-pill [status]="setup.isInspectionNeeded ? 'SETUP' : 'SERVICE'"/>
              <app-status-pill [status]="getComplexityFromRank(setup.complexity!)"/>
              <app-status-pill *ngIf="setup && setup.tasks?.at(0)" [text]="filteredTasksWithNames(setup.tasks[0]).toString()" iconName="conveyor_belt" containerClass="bg-light-gray"/>
            </div>
            <div>
              <span class="font-bold">Indirizzo:</span>
              {{ setup?.address?.address }},
              <span *ngIf="setup?.address?.number">{{ setup?.address?.number }},</span>
              {{ setup?.address?.city }}
            </div>
          </div>
          <div class="flex flex-col gap-2.5">
            <div *ngIf="setup?.inspection?.date"
                 class="flex-initial whitespace-nowrap self-center rounded-full bg-gray-100 px-2 py-1 flex justify-between gap-2">
              <div class="flex self-center">
                <mat-icon class="material-symbols-rounded">calendar_month</mat-icon>
              </div>
              <div class="self-center">
                {{ setup?.inspection?.date  | date: 'dd/MM/yyyy' }}
              </div>
            </div>
            <div *ngIf="setup?.dueDate"
                 class="flex-initial whitespace-nowrap self-center rounded-full bg-gray-100 px-2 py-1 flex justify-between gap-2">
              <div class="flex self-center">
                <mat-icon class="material-symbols-rounded">calendar_clock</mat-icon>
              </div>
              <div class="self-center">
                {{ setup?.dueDate  | date: 'dd/MM/yyyy' }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2.5" *ngIf="setup?.inspection?.description">
          <div class="font-bold">
            Esito sopralluogo
          </div>
          <div>
            {{ setup?.inspection?.description ?? "Nessuna descrizione per il sopralluogo" }}
          </div>
        </div>
        <div class="flex flex-col gap-2.5" *ngIf="setup?.description">
          <div class="font-bold">
            Descrizione
          </div>
          <div>
            {{ setup?.description ?? "Nessuna descrizione per l'allestimento" }}
          </div>
        </div>
      </div>

      <div class="text-xl font-extrabold uppercase py-1">Allegati allestimento</div>
      <div class="overflow-x-auto default-shadow">
        <app-attachments
          [viewOnly]="viewOnly"
          [onlyImages]="false"
          title="allegati"
          label="aggiungi allegato"
          [attachmentList]="getAttachmentsObjectList(setup.attachments)">
        </app-attachments>
      </div>

      <div *ngIf="!isForTaskStepsComponent && setup.tasks.length">
        <div class="text-xl font-extrabold uppercase py-1">TASK</div>
        <div class="flex flex-col w-full gap-2.5">
          <app-task-card
            *ngFor="let task of setup.tasks"
            [task]="task"
          />
        </div>
      </div>

      <div *fbHideByCodeSelector="'view.draft.costs-container'">
        <div class="text-xl font-extrabold uppercase py-1" *ngIf="setup.costs.length">Costi</div>
        <div class="flex flex-col gap-1 w-full" *ngIf="setup.costs.length">
          <app-draft-cost *ngFor="let cost of setup.costs" [cost]="cost" class="w-full" />
        </div>

        <div class="flex justify-between text-xl uppercase py-1" *ngIf="!!getTotalPrice(setup)">
          <b>Costo totale</b>
          <span>€{{ getTotalPrice(setup).toFixed(2) }}</span>
        </div>

        <div class="flex justify-between text-xl uppercase py-1" *ngIf="!!getTotalPrice(setup)">
          <b>Prezzo proposto</b>
          <span>€{{ setup.totalTaxable.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})

export default class ViewDraftComponent implements OnInit {
  @Input() isForTaskStepsComponent: boolean = false;
  @Input() setupId!: number; // Only used for view-task-step component

  store: Store<AppState> = inject(Store);
  dialog = inject(MatDialog);
  subject = new Subject();

  active = this.store.selectSignal(getCurrentSetup);
  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  viewOnly: boolean = window.location.pathname.includes("/view");

  currentProfileUser$ = this.store.select(getProfileUser);
  currentUser: Partial<User> = {};

  ngOnInit() {
    this.store.dispatch(
      DraftsActions.getSetup({
        id: this.isForTaskStepsComponent ? this.setupId : this.id(),
      })
    );

    this.currentProfileUser$.pipe(takeUntil(this.subject), map(user => this.currentUser = user))
  }

  getTotalPrice(draft: Setup): number {
    return (draft.costs ?? []).reduce((previousValue, currentValue) => previousValue + currentValue.price * currentValue.quantity, 0)
  }

  getAttachmentsObjectList(attachments: string[]) {
    return attachments.map(url => {
      const arr = (url as string).split(".");
      return {
        value: url,
        type: arr[arr.length - 1],
        name: arr[arr.length - 2] + arr[arr.length - 1]
      };
    });
  }

  fromCanceledToDelete() {
    this.confirmWithModal(
      "Cancellare l'intervento?",
      `
      <div>Stai eliminando un intervento contrassegnato come "ANNULLATO".</div>
      <div><b>Una volta eliminato non potrai più recuperarlo.</b>Vuoi continuare?</div>
      `,
      () => this.store.dispatch(DraftsActions.deleteSetup({ id: this.id() }))
    );
  }

  fromCanceledToDraft() {
    this.confirmWithModal(
      "Ripristinare l'intervento?",
      `
      <div>Stai ripristinando un intervento, ciò significa che verrà contrassegnato come "Bozza".</div>
      <div><b>Dopodichè potrai nuovamente apportare modifiche.</b>Vuoi continuare?</div>
      `,
      () => this.store.dispatch(DraftsActions.toggleDraftCanceled({ id: this.id() }))
    );
  }

  confirmWithModal(title: string, content: string, action: () => void) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      maxWidth: 800,
      data: <ModalDialogData> {
        title,
        content,
        buttons: [
          { iconName: "check", label: "Conferma", bgColor: "confirm", onClick: () => dialogRef.close(true) },
          { iconName: "clear", label: "Annulla",  onClick: () => dialogRef.close(false) }
        ]
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if(!result) {
        return;
      }

      action();
    });
  }

  isUserCommercial() {
    return hasRoles(this.currentUser, [{ role: Roles.USER_COMMERCIAL }]);
  }

  protected readonly getComplexityFromRank = getComplexityFromRank;
  protected readonly filteredTasksWithNames = filteredTasksWithNames;
  protected readonly SetupStatus = SetupStatus;
  protected readonly TaskStepStatus = TaskStepStatus;
}
