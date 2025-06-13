import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import * as InspectionsActions from "../../../inspections/store/actions/inspections.actions";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { SetupsService } from "../../services/setups.service";
import {
  getActiveInspectionChanges,
  getAllInspectionsFilter, getCurrentInspection,
  getSelectiveInspectionFilter,
  getSetupChanges
} from "../selectors/inspections.selectors";
import { SetupCreate } from "../../../../models/Setup";
import { InspectionsService } from "../../services/inspections.service";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import { getProfileUser } from "../../../../core/profile/store/profile.selectors";
import { Roles } from "../../../../models/User";
import { hasRoles } from "../../../../../utils/utils";


@Injectable({
  providedIn: 'root'
})
export class InspectionsEffects {

  // SETUP EFFECTS

  addSetUpEffect$ = createEffect(() => this.actions$.pipe(
    ofType(InspectionsActions.addSetup),
    exhaustMap(({ setUp }) => this.setUpService.createSetup(setUp)
      .pipe(
        concatMap((setUp) => [
          InspectionsActions.addSetupSuccess({ setUp }),
          RouterActions.go({ path: [`/inspections/${setUp.inspection?.id}/view`] })
        ]),
        catchError((err) => of(InspectionsActions.addSetupFailed(err)))
      ))
  ));

  editSetUpPlanningEffect$ = createEffect(() => this.actions$.pipe(
    ofType(InspectionsActions.editSetupPlanning),
    exhaustMap(({ id, setUpPlanningDetails }) => this.setUpService.editPlanningSetup(id, setUpPlanningDetails)
      .pipe(
        concatMap((setUp) => [
          InspectionsActions.editSetupPlanningSuccess({ setUp }),
          RouterActions.go({ path: [`/inspections/${setUp?.inspection?.id}/view`] })
        ]),
        catchError((err) => of(InspectionsActions.editSetupPlanningFailed(err)))
      ))
  ));

  editInspectionDetailsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(InspectionsActions.editInspectionDetails),
    exhaustMap(({ id, inspectionDetails }) => this.inspectionsService.editInspectionDetails(id, inspectionDetails)
      .pipe(
        concatMap((inspection) => [
          InspectionsActions.editInspectionDetailsSuccess({ inspection }),
          RouterActions.go({ path: [`/inspections/${inspection.id}/view`] })
        ]),
        catchError((err) => of(InspectionsActions.editInspectionDetailsFailed(err)))
      ))
  ));


  /**FOR THE FUTURE SOULS
   *
   * this effect handles 2 forms, ergo 2 changes,
   * it does 3 things:
   *
   * 1) check if "associatedInspection.id" exists (if it doesn't exist an associated inspection it means it is a create and so does the create)
   *
   * 2) if "assoctiatedInspection.id" exists means that is an edit and so proceeds for the possible multiple edit:
   * 2.1) if there are activeChanges in "setupChanges" and the role is USER_PLANNER it proceeds with the edit of the setup
   * 2.2) if there are activeChanges in "inspectionChanges" and the role is USER_INSPECTOR it proceeds with the edit of the inspection
   *
   * 3) return the result of the possible 2 edit
   *
   * -AB
   */
  editSetUpEffect$ = createEffect(() => this.actions$.pipe(
    ofType(InspectionsActions.editSetup),
    concatLatestFrom(() => [
      this.store.select(getSetupChanges),
      this.store.select(getActiveInspectionChanges),
      this.store.select(getCurrentInspection),
      this.store.select(getProfileUser)
    ]),
    exhaustMap(([_, setupChanges, inspectionChanges, associatedInspection, user]) => {
      if(isNaN(associatedInspection?.id!)) {
        //DTO to create a new setup from inspections section
        const createSetUpDTO: SetupCreate = {
          isInspectionNeeded: setupChanges.isInspectionNeeded ?? true,
          description: setupChanges.description ?? "",
          customerId: setupChanges.customerId !== -1 ? setupChanges.customerId : undefined,
          customer: setupChanges.customerId === -1 ? setupChanges.customer : undefined,
          title: setupChanges.title!,
          addressId: setupChanges.addressId !== -1 ? setupChanges.addressId : undefined,
          address: setupChanges.addressId === -1 ? setupChanges.address : undefined,
          dueDate: setupChanges.dueDate?.toString(),
          attachments: setupChanges.attachments,
          inspectionDate: setupChanges.date?.toString()!,
          participants: setupChanges.participants?.every(u => !Object.keys(u.userId).length) ? [] : setupChanges.participants?.map(p => p.userId)
        };
        return of(InspectionsActions.addSetup({ setUp: createSetUpDTO as SetupCreate }));
      }

      const result = [];

      if(hasRoles(user, [{ role: Roles.USER_PLANNER }]) && !!Object.keys(setupChanges).length) {

        result.push(
          InspectionsActions.editSetupPlanning({ id: associatedInspection?.setupId!, setUpPlanningDetails: {
              address: setupChanges.addressId ? undefined : setupChanges.address,
              addressId: setupChanges.address?.id === -1 ? undefined : setupChanges.addressId,
              customer: setupChanges.customerId ? undefined : setupChanges.customer,
              customerId: setupChanges.customer?.id === -1 ? undefined : setupChanges.customerId,
              title: setupChanges.title!,
              inspectionDate: setupChanges.date!,
              dueDate: setupChanges.dueDate,
              description: setupChanges.description,
              attachments: setupChanges.attachments,
              participants: setupChanges.participants ?? [], // on planning update you have to return the kind of Participants, in order to update or delete
            }
          })
        );
      }

      if(hasRoles(user, [{ role: Roles.USER_INSPECTOR }]) && !!Object.keys(inspectionChanges).length) {
        result.push(
          InspectionsActions.editInspectionDetails({ id: associatedInspection?.id!, inspectionDetails: {
              description: inspectionChanges?.description ?? undefined,
              attachments: inspectionChanges.attachments,
            }
          })
        )
      }

      return result;
    })
  ));

  // INSPECTIONS EFFECTS

  loadAllInspectionsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(InspectionsActions.loadAllInspections),
    concatLatestFrom(() => [
      this.store.select(getAllInspectionsFilter)
    ]),
    exhaustMap(([ _, query ]) => this.inspectionsService.loadAllInspections(query!)
      .pipe(
        concatMap((inspections) => [
          InspectionsActions.loadAllInspectionsSuccess({ inspections }),
          InspectionsActions.clearInspectionActive()
        ]),
        catchError((err) => {
          return of(InspectionsActions.loadAllInspectionsFailed(err));
        })
      ))
  ));

  editInspectionFilterEffect$ = createEffect(() => this.actions$.pipe(
    ofType(InspectionsActions.editInspectionFilter),
    concatMap(({ filters }) => [
      InspectionsActions.editInspectionFilterSuccess({ filters }),
      InspectionsActions.loadAllInspections({query: filters})
    ])
  ));

  editSelectiveInspectionFilterEffect$ = createEffect(() => this.actions$.pipe(
    ofType(InspectionsActions.editSelectiveInspectionFilter),
    concatMap(({ filters }) => [
      InspectionsActions.editSelectiveInspectionFilterSuccess({ filters }),
      InspectionsActions.loadAllSelectiveInspections({query: filters})
    ])
  ));

  loadSelectiveInspectionsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(InspectionsActions.loadAllSelectiveInspections),
    concatLatestFrom(() => [
      this.store.select(getSelectiveInspectionFilter)
    ]),
    exhaustMap(([ _, query ]) => this.inspectionsService.loadAllInspections(query!)
      .pipe(
        concatMap((inspections) => [
          InspectionsActions.loadAllSelectiveInspectionsSuccess({ inspections }),
        ]),
        catchError((err) => {
          return of(InspectionsActions.loadAllSelectiveInspectionsFailed(err));
        })
      ))
  ));

  navigateOnInspectionCustomerEffect$ = createEffect(() => this.actions$.pipe(
    ofType(InspectionsActions.navigateOnInspectionCustomer),
    exhaustMap(({ id }) => [
      RouterActions.go({ path: [`/customers/${id}/view` ] })
    ])
  ));

  deleteInspectionEffect$ = createEffect(() => this.actions$.pipe(
    ofType(InspectionsActions.deleteInspection),
      concatLatestFrom(() => [ this.store.select(getSelectiveInspectionFilter) ]),
      exhaustMap(([{ id }, query]) => this.inspectionsService.deleteInspection(id)
          .pipe(
        concatMap( inspection => [
          InspectionsActions.loadAllInspections({ query: { query: {}, options: { limit: 10, page: 1 } } }),
          InspectionsActions.loadAllSelectiveInspections({ query }),
          InspectionsActions.deleteInspectionSuccess({ inspection })
        ]), catchError((err) => of(InspectionsActions.editInspectionFailed(err)))
      ))
  ));

  // editInspectionEffect$ = createEffect(() => this.actions$.pipe(
  //   ofType(InspectionsActions.editInspection),
  //   concatLatestFrom(() => [
  //     this.store.select(getActiveInspectionChanges)
  //   ]),
  //   exhaustMap(([_, changes]) => {
  //     return this.inspectionsService.editInspection(changes?.id!, changes as Inspection)
  //       .pipe(
  //         concatMap((inspection) => [
  //           InspectionsActions.editInspectionSuccess({ inspection }),
  //           RouterActions.go({ path: [`inspections/${changes.id}/view`] })
  //         ]),
  //         catchError((err) => of(InspectionsActions.editInspectionFailed(err)))
  //       )
  //   })
  // ));

  getInspectionEffect$ = createEffect(() => this.actions$.pipe(
    ofType(InspectionsActions.getInspection),
    exhaustMap(({ id }) => this.inspectionsService.getInspection(id, { populate: 'setup.customer.addresses setup.address setup.participants user' })
      .pipe(
        map((inspection) => InspectionsActions.getInspectionSuccess({ current: inspection })),
        catchError((err) => of(InspectionsActions.getInspectionFailed(err)))
      ))
  ));

  updateInspectionStatus$ = createEffect(() => this.actions$.pipe(
    ofType(InspectionsActions.updateInspectionStatus),
    exhaustMap(({ id, inspectionStatusPayload }) => this.inspectionsService.updateInspectionStatus(id, inspectionStatusPayload)
    .pipe(
      concatMap(_ => [
        InspectionsActions.updateInspectionStatusSuccess(),
        RouterActions.go({ path: [`inspections/${id}/view`] })
      ]),
      catchError((err) => of(InspectionsActions.updateInspectionStatusFailed(err)))
    ))
  ));

  completeInspectionStatusEffect$ = createEffect(() => this.actions$.pipe(
    ofType(InspectionsActions.completeInspectionStatus),
    exhaustMap(({ id }) => this.inspectionsService.completeInspectionStatus(id)
      .pipe(
        concatMap(_ => [
          InspectionsActions.completeInspectionStatusSuccess(),
          RouterActions.go({ path: [`inspections`] }),
          UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.SUCCESS, message: `Sopralluogo completato con successo` } })
        ]),
      )),
    catchError((err) => of(InspectionsActions.completeInspectionStatusFailed(err)))
  ))

  manageNotificationInspectionSetUpEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      InspectionsActions.addSetupFailed,
      InspectionsActions.editSetupFailed,
      InspectionsActions.loadAllInspectionsFailed,
      InspectionsActions.loadAllSelectiveInspectionsFailed,
      InspectionsActions.deleteInspectionFailed,
      InspectionsActions.editInspectionFailed,
      InspectionsActions.getInspectionFailed,
      InspectionsActions.updateInspectionStatusFailed,
      InspectionsActions.editInspectionDetailsFailed,
      InspectionsActions.editSetupPlanningFailed,
      InspectionsActions.completeInspectionStatusFailed
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.ERROR, message: err.error.reason?.message || "" } })
    ])
  ));

  constructor(private actions$: Actions,
              private setUpService: SetupsService,
              private inspectionsService: InspectionsService,
              private store: Store) {}
}
