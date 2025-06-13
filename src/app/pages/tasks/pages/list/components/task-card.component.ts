import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HyperPillComponent } from "../../../../../components/pill/hyper-pill.component";
import { MatIconModule } from "@angular/material/icon";
import { PathStep, ProgressPathComponent } from "../../../../../components/progress-path/progress-path.component";
import { mapTaskStepType, TaskStep, TaskStepStatus, TaskStepType } from "../../../../../models/TaskSteps";
import { Task } from "../../../../../models/Task";
import * as RouterActions from "../../../../../core/router/store/router.actions";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../app.config";

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, HyperPillComponent, MatIconModule, ProgressPathComponent],
  template: `
    <div class="p-5 h-full bg-foreground rounded-md flex flex-col w-[544px]">
      <div class="flex justify-between h-8 pb-1">
        <div class="flex gap-2 items-center">
          <app-hyper-pill iconName="person_apron"
                          [tooltipText]="!task.setup?.customer?.name ? 'Non è stato associato nessun responsabile' : ''"
                          [text]="task.setup?.customer?.name ?? 'Responsabile non asscoiato'">
          </app-hyper-pill>

          <div *ngIf="task?.setup?.dueDate"
               class="flex-initial bg-light-gray whitespace-nowrap select-none self-center rounded-full px-2 py-1 flex justify-between gap-2">
            <div class="flex items-center self-center">
              <mat-icon class="material-symbols-rounded">calendar_month</mat-icon>
            </div>
            <div class="flex items-center self-center">
              {{ task.setup?.dueDate  | date: 'dd/MM/yyyy' }}
            </div>
          </div>
        </div>
      </div>

      <div class="min-h-[60px] max-w-md font-bold text-xl flex items-center">
        {{ task.title }}
      </div>

      <div class="flex gap-1 h-full bg-light-gray p-2.5 rounded-md">
        <app-progress-path [steps]="progressTaskStep" [isForTaskSteps]="true" [taskSteps]="task.taskSteps!"/>
      </div>

      <div class="flex flex-col justify-end pt-2.5">
        <div class="flex justify-end">
          <button (click)="navigateToDraftDetail()"
                  class="flex items-center gap-2 default-shadow-hover bg-foreground default-shadow px-2 py-1.5 rounded-md blue light-blue">
            <mat-icon class="material-symbols-rounded">visibility</mat-icon>
            Visualizza
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class TaskCardComponent {
  @Input() task!: Task;

  store: Store<AppState> = inject(Store);

  mapTaskStepStatusIcon = [
    { value: TaskStepStatus.PENDING, icon: "error", classStyles: "" },
    { value: TaskStepStatus.PLANNED, icon: "", classStyles: "!border-dashed" },
    { value: TaskStepStatus.WORKING, icon: "pace", classStyles: "" },
    { value: TaskStepStatus.DONE, icon: "done", classStyles: "" },
  ];

  get progressTaskStep(): PathStep[] {
    return this.task?.taskSteps?.slice()
      ?.sort((a, b) => a.cardinal - b.cardinal)
      .map(taskStep => ({
        name: this.taskTypeName(taskStep.type) || '',
        icon: this.taskStepIcon(taskStep.status) || '',
        iconClass: `${this.taskStepClass(taskStep.status)} ${taskStep.status === TaskStepStatus.DONE ? 'bg-[#0D99FF] text-white' : 'blue'} border border-[--soko-accent]` || '',
        textClass: "",
        backwardAction: () => this.handleBackwardAction(taskStep),
        forwardAction: () => this.handleForwardAction(taskStep)
      })) || [];
  }

  taskTypeName(taskStepType: TaskStepType): string | undefined {
    return mapTaskStepType.find(m => m.value === taskStepType)?.label;
  }

  taskStepIcon(taskStepStatus: TaskStepStatus): string | undefined {
    return this.mapTaskStepStatusIcon.find(m => m.value === taskStepStatus)?.icon;
  }

  taskStepClass(taskStepStatus: TaskStepStatus): string | undefined {
    return this.mapTaskStepStatusIcon.find(m => m.value === taskStepStatus)?.classStyles;
  }

  handleBackwardAction(taskStep: TaskStep) {
    console.log(`Backward action triggered for ${taskStep.type}`);
  }

  handleForwardAction(taskStep: TaskStep) {
    console.log(`Forward action triggered for ${taskStep.type}`);
  }

  navigateToDraftDetail() {
    this.store.dispatch(RouterActions.go({ path: [`/drafts/${this.task.setupId}/view`] }));
  }

  protected readonly TaskStepStatus = TaskStepStatus;
}
