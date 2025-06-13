import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { mapTaskStepType, TaskStep, TaskStepStatus } from "../../models/TaskSteps";
import { StatusPillComponent } from "../pill/status-pill.component";
import { Setup } from "../../models/Setup";

export interface PathStep {
  name: string
  icon: string
  iconClass?: string
  textClass?: string
  progressBarClass?: string
  //from current to previous state
  backwardAction: () => void,
  //from current next state
  forwardAction: () => void,
}

@Component({
  selector: 'app-progress-path',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, StatusPillComponent],
  template: `
    <div class="flex" [ngClass]="{'flex-col': isForTaskSteps}">
      <div class="flex items-start transition-all duration-100"
           *ngFor="let step of steps; index as i; first as isFirst">

        <div class="h-11 flex items-center" *ngIf="!isFirst && !isForTaskSteps">
          <div class="rounded-full w-24 h-1 bg-black {{getProgressBarClass(step, i)}}"></div>
        </div>

        <div class="flex">
          <button
            class="flex flex-col gap-2 {{(!hasTotalAmount && !isForTaskSteps && currentStepIndex !== i && 'opacity-50 bg-opacity-10') || (i - 1 > currentStepIndex && !isForTaskSteps && 'opacity-50 bg-opacity-10')}}"
            [ngClass]="{'!gap-4': isForTaskSteps && steps.length > 1 && getTaskStep(step.name)?.status === TaskStepStatus.WORKING, '!gap-3': isForTaskSteps && steps.length === 1, 'cursor-auto': currentStepIndex === 2 && !isForTaskSteps}"
            [disabled]="isStepDisabled(i)"
            (click)="executeAction(i)">
            <div class="flex justify-center w-24 h-11">
              <div
                class="flex justify-center items-center w-11 h-11 rounded-full {{!isForTaskSteps ? getStepIconClass(step, i) : step.iconClass}}">
                <mat-icon
                  class="material-symbols-rounded text-base"
                  [ngClass]="{'scale-[0.7]': isForTaskSteps}">{{ step.icon }}</mat-icon>
              </div>
            </div>

            <div *ngIf="isForTaskSteps && i + 1 !== steps.length || isForTaskSteps && steps.length === 1" class="h-12 flex items-center self-center">
              <div class="rounded-full !w-0.5 h-16 bg-black {{getProgressBarClass(step, i)}}"
                   [ngClass]="{'!h-10': isForTaskSteps && steps.length > 1, '!h-16': isForTaskSteps && steps.length > 1 && getTaskStep(step.name)?.status === TaskStepStatus.WORKING}"></div>
            </div>

            <span *ngIf="!isForTaskSteps" class="text-center w-24 text-sm select-none {{getTextClass(step, i)}}">
              {{ step.name }}
            </span>
          </button>

          <div *ngIf="isForTaskSteps && steps.length > 0 && taskSteps" class="flex flex-col gap-1">
            <div class="flex flex-col gap-1">
              <span class="text-center w-24 text-lg font-extrabold select-none pr-3 {{getTextClass(step, i)}}">
                {{ step.name }}
              </span>

              <app-status-pill *ngIf="getTaskStep(step.name)?.status === TaskStepStatus.WORKING"
                               [text]="getTaskStep(step.name)?.user?.username ?? 'Nessuno'" iconName="person"
                               containerClass="bg-foreground"/>
            </div>

            <div class="flex gap-1">
              <mat-icon class="material-symbols-rounded scale-[0.7]">circle</mat-icon>
              <span class="font-extrabold">{{ getTaskStep(step.name)?.startDate | date: 'dd/MM/yyy' }}</span>
              <span
                *ngIf="getTaskStep(step.name)?.startDate">- {{ getTaskStep(step.name)?.startDate | date: 'hh:mm' }}</span>
            </div>

            <div class="flex gap-1 ">
              <mat-icon class="material-symbols-rounded scale-[0.7]">check</mat-icon>
              <span class="font-extrabold">{{ getTaskStep(step.name)?.endDate | date: 'dd/MM/yyy' }}</span>
              <span
                *ngIf="getTaskStep(step.name)?.endDate">- {{ getTaskStep(step.name)?.endDate | date: 'hh:mm' }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [``]
})
export class ProgressPathComponent {
  @Input() currentStepIndex: number = 0;
  @Input() steps!: PathStep[];
  @Input() isForTaskSteps: boolean = false;
  @Input() setup!: Setup;
  @Input() taskSteps!: TaskStep[];
  @Input() hasTotalAmount!: boolean;

  isStepDisabled(stepCount: number) {
    return this.currentStepIndex + 1 !== stepCount && this.currentStepIndex - 1 !== stepCount;
  }

  getStepIconClass(step: PathStep, stepCount: number) {
    return this.currentStepIndex >= stepCount ? step.iconClass : "bg-gray-200";
  }

  getTextClass(step: PathStep, stepCount: number) {
    return this.currentStepIndex >= stepCount && step?.textClass;
  }

  getProgressBarClass(step: PathStep, stepCount: number) {
    return this.currentStepIndex >= stepCount ? step?.progressBarClass : "bg-opacity-10";
  }

  executeAction(index: number) {
    if (index === this.currentStepIndex) {
      return;
    }

    const currentStep = this.steps.at(this.currentStepIndex);

    if (!currentStep) {
      return;
    }

    index > this.currentStepIndex ? currentStep.forwardAction() : currentStep.backwardAction();
  }

  getTaskStep(label: string) {
    return this.taskSteps?.find(ts => ts.type === mapTaskStepType?.find(ts => ts.label === label)?.value);
  }

  getHeight(label: string) {
    const status = this.getTaskStep(label)?.status;

    if (status === TaskStepStatus.WORKING) {
      return '!h-12'
    }

    return '!h-10'
  }

  protected readonly TaskStepStatus = TaskStepStatus;
}
