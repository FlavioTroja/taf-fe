import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import * as ResourcesActions from "../actions/resources.actions";
import { Store } from "@ngrx/store";
import {getActiveResourceChanges, getResourceFilter} from "../selectors/resources.selector";
import { PartialResource } from "../../../../models/Resource";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import {ResourcesService} from "../../services/resources.service";


@Injectable({
  providedIn: 'root'
})
export class ResourcesEffects  {

  addResourceEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ResourcesActions.addResource),
    exhaustMap(({ resource }) => this.resourceService.addResource(resource)
      .pipe(
        concatMap((resource) => [
          ResourcesActions.addResourceSuccess({ resource }),
          RouterActions.go({ path: [`/resources/${resource.id}/view`] })
        ]),
        catchError((err) => of(ResourcesActions.addResourceFailed(err)))
      ))
  ));

  getResourceEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ResourcesActions.getResource),
    exhaustMap(({ id, params }) => this.resourceService.getResource(id, params)
      .pipe(
        map((resource) => ResourcesActions.getResourceSuccess({ current: resource })),
        catchError((err) => of(ResourcesActions.getResourceFailed(err)))
      ))
  ));

  getResourceFailedEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ResourcesActions.getResourceFailed),
    exhaustMap(() => [
      RouterActions.go({ path: ["/resources"] })
    ])
  ));

  editResourceEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ResourcesActions.editResource),
    concatLatestFrom(() => [
      this.store.select(getActiveResourceChanges)
    ]),
    // tap(res => console.log(res))
    exhaustMap(([_, changes]) => {
      if(isNaN(changes.id!)) {
        return of(ResourcesActions.addResource({ resource: changes as PartialResource }));
      }
      return this.resourceService.editResource(changes?.id!, changes as PartialResource)
        .pipe(
          concatMap((resource) => [
            // ResourcesActions.editResourceSuccess({ resource }),
            RouterActions.go({ path: ["/resources"] })
          ]),
          catchError((err) => of(ResourcesActions.editResourceFailed(err)))
        )
    })
  ));

  deleteResourceEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ResourcesActions.deleteResource),
    exhaustMap(({ id  }) => this.resourceService.deleteResource(id)
      .pipe(
        map((resource) => ResourcesActions.loadResources()),
        catchError((err) => of(ResourcesActions.editResourceFailed(err)))
      ))
  ));

  deleteResourceFromViewEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ResourcesActions.deleteResourceFromView),
    exhaustMap(({ id  }) => this.resourceService.deleteResource(id)
      .pipe(
        map((resource) => RouterActions.go({ path: ["resources"] })),
        catchError((err) => of(ResourcesActions.editResourceFailed(err)))
      ))
  ));

  loadResourceEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ResourcesActions.loadResources),
    concatLatestFrom(() => [
      this.store.select(getResourceFilter)
    ]),
    exhaustMap(([ _, query ]) => this.resourceService.loadResources(query!)
      .pipe(
        concatMap((resources) => [
          ResourcesActions.loadResourcesSuccess({ resources }),
          ResourcesActions.clearResourceActive()
        ]),
        catchError((err) => {
          return of(ResourcesActions.loadResourcesFailed(err));
        })
      ))
  ));

  editResourceFilterEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ResourcesActions.editResourceFilter),
    concatMap(({ filters }) => [
      ResourcesActions.editResourceFilterSuccess({ filters }),
      ResourcesActions.loadResources()
    ])
  ));

  manageNotificationResourcesErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      ResourcesActions.editResourceFailed,
      ResourcesActions.getResourceFailed,
      ResourcesActions.loadResourcesFailed,
      ResourcesActions.addResourceFailed,
      ResourcesActions.deleteResourceFailed
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.ERROR, message: err.error.reason?.message || "" } })
    ])
  ));

  constructor(private actions$: Actions,
              private resourceService: ResourcesService,
              private store: Store) {}
}
