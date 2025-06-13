import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from "../../../../../models/Task";
import { mapTaskStepType, TaskStepStatus } from "../../../../../models/TaskSteps";

@Component({
  selector: 'app-current-step-pill',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex  w-full px-2 py-1.5 gap-1 items-center break-keep cursor-default rounded-full shadow-md bg-light-gray max-w-min">
      <div class="flex gap-1">
        <div
          *ngFor="let taskStep of orderedTaskSteps"
          class="flex rounded-full h-7 w-12 bg-[#DADADA]"
          [ngClass]="{
            '!bg-[#53ABDE]': (taskStep.status === TaskStepStatus.DONE),
            '!border !border-[#53ABDE]': (taskStep.id === task.currentStepId) && (taskStep.status === TaskStepStatus.WORKING),
          }">
        </div>
      </div>

      <div class="text-sm pr-0.5 whitespace-nowrap">
        in <span class="font-extrabold">{{ currentStepLabel }}</span>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class CurrentStepPillComponent {
  @Input({ required: true }) task!: Task;

  get orderedTaskSteps() {
    return this.task.taskSteps?.slice().sort((a, b) => (a.cardinal ?? 0) - (b.cardinal ?? 0));
  }

  get currentStep() {
    return this.task.taskSteps?.find((taskStep) => taskStep.id === this.task.currentStepId);
  }

  get currentStepLabel() {
    return mapTaskStepType.find((e) => e.value === this.currentStep?.type)?.label;
  }

  protected readonly TaskStepStatus = TaskStepStatus;
}
