import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { Subject } from "rxjs";
import { Query } from "../../../../../global";
import * as TasksActions from "../../store/actions/tasks.actions";
import { TaskFilter } from "../../../../models/Task";
import { getTasksPaginatedDocs } from "../../store/selectors/tasks.selectors";
import { TaskCardComponent } from "./components/task-card.component";
import { mapTaskStepType, TaskStepStatus } from "../../../../models/TaskSteps";

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, MatDialogModule, TaskCardComponent],
  template: `
    <div class="flex flex-col gap-2">
      <div class="flex gap-2">
        <div (click)="selectTaskStepTypeFilter(elem.label)"
             class="py-1 px-2 rounded-full bg-[#DBD6D6] font-extrabold uppercase w-48 flex justify-center items-center cursor-pointer select-none"
             *ngFor="let elem of filtersLabels()"
             [ngClass]="{'accent': elem.isSelected}">
          {{ elem.label }}
        </div>
      </div>
      <div class="flex flex-wrap w-full gap-2.5" *ngIf="(tasksPaginatedDocs$ | async) as tasks">
        <app-task-card
          *ngFor="let task of tasks"
          [task]="task"
        />
      </div>
    </div>
  `,
  styles: [
  ]
})
export default class TasksComponent {
  store: Store<AppState> = inject(Store);
  dialog = inject(MatDialog);
  subject = new Subject();

  tasksPaginatedDocs$ = this.store.select(getTasksPaginatedDocs)

  filtersLabels = signal(
    mapTaskStepType.map(ts => ({
      label: ts.label,
      isSelected: false
    }))
  );

  filters: Query<TaskFilter> = {
    query: {},
    options: {
      populate: "taskSteps.user setup.inspection setup.customer",
      limit: 20,
      page: 1,
      sort: [{ createdAt: "asc" }]
    }
  };

  selectTaskStepTypeFilter(label: string) {
    this.filtersLabels.set(
      this.filtersLabels().map(elem =>
        elem.label === label ? { ...elem, isSelected: !elem.isSelected } : elem
      )
    );
  }

  get taskStepTypeFilter() {
    return mapTaskStepType
      .filter(ts => this.filtersLabels().some(elem => elem.label === ts.label && elem.isSelected))
      .map(ts => ts.value);
  }

  constructor() {
    effect(() => {
      this.filters = {
        ...this.filters,
        query: {
          ...this.filters.query,
          currentStepType: [...this.taskStepTypeFilter],
          taskStatus: [TaskStepStatus.PENDING, TaskStepStatus.WORKING],
        }
      };

      this.store.dispatch(TasksActions.editTasksFilter({ filters: this.filters }));
    }, { allowSignalWrites: true });
  }

}
