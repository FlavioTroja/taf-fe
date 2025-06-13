import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { CompleteTaskStepSectionComponent } from "./complete-task-step-section.component";
import { DateTime } from "luxon";
import * as TaskStepActions from "../../../store/actions/task-steps.actions"
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../app.config";
import { TaskStepDetailsSectionComponent } from "./task-step-details-section.component";
import { mapTaskStepType, TaskStep, TaskStepStatus, TaskStepType } from "../../../../../models/TaskSteps";


export interface TaskStepBanner {
  value: TaskStepStatus
  title: string
  description: string
  bgClass: string
  iconName: string
  buttonText: string
  buttonAction: () => void,
}

@Component({
  selector: 'app-task-step-status-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule, CompleteTaskStepSectionComponent, TaskStepDetailsSectionComponent],
  template: `
    <div class="flex w-full rounded-md default-shadow p-2" [ngClass]="statusBannerConfiguration.bgClass">
      <div class="flex flex-col gap-3 w-full">
        <span class="font-extrabold text-lg">{{ statusBannerConfiguration.title }}</span>
        <span class="text-black">{{ statusBannerConfiguration.description }}</span>
        <div class="flex w-full justify-end text-black select-none">
          <button *ngIf="isButtonHidden(statusBannerConfiguration.buttonText)" (click)="statusBannerConfiguration.buttonAction()" class="bg-foreground w-auto rounded-md default-shadow-hover flex gap-2 px-2 py-1.5" [ngClass]="{'disabled': taskStep.status === TaskStepStatus.PLANNED}">
            <mat-icon class="material-symbols-rounded">{{ statusBannerConfiguration.iconName }}</mat-icon>
            {{ statusBannerConfiguration.buttonText }}
          </button>

          <app-task-step-details-section [taskStepLabel]="getTaskStepLabel(taskStep.type)!" [taskStep]="taskStep" *ngIf="statusBannerConfiguration.value === TaskStepStatus.DONE">
            <button #taskStepCompletionModalClickableButtonOnDetails class="bg-foreground w-auto rounded-md default-shadow-hover flex gap-2 px-2 py-1.5" [ngClass]="{'disabled': taskStep.status === TaskStepStatus.PLANNED}">
              <mat-icon class="material-symbols-rounded">{{ statusBannerConfiguration.iconName }}</mat-icon>
              {{ statusBannerConfiguration.buttonText }}
            </button>
          </app-task-step-details-section>

          <app-complete-task-step-section [taskStep]="taskStep" *ngIf="statusBannerConfiguration.value === TaskStepStatus.WORKING">
            <button #taskStepCompletionModalClickableButton class="bg-foreground w-auto rounded-md default-shadow-hover flex gap-2 px-2 py-1.5" [ngClass]="{'disabled': taskStep.status === TaskStepStatus.PLANNED}">
              <mat-icon class="material-symbols-rounded">{{ statusBannerConfiguration.iconName }}</mat-icon>
              {{ statusBannerConfiguration.buttonText }}
            </button>
          </app-complete-task-step-section>
        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class TaskStepStatusBannerComponent {
  @Input({ required: true }) taskStep!: TaskStep;

  store: Store<AppState> = inject(Store);

  get mapTaskStepStatusBanner(){
    return [
      {
        value: TaskStepStatus.PLANNED,
        title: "Attendi",
        description: "Non è ancora il tuo turno, attendi che il reparto precedente finisca il proprio lavoro per prendere in carico la tua mansione.",
        bgClass: "warning border border-[--soko-warning]",
        iconName: "circle",
        buttonText: "Prendi in carico",
        buttonAction: () => {}
      },
      {
        value: TaskStepStatus.PENDING,
        title: "È il tuo momento",
        description: this.taskStep.cardinal === 0
          ? "Questa è la prima mansione dell'allestimento, tocca a te!"
          : "Il reparto precedente ha concluso la sua mansione, ora tocca a te!",
        bgClass: "accent border border-[--soko-accent]",
        iconName: "circle",
        buttonText: "Prendi in carico",
        buttonAction: () => this.store.dispatch(TaskStepActions.assignMeTaskStep({ id: this.taskStep.id! }))
      },
      {
        value: TaskStepStatus.WORKING,
        title: "Ci stai lavorando?",
        description: `Hai preso in carico questa mansione il ${this.formatDate(this.taskStep.startDate as string)} alle ${this.formatTime(this.taskStep.startDate as string)}. Quando lo concludi, segnalalo perchè possa andare avanti la produzione.`,
        bgClass: "accent border border-[--soko-accent]",
        iconName: "check",
        buttonText: "Concludi",
        buttonAction: () => {}
      },
      {
        value: TaskStepStatus.DONE,
        title: "Lavoro completato",
        description: `Hai concluso questa mansione il ${this.formatDate(this.taskStep.endDate as string)} alle ${this.formatTime(this.taskStep.endDate as string)}. Hai preso in carico questa mansione il ${this.formatDate(this.taskStep.startDate as string)} alle ${this.formatTime(this.taskStep.startDate as string)}.`,
        bgClass: "bg-foreground",
        iconName: "info",
        buttonText: "Visualizza Informazioni",
        buttonAction: () => {}
      }
    ]
  }

  get statusBannerConfiguration(): TaskStepBanner {
    return this.mapTaskStepStatusBanner.find(status => status.value === this.taskStep.status)!;
  }

  formatDate(date: string) {
    return DateTime.fromISO(date).toFormat('dd/MM/yyyy');
  }

  formatTime(time: string) {
    return DateTime.fromISO(time).toFormat('hh:mm');
  }

  getTaskStepLabel(taskStepType: TaskStepType) {
    return mapTaskStepType.find(ts => ts.value === taskStepType)?.label;
  }

  isButtonHidden(label: string) {
    if (label === 'Concludi') {
      return false
    }

    return label !== 'Visualizza Informazioni';
  }

  protected readonly TaskStepStatus = TaskStepStatus;
}
