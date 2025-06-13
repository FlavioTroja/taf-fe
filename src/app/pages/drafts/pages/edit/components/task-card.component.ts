import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { pairwise, Subject } from "rxjs";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../app.config";
import { CurrentStepPillComponent } from "../../view/components/current-step-pill.component";
import { map } from "rxjs/operators";
import { CustomValidators } from "../../../../../services/custom-validators";
import { difference } from "../../../../../../utils/utils";
import { Task } from "../../../../../models/Task";
import {
  filteredTasksWithNames,
  mapTaskStepType,
  TaskStep,
  TaskStepForm,
  TaskStepStatus,
  TaskStepType
} from "../../../../../models/TaskSteps";
import * as RouterActions from "../../../../../core/router/store/router.actions";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [ CommonModule, MatIconModule, ReactiveFormsModule, MatOptionModule, MatSelectModule, CurrentStepPillComponent, MatAutocompleteModule, MatInputModule ],
  template: `
    <div class="flex flex-col p-2.5 gap-2.5 bg-foreground rounded-md shadow-md w-full">
      <div class="flex w-full">
        <div *ngIf="!!task && !isTaskCardOpen" class="flex w-full flex-col gap-1">
          <span class="font-bold">{{ taskForm.controls.title.value }}</span>
          <span>{{ taskForm.controls.description.value }}</span>

          <div class="flex gap-2 items-center">
            <app-current-step-pill *ngIf="viewOnly && task.currentStepId" [task]="task"></app-current-step-pill>

            <div
              class="flex  w-full px-2 py-1.5 gap-1 items-center break-keep cursor-default rounded-full shadow-md bg-light-gray max-w-min">
              <div class="pr-1 flex self-center">
                <mat-icon class="material-symbols-rounded">
                  conveyor_belt
                </mat-icon>
              </div>
              <div class="text-sm pr-0.5 whitespace-nowrap">
                {{ filteredTasksWithNames(task) }}
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!!task" class="flex w-full justify-end gap-2">
          <div *ngIf="isAtLeastDesignStepDone() && isTaskCardOpen" class="flex flex-col h-full justify-center">
            <div class="flex justify-end">
              <button (click)="navigateToTaskStepDetail()"
                      class="flex items-center gap-2 default-shadow-hover bg-foreground default-shadow px-2 py-1.5 rounded-md blue light-blue">
                <mat-icon class="material-symbols-rounded">visibility</mat-icon>
                Monitora
              </button>
            </div>
          </div>
          <mat-icon class="material-symbols-rounded arrow rounded-full"
                    (click)="toggleIsTaskCardOpen()">
            {{ isTaskCardOpen ? "keyboard_arrow_up" : "keyboard_arrow_down" }}
          </mat-icon>
        </div>
      </div>

      <form *ngIf="!task || isTaskCardOpen"
            class="flex flex-col gap-2 bg-light-gray p-2 rounded-md"
            [ngClass]="{ 'disabled': viewOnly }"
            [formGroup]="taskForm">
        <div class="flex flex-col w-1/3">
          <span class="pb-1 text-sm">titolo</span>
          <input type="text"
                 class="focus:outline-none p-3 rounded-md w-full border-input"
                 formControlName="title">
        </div>

        <div class="flex flex-col w-full">
          <span class="pb-1 text-sm">descrizione</span>
          <textarea
            class="flex w-full bg-foreground p-1 focus:outline-none rounded-md shadow-md resize-none"
            rows="2"
            formControlName="description"></textarea>
        </div>

        <div class="flex flex-col w-full">
          <span class="pb-1 text-sm">fasi di realizazzione</span>
          <div
            class="w-full flex shadow-md bg-foreground text-gray-900 text-sm rounded-lg border-input focus:outline-none p-3 font-bold">
            <mat-select formControlName="taskSteps" [multiple]="true" placeholder="Seleziona lavorazioni"
                        (selectionChange)="changeTaskSteps($event.value)">
              <mat-option *ngFor="let taskStepType of mapTaskStepType" [value]="taskStepType.value" class="font-bold">
                {{ taskStepType.label }}
              </mat-option>
            </mat-select>
          </div>
        </div>

        <div *ngIf="!viewOnly" class="flex gap-4 justify-end">
          <div class="flex gap-2">
            <button *ngIf="!isOnCreate"
                    class="light-red red p-2 rounded-lg shadow-md flex items-center gap-2 cursor-pointer"
                    [ngClass]="{'disabled' : !!task && !hasChanges}"
                    (click)="initTaskForm(this.task)">
              <mat-icon class="material-symbols-rounded">close</mat-icon>

              Annulla
            </button>

            <button *ngIf="isOnCreate"
                    class="light-red red p-2 rounded-lg shadow-md flex items-center gap-2 cursor-pointer"
                    (click)="onCloseCreationForm.emit()">
              <mat-icon class="material-symbols-rounded">close</mat-icon>

              Chiudi
            </button>

            <button class="accent p-2 rounded-lg shadow-md flex items-center gap-2 cursor-pointer"
                    [ngClass]="{'disabled' : taskForm.invalid || (!!task && !hasChanges)}"
                    (click)="handleSave()">
              <mat-icon class="material-symbols-rounded">check</mat-icon>

              Salva
            </button>
          </div>

          <button *ngIf="!!task" class="light-red red p-2 rounded-lg shadow-md flex items-center gap-2 cursor-pointer"
                  (click)="handleDeleteTaskButton()">
            <mat-icon class="material-symbols-rounded">delete</mat-icon>

            Elimina
          </button>
        </div>

      </form>
    </div>
  `,
  styles: [
  ]
})
export class TaskCardComponent implements OnInit {
  @Output() onSave = new EventEmitter<TaskStepForm>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onCloseCreationForm = new EventEmitter<void>();

