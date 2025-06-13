import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PathStep, ProgressPathComponent } from "../../../../../components/progress-path/progress-path.component";
import { Setup, SetupStatus } from "../../../../../models/Setup";
import * as DraftsActions from "../../../store/actions/drafts.actions";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../app.config";
import { ModalComponent, ModalDialogData } from "../../../../../components/modal/modal.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-draft-progress',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, ProgressPathComponent],
  template: `
    <div class="flex flex-col bg-foreground default-shadow justify-center rounded-lg h-full py-2"
         [ngClass]="{'pointer-events-none' : isView || !setup.totalAmount}">
      <div class="flex justify-between">
        <app-progress-path
          [steps]="draftProgress"
          [currentStepIndex]="currentStep!"
          [hasTotalAmount]="!!setup.totalAmount"
          [setup]="setup"
        />

        <div class="pr-2 flex flex-col justify-end">
          <button *ngIf="isCancelButtonHidden()" class="px-2 py-1.5 flex gap-2 items-center red-buttons rounded-md shadow-md select-none cursor-pointer"
                  (click)="fromDraftOrQuoteToCanceled()"
                  [ngClass]="{
                    'opacity-50  bg-opacity-50' : isView,
                    'pointer-events-none opacity-50 bg-opacity-50': isButtonCanceledDisabled,
                    'pointer-events-auto': !setup.totalAmount,
                  }"
          >
            <mat-icon class="material-symbols-rounded">delete</mat-icon>
            Annulla Intervento
          </button>

          <button *ngIf="setup.setupStatus === SetupStatus.CANCELED" class="px-2 py-1.5 flex gap-2 items-center accent rounded-md shadow-md select-none cursor-pointer"
                  (click)="fromCanceledToDraft()"
                  [ngClass]="{
                    'opacity-50  bg-opacity-50' : isView,
                  }"
          >
            <mat-icon class="material-symbols-rounded">settings_backup_restore</mat-icon>
            Ripristina
          </button>
        </div>
      </div>
    </div>
  `,
})
export class DraftProgressComponent {
  private readonly mapSetupStatus = [
    { status: SetupStatus.DRAFT, rank: 0 },
    { status: SetupStatus.QUOTE, rank: 1 },
    { status: SetupStatus.CONFIRMED, rank: 2 },
    { status: SetupStatus.DONE, rank: 2 },
  ];
  private dialog = inject(MatDialog);

  @Input() isView = false;
  @Input() setup!: Setup;

  constructor(private store: Store<AppState>) {}

  draftProgress: PathStep[] = [
    {
      name: "Bozza",
      icon: "edit_note",
      iconClass: "setup-draft-color setup-draft-icon-container",
      textClass: "setup-draft-color",
      backwardAction: () => {},
      forwardAction: () => this.fromDraftToQuote()
    },
    {
      name: "Preventivo inviato",
      icon: "sell",
      iconClass: "setup-quote-icon-container setup-quote-color",
      textClass: "setup-quote-color",
      progressBarClass: "setup-quote-bg",
      backwardAction: () => this.fromQuoteToDraft(),
      forwardAction: () => this.fromQuoteToCompleted()
    },
    {
      name: "Confermato",
      icon: "check_circle",
      iconClass: "setup-confirmed-icon-container setup-confirmed-color",
      textClass: "setup-confirmed-color",
      progressBarClass: "setup-confirmed-progress-bar-bg",
      backwardAction: () => {},
      forwardAction: () => {},
    },
  ];

  get currentStep() {
    // console.log('f', this.mapSetupStatus.find((s) => s.status === this.setup.setupStatus)?.rank)
    return this.mapSetupStatus.find((s) => s.status === this.setup.setupStatus)?.rank ?? undefined;
  }

  get isButtonCanceledDisabled() {
    return [SetupStatus.CONFIRMED, SetupStatus.CANCELED].includes(this.setup.setupStatus)
  }

  fromDraftToQuote() {
    this.confirmWithModal(
      "Trasformare la bozza in preventivo?",
      `
        <div>Stai trasformando una bozza in un preventivo. Dopo questa operazione verrà assegnato un numero di preventivo e l’allestimento non sarà più modificabile.</div>
        <div><b>Potrai però sempre tornare allo stato di bozza e fare modifiche.</b>Vuoi continuare?</div>
      `,
      () => this.store.dispatch(DraftsActions.quoteDraft({ id: this.setup.id }))
    );
  }

  fromQuoteToDraft() {
    this.confirmWithModal(
      "Tornare allo stato di bozza?",
      `
        <div>Con questa operazione tornerai allo stato di bozza e potrai apportare modifiche alla scheda tecnica.</div>
        <div><b> Il numero di preventivo resterà occupato.</b>Vuoi continuare?</div>
      `,
      () => this.store.dispatch(DraftsActions.backToDraft({ id: this.setup.id }))
    );
  }

  fromQuoteToCompleted() {
    this.confirmWithModal(
      "Confermare la scheda tecnica?",
      `
        <div>Stai trasformando un preventivo in un contratto. Dopo questa operazione verrà assegnato un numero di contratto univoco, l’allestimento passerà in lavorazione e non sarà più modificabile.</div>
        <div><b>Questa operazione è irreversibile.</b>Vuoi continuare?</div>
      `,
      () => this.store.dispatch(DraftsActions.confirmQuote({ id: this.setup.id }))
    );
  }

  fromDraftOrQuoteToCanceled() {
    this.confirmWithModal(
      "Annullare l'intervento?",
      `
      <div>Stai annullando un intervento, ciò significa che verrà contrassegnato come "Annullato".</div>
      <div><b>Non potrai più apportare modifiche a meno che non venga ripristinato.</b>Vuoi continuare?</div>
      `,
      () => this.store.dispatch(DraftsActions.toggleDraftCanceled({ id: this.setup.id }))
    );
  }

  fromCanceledToDraft() {
    this.confirmWithModal(
      "Ripristinare l'intervento?",
      `
      <div>Stai ripristinando un intervento, ciò significa che verrà contrassegnato come "Bozza".</div>
      <div><b>Dopodichè potrai nuovamente apportare modifiche.</b>Vuoi continuare?</div>
      `,
      () => this.store.dispatch(DraftsActions.toggleDraftCanceled({ id: this.setup.id }))
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

  isCancelButtonHidden() {
    return (!((this.setup.setupStatus === SetupStatus.CANCELED) || (this.setup.setupStatus === SetupStatus.CONFIRMED) || (this.setup.setupStatus === SetupStatus.DONE)));
  }

  protected readonly SetupStatus = SetupStatus;
}
