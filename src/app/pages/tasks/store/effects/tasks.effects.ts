import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { catchError, concatMap, exhaustMap, of } from "rxjs";
import { Store } from "@ngrx/store";
import * as TasksActions from "../actions/tasks.actions"
import { TasksService } from "../../services/tasks.service";
import { getTasksFilter } from "../selectors/tasks.selectors";

@Injectable({
  providedIn: 'root'
})
export class TasksEffects {

  editTasksFilterEffect$ = createEffect(() => this.actions$.pipe(
    ofType(TasksActions.editTasksFilter),
    concatMap(({ filters }) => [
      TasksActions.editTasksFilterSuccess({ filters }),
      TasksActions.loadTasks({ filters })
    ])
  ));

  loadTasksEffect$ = createEffect(() => this.actions$.pipe(
    ofType(TasksActions.loadTasks),
    concatLatestFrom(() => [
      this.store.select(getTasksFilter)
    ]),
    exhaustMap(([{ filters }]) => this.tasksService.loadTasks(filters!)
      .pipe(
        concatMap((tasks) => [
          TasksActions.loadTasksSuccess({ tasks }),
        ]),
        catchError((err) => {
          return of(TasksActions.loadTasksFailed(err));
        })
      ))
  ));

  // manageNotificationTasksErrorEffect$ = createEffect(() => this.actions$.pipe(
  //   ofType(...[
  //     /** manage errors notifications */
  //   ]),
  //   exhaustMap((err) => [
  //     UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.ERROR, message: err.error.reason?.message || "" } })
  //   ])
  // ));

  constructor(private actions$: Actions,
              private tasksService: TasksService,
              private store: Store) {}
}