  @Input({ required: false }) task?: Task;
  @Input({ required: false }) isOnCreate: boolean = false;

  fb = inject(FormBuilder);
  store: Store<AppState> = inject(Store);
  subject = new Subject();
  viewOnly: boolean = window.location.pathname.includes("/view");
  hasChanges = false;

  isTaskCardOpen: boolean = false;

  taskForm = this.fb.group({
    id: [-1],
    title: [{ value: "", disabled: this.viewOnly }, Validators.required],
    description: [{ value: "", disabled: this.viewOnly }, Validators.required],
    taskSteps: [[{}], [CustomValidators.notEmpty]],
  })

  initFormValue: Partial<TaskStepForm> = {};

  ngOnInit() {
    this.initTaskForm(this.task);

    if (!!this.task) {
      this.taskFormChanges();
    }
  }

  taskFormChanges() {
    this.taskForm.valueChanges.pipe(
      pairwise(),
      map(([_, newState]) => {

        return {
          ...difference(this.initFormValue, newState),

          // Array data
          taskSteps: newState.taskSteps
        };
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.taskForm.invalid ? changes : {}),
    ).subscribe(changes => {
        this.hasChanges = !!Object.keys(changes).length
    });
  }

  initTaskForm(task?: Task) {
    this.taskForm.patchValue({
      id: task?.id ?? -1,
      title: task?.title ?? "",
      description: task?.description ?? "",
      taskSteps: task?.taskSteps
        ? task?.taskSteps?.filter(ts => !ts.toBeDisconnected).map((taskStep) => taskStep.type)
        : mapTaskStepType.map(ts => ts.value)
    });

    this.initFormValue = this.taskForm.value as TaskStepForm;
  }

  mapTaskStepTypesToTaskSteps(taskStepTypes: TaskStepType[]) {
    const orderedSteps: TaskStepType[] = mapTaskStepType.map(t => t.value);
    const savedTaskSteps = this.task?.taskSteps ?? [];

    const mappedTaskSteps = orderedSteps.map((step, index) => {
      const existingStepId = savedTaskSteps.find((s) => s.type === step)?.id;

      return {
        id: existingStepId ?? -1,
        type: step,
        cardinal: index,
      };
    }).filter((step) => taskStepTypes.includes(step.type));


    const missingTaskSteps = savedTaskSteps
      .filter((ts) => !taskStepTypes.includes(ts.type))
      .map((step) => ({
        ...step,
        toBeDisconnected: true,
      }));

    return [...mappedTaskSteps, ...missingTaskSteps];
  }

  toggleIsTaskCardOpen() {
    this.isTaskCardOpen = !this.isTaskCardOpen;
  }

  handleSave() {
    const mappedTask: TaskStepForm = {
      id: this.taskForm.controls.id.value ?? -1,
      title: this.taskForm.controls.title.value ?? "",
      description: this.taskForm.controls.description.value ?? '',
      taskSteps: this.mapTaskStepTypesToTaskSteps(this.taskForm.controls.taskSteps.value as TaskStepType[]) as TaskStep[]
    };

    this.onSave.emit(mappedTask);
  }

  handleDeleteTaskButton() {
    this.onDelete.emit();
  }

  changeTaskSteps(value: TaskStepType[]) {
    this.taskForm.controls.taskSteps.patchValue([...value]);
  }

  navigateToTaskStepDetail() {
    const designTaskStepId = this.task?.taskSteps?.find(ts => ts.type === TaskStepType.DESIGN)?.id;

    this.store.dispatch(RouterActions.go({ path: [`/task-steps/${designTaskStepId}/view`] }));
  }

  isAtLeastDesignStepDone() {
    return this.task?.taskSteps?.some(ts => ts.type === TaskStepType.DESIGN && ts.status === TaskStepStatus.DONE);
  }

  protected readonly mapTaskStepType = mapTaskStepType;
  protected readonly filteredTasksWithNames = filteredTasksWithNames;
}
