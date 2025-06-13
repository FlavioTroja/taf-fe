import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../app.config";
import { Subject } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { TaskStepDetailsModalComponent } from "./task-step-details-modal.component";
import { TaskStepDetailsSectionComponent } from "./task-step-details-section.component";
import { mapTaskStepType, TaskStep, TaskStepType, TaskStepStatus } from "../../../../../models/TaskSteps";

@Component({
  selector: 'app-task-steps-progress-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, TaskStepDetailsModalComponent, TaskStepDetailsSectionComponent],
  template: `
    <div>
      <span class="font-extrabold text-xl">STATO AVANZAMENTO</span>

      <div class="flex">
        <div class="flex" *ngFor="let taskStep of getSortedTaskSteps(); index as i">

          <div *ngIf="i !== 0" class="h-11 flex items-center">
            <div class="rounded-full w-24 h-0.5 {{ getPreviousStepStatus(taskStep.type) }}"></div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex justify-center w-24 h-11">
              <div class="flex justify-center items-center w-11 h-11 rounded-full bg-[#CDCDCD] {{ getStatusStyles(taskStep.status) }}">
                <mat-icon class="material-symbols-rounded text-base">{{ taskStepIcon(taskStep.type) }}</mat-icon>
              </div>
            </div>

            <div class="flex flex-col text-sm">
              <span class="text-center w-24 select-none flex flex-col" [ngClass]="{ 'text-accent': ((taskStep.status === TaskStepStatus.DONE) || (taskStep.status === TaskStepStatus.WORKING) || (taskStep.status === TaskStepStatus.PENDING)) }">
                {{ getTaskStepLabel(taskStep.type) }}
              </span>
              <app-task-step-details-section [taskStepLabel]="getTaskStepLabel(taskStep.type)!" [taskStep]="selectedTaskStep!">
                <span #taskStepCompletionModalClickableButtonOnDetails *ngIf="taskStep.status === TaskStepStatus.DONE" (click)="selectTaskStep(taskStep)" class="font-extrabold underline text-accent cursor-pointer flex justify-center">Dettagli</span>
              </app-task-step-details-section>
            </div>
          </div>

          <ng-template #taskStepCompletionModalClickableButton>
            <app-task-step-details-modal [taskStepLabel]="getTaskStepLabel(taskStep.type)!" [username]="taskStepUsername" [taskStep]="selectedTaskStep!"></app-task-step-details-modal>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class TaskStepsProgressBarComponent {

  @Input({ required: true }) taskSteps: TaskStep[] = [];

  store: Store<AppState> = inject(Store);

  subject = new Subject();
  dialog = inject(MatDialog);

  selectedTaskStep: TaskStep | undefined;
  taskStepUsername: string = "";

  getSortedTaskSteps() {
    if (this.taskSteps) {
      return [...this.taskSteps].sort((a, b) => a.cardinal - b.cardinal);
    }
    return;
  }


  taskStepIcon(taskStepType: TaskStepType) {
    const taskStep = this.taskSteps.find(ts => ts.type === taskStepType);

    return `counter_${taskStep?.cardinal! + 1}`;
  }

  getPreviousStepStatus(taskStepType: TaskStepType) {
    const previousIndex = this.getSortedTaskSteps()?.findIndex(ts => ts.type === taskStepType)! - 1 ?? 0;
    const isPreviousStepDone = this.getSortedTaskSteps()?.[previousIndex].status === TaskStepStatus.DONE;

    return !isPreviousStepDone ? 'bg-[#CDCDCD]' : 'bg-[#53ABDE]';
  }

  getTaskStepLabel(taskStepType: TaskStepType) {
    return mapTaskStepType.find(ts => ts.value === taskStepType)?.label;
  }

  getStatusStyles(taskStepStatus: TaskStepStatus) {
    if (taskStepStatus === TaskStepStatus.PENDING) {
      return 'accent border border-[--soko-accent-light] border-dashed'
    }

    if ((taskStepStatus === TaskStepStatus.DONE) || (taskStepStatus === TaskStepStatus.WORKING)) {
      return 'accent border border-[--soko-accent-light]'
    }

    return ''
  }

  selectTaskStep(taskStep: TaskStep) {
    this.selectedTaskStep = taskStep;
  }

  protected readonly TaskStepStatus = TaskStepStatus;
}
