import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import ViewDraftComponent from "../../../drafts/pages/view/view-draft.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { toSignal } from "@angular/core/rxjs-interop";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { getCurrentTaskStep } from "../../store/selectors/task-steps.selectors";
import * as TaskStepsActions from "../../store/actions/task-steps.actions";
import { TaskStepStatusBannerComponent } from "./components/task-step-status-banner.component";
import { TaskStepsProgressBarComponent } from "./components/task-steps-progress-bar.component";

@Component({
  selector: 'app-view-task-steps',
  standalone: true,
  imports: [CommonModule, ViewDraftComponent, TaskStepStatusBannerComponent, TaskStepsProgressBarComponent],
  template: `
    <div *ngIf="active() as taskStep" class="flex flex-col gap-2.5">
      <app-task-step-status-banner [taskStep]="taskStep"></app-task-step-status-banner>
      <ng-container *ngIf="taskStep.task?.title && taskStep.task?.description">
        <div class="text-xl font-extrabold uppercase">Informazioni sul Lavoro</div>
        <div class="flex flex-col bg-foreground default-shadow w-full rounded-md p-3 gap-2">
          <div class="font-extrabold whitespace-nowrap overflow-hidden text-ellipsis">
            {{ taskStep.task?.title }}
          </div>
          <div class="whitespace-nowrap overflow-hidden text-ellipsis">
            {{ taskStep.task?.description }}
          </div>
        </div>
      </ng-container>
      <ng-container>
        <app-task-steps-progress-bar [taskSteps]="taskStep.task?.taskSteps!"/>
      </ng-container>
      <app-view-draft *ngIf="taskStep.task?.setupId" [isForTaskStepsComponent]="true" [setupId]="taskStep.task?.setupId!"/>
    </div>
  `,
  styles: [
  ]
})
export default class ViewTaskStepsComponent implements OnInit{
  store: Store<AppState> = inject(Store);

  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  active = this.store.selectSignal(getCurrentTaskStep);

  viewOnly: boolean = window.location.pathname.includes("/view");

  ngOnInit() {
    this.store.dispatch(
      TaskStepsActions.getTaskStep({
        id: this.id(),
        params: { populate: "task.setup.inspection task.taskSteps.user task.setup.customer user" }
      })
    );
  }

}
