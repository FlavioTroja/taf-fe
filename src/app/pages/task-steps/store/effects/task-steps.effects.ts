import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import { Store } from "@ngrx/store";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import * as TaskStepsAction from "../actions/task-steps.actions";
import { TaskStepsService } from "../../services/task-steps.service";
import { getTaskStepsFilter } from "../selectors/task-steps.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";

@Injectable({
  providedIn: 'root'
})
export class TaskStepsEffects {

  editTaskStepsFilterEffect$ = createEffect(() => this.actions$.pipe(
    ofType(TaskStepsAction.editTaskStepsFilter),
    concatMap(({ filters }) => [
      TaskStepsAction.editTaskStepsFilterSuccess({ filters }),
      TaskStepsAction.loadTaskSteps({ filters })
    ])
  ));

  loadTaskStepsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(TaskStepsAction.loadTaskSteps),
    concatLatestFrom(() => [
      this.store.select(getTaskStepsFilter)
    ]),
    exhaustMap(([{ filters }]) => this.taskStepsService.loadTaskSteps(filters!)
      .pipe(
        concatMap((taskSteps) => [
          TaskStepsAction.loadTaskStepsSuccess({ taskSteps }),
        ]),
        catchError((err) => {
          return of(TaskStepsAction.loadTaskStepsFailed(err));
        })
      ))
  ));

  assignMeTaskStepEffect$ = createEffect(() => this.actions$.pipe(
    ofType(TaskStepsAction.assignMeTaskStep),
    exhaustMap(({ id }) => this.taskStepsService.assignMeTaskStep(id)
      .pipe(
        concatMap((taskStep) => [
          TaskStepsAction.assignMeTaskStepSuccess({ taskStep }),
          RouterActions.go({ path: [`task-steps/${id}/view`] }),
          UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.SUCCESS, message: `Mansione correttamente presa in carico` } }),
          TaskStepsAction.getTaskStep({ id: taskStep.id!, params: { populate: "task.setup.inspection task.taskSteps.user task.setup.customer user" } }),
          TaskStepsAction.getTaskStepSuccess({ current: taskStep }),
          // [/task-steps/${id}/view]
        ]),
        catchError((err) => {
          return of(TaskStepsAction.assignMeTaskStepFailed(err));
        })
      ))
  ));

  getTaskStepEffect$ = createEffect(() => this.actions$.pipe(
    ofType(TaskStepsAction.getTaskStep),
    exhaustMap(({id, params}) => this.taskStepsService.getTaskStep(id, params)
      .pipe(
        map((taskStep) => TaskStepsAction.getTaskStepSuccess({ current: taskStep })),
        catchError((err) => of(TaskStepsAction.getTaskStepFailed(err)))
      ))
  ));

  completeTaskStepEffect$ = createEffect(() => this.actions$.pipe(
    ofType(TaskStepsAction.completeTaskStep),
    exhaustMap(({ taskStepForm } ) =>(this.taskStepsService.completeTaskStep(taskStepForm))
      .pipe(
        concatMap((taskStep) => [
          TaskStepsAction.completeTaskStepSuccess({ taskStep }),
          RouterActions.go({ path: [`task-steps/${taskStep.id}/view`] }),
          UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.SUCCESS, message: `Mansione completata correttamente` } }),
          TaskStepsAction.getTaskStep({ id: taskStep.id!, params: { populate: "task.setup.inspection task.taskSteps.user task.setup.customer user" } }),
          TaskStepsAction.getTaskStepSuccess({ current: taskStep }),
          // [/task-steps/${id}/view]
        ]),
        catchError((err) => {
          return of(TaskStepsAction.completeTaskStepFailed(err));
        })
      ))
  ));

  manageNotificationTasksErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      TaskStepsAction.loadTaskStepsFailed,
      TaskStepsAction.assignMeTaskStepFailed,
      TaskStepsAction.completeTaskStepFailed
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.ERROR, message: err.error.reason?.message || "" } })
    ])
  ));

  constructor(private actions$: Actions,
              private taskStepsService: TaskStepsService,
              private store: Store) {}
}
