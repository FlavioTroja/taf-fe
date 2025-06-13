import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDialogModule } from "@angular/material/dialog";
import { HyperPillComponent } from "../../../../../components/pill/hyper-pill.component";

import { PathStep, ProgressPathComponent } from "../../../../../components/progress-path/progress-path.component";
import { StatusPillComponent } from "../../../../../components/pill/status-pill.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../app.config";
import * as TaskStepActions from "../../../store/actions/task-steps.actions"
import * as RouterActions from "../../../../../core/router/store/router.actions";
import { CompleteTaskStepSectionComponent } from "../../view/components/complete-task-step-section.component";
import { mapTaskStepType, TaskStep, TaskStepStatus } from "../../../../../models/TaskSteps";

@Component({
  selector: 'app-task-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatTooltipModule, MatDialogModule, HyperPillComponent, ProgressPathComponent, StatusPillComponent, CompleteTaskStepSectionComponent],
  template: `
    <div class="w-full p-5 h-full bg-foreground rounded-md flex flex-col gap-1">
      <div class="flex justify-between h-8 pb-1">
        <div class="flex gap-2 items-center">
          <app-hyper-pill iconName="person"
                          [isTextBold]="false"
                          [tooltipText]="!taskStep.task?.setup?.customer?.name ? 'Non è stato associato nessun responsabile' : ''"
                          [text]="taskStep.task?.setup?.customer?.name ?? 'Responsabile non asscoiato'">
          </app-hyper-pill>

          <div *ngIf="taskStep.task?.setup?.dueDate"
               class="flex-initial bg-light-gray whitespace-nowrap select-none self-center rounded-full px-2 py-1 flex justify-between gap-2">
            <div class="flex items-center self-center">
              <mat-icon class="material-symbols-rounded">calendar_clock</mat-icon>
            </div>
            <div class="flex items-center self-center">
              {{ taskStep.task?.setup?.dueDate  | date: 'dd/MM/yyyy' }}
            </div>
          </div>
        </div>
      </div>

      <div class="min-h-[60px] font-bold text-xl flex items-center">
        {{ taskStep.task?.title }}
      </div>

      <div class="flex gap-1 w-full bg-light-gray p-2.5 rounded-md">
        <app-progress-path [steps]="progressTaskStep" [isForTaskSteps]="true"/>
        <div class="flex flex-col gap-1">
          <span class="text-2xl font-bold">
            {{ taskTypeName }}
          </span>
          <app-status-pill [text]="taskStep.user?.username ?? 'Nessuno'"
                           iconName="person_apron"
                           containerClass="bg-foreground"
                            [ngClass]="{'opacity-50': !taskStep.user?.username}"/>
          <div class="flex gap-1 items-center">
            <mat-icon class="material-symbols-rounded scale-[0.7]">circle</mat-icon>
            <span class="font-extrabold">{{ taskStep.startDate | date: 'dd/MM/yyy' }}</span>
            <span *ngIf="taskStep.startDate">- {{ taskStep.startDate | date: 'hh:mm' }}</span>
          </div>

          <div class="flex gap-1 text-xl items-center">
            <mat-icon class="material-symbols-rounded scale-[0.7]">check</mat-icon>
            <span class="font-extrabold">{{ taskStep.endDate | date: 'dd/MM/yyy' }}</span>
            <span *ngIf="taskStep.endDate">- {{ taskStep.endDate | date: 'hh:mm' }}</span>
          </div>

        </div>
      </div>

      <div class="flex h-full gap-2 justify-end">
        <app-complete-task-step-section [taskStep]="taskStep">
          <div class="flex flex-col h-full justify-end" *ngIf="taskStep.status === TaskStepStatus.WORKING">
            <div class="flex justify-end">
              <button #taskStepCompletionModalClickableButton class="flex items-center gap-2 default-shadow-hover bg-foreground default-shadow px-2 py-1.5 rounded-md">
                <mat-icon class="material-symbols-rounded">circle</mat-icon>
                Completa
              </button>
            </div>
          </div>
        </app-complete-task-step-section>

        <div class="flex flex-col h-full justify-end" *ngIf="taskStep.status === TaskStepStatus.PENDING">
          <div class="flex justify-end">
            <button (click)="assignTaskStepToMe()"
                    class="flex items-center gap-2 default-shadow-hover bg-foreground default-shadow px-2 py-1.5 rounded-md">
              <mat-icon class="material-symbols-rounded">circle</mat-icon>
              Prendi in carico
            </button>
          </div>
        </div>

        <div class="flex flex-col h-full justify-end">
          <div class="flex justify-end">
            <button (click)="navigateToTaskStepDetail()"
                    class="flex items-center gap-2 default-shadow-hover bg-foreground default-shadow px-2 py-1.5 rounded-md blue light-blue">
              <mat-icon class="material-symbols-rounded">visibility</mat-icon>
              Visualizza
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`

  `]
})
export default class TaskStepComponent {
  @Input() taskStep!: TaskStep;

  store: Store<AppState> = inject(Store);

  get progressTaskStep(): PathStep[] {
    return [
     {
       name: this.taskTypeName!,
       icon: this.taskStepIcon!,
       iconClass: `${this.taskStep.status === TaskStepStatus.DONE ? 'bg-[#0D99FF] text-white' : 'blue'} border border-[#0D99FF] border-dashed`,
       textClass: "",
       backwardAction: () => {},
       forwardAction: () => {}
     }
    ]
  }

  mapTaskStepStatusIcon = [
    { value: TaskStepStatus.PENDING, icon: "error" },
    { value: TaskStepStatus.PLANNED, icon: "" },
    { value: TaskStepStatus.WORKING, icon: "pace" },
    { value: TaskStepStatus.DONE, icon: "done" },
  ]

  private DESCRIPTION_LENGTH = 70;

  get taskDescription() {
    let currentLength = 0;

    return this.taskStep.task?.description.split(" ")
      .filter((word) => {
        currentLength += word.length;
        return currentLength < this.DESCRIPTION_LENGTH;
      })
      .join(" ");
  }

  get taskTypeName() {
    return mapTaskStepType.find(m => m.value === this.taskStep?.type)?.label
  }

  get taskStepIcon() {
    return this.mapTaskStepStatusIcon?.find(m => m.value === this.taskStep.status)?.icon;
  }

  assignTaskStepToMe() {
    this.store.dispatch(TaskStepActions.assignMeTaskStep({ id: this.taskStep.id! }))
  }

  navigateToTaskStepDetail() {
    this.store.dispatch(TaskStepActions.clearTaskStepActive());
    this.store.dispatch(RouterActions.go({ path: [`/task-steps/${this.taskStep.id}/view`] }));
  }

  protected readonly TaskStepStatus = TaskStepStatus;
}
