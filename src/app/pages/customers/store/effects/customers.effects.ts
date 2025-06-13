import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { CustomersService } from "../../services/customers.service";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import * as CustomersActions from "../actions/customers.actions";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { Store } from "@ngrx/store";
import { AddressOnCustomerSection, Customer } from "../../../../models/Customer";
import { getActiveCustomerChanges, getCustomerFilter } from "../selectors/customers.selectors";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import { AddressesService } from "../../../../services/addresses.service";

@Injectable({
  providedIn: 'root'
})
export class CustomersEffects  {

  addCustomerEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CustomersActions.addCustomer),
    exhaustMap(({ customer }) => this.customerService.addCustomer(customer)
      .pipe(
        concatMap((customer) => [
          CustomersActions.addCustomerSuccess({ customer }),
          RouterActions.go({ path: [`/customers`] })
        ]),
        catchError((err) => of(CustomersActions.addCustomerFailed(err)))
      ))
  ));

  getCustomerEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CustomersActions.getCustomer),
    exhaustMap(({ id }) => this.customerService.getCustomer(id)
      .pipe(
        map((customer) => CustomersActions.getCustomerSuccess({ current: customer })),
        catchError((err) => of(CustomersActions.getCustomerFailed(err)))
      ))
  ));

  getCustomerFailedEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CustomersActions.getCustomerFailed),
    exhaustMap(() => [
      RouterActions.go({ path: ["/customers"] })
    ])
  ));

  deleteCustomerEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CustomersActions.deleteCustomer),
    exhaustMap(({ id  }) => this.customerService.deleteCustomer(id)
      .pipe(
        map((customer) => CustomersActions.loadCustomers({ query: { query: {}, options: { limit: 10, page: 1 } } })),
        catchError((err) => of(CustomersActions.deleteCustomerFailed(err)))
      ))
  ));

  loadCustomerEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CustomersActions.loadCustomers),
    concatLatestFrom(() => [
      this.store.select(getCustomerFilter)
    ]),
    exhaustMap(([ _, query ]) => this.customerService.loadCustomers(query!)
      .pipe(
        concatMap((customers) => [
          CustomersActions.loadCustomersSuccess({ customers }),
          CustomersActions.clearCustomerActive()
        ]),
        catchError((err) => {
          return of(CustomersActions.loadCustomersFailed(err));
        })
      ))
  ));

  editCustomerEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CustomersActions.editCustomer),
    concatLatestFrom(() => [
      this.store.select(getActiveCustomerChanges)
    ]),
    exhaustMap(([_, changes]) => {
      if(isNaN(changes.id!)) {
        return of(CustomersActions.addCustomer({ customer: changes as Customer }));
      }
      return this.customerService.editCustomer(changes?.id!, changes as Customer)
        .pipe(
          concatMap((customer) => [
            CustomersActions.editCustomerSuccess({ customer }),
            RouterActions.go({ path: [`customers/${changes.id}/view`] })
          ]),
          catchError((err) => of(CustomersActions.editCustomerFailed(err)))
        )
    })
  ));

  getPlaceDetailEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CustomersActions.getPlaceDetail),
    exhaustMap(({ placeId }) => this.addressesService.getAddressDetail(placeId)
      .pipe(
        map((address) => {
          const { "formatted_address": remove, ...addressFixed } = address;
          return CustomersActions.addressFormActiveChanges({changes: {...addressFixed} as AddressOnCustomerSection})
        }),
      ))
  ));

  editCustomerFilterEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CustomersActions.editCustomerFilter),
    concatMap(({ filters }) => [
      CustomersActions.editCustomerFilterSuccess({ filters }),
      CustomersActions.loadCustomers({query: filters})
    ])
  ));

  manageNotificationCargosCustomersEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      CustomersActions.getCustomerFailed,
      CustomersActions.addCustomerFailed,
      CustomersActions.loadCustomersFailed,
      CustomersActions.deleteCustomerFailed,
      CustomersActions.editCustomerFailed
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({ notification: { type: NOTIFICATION_LISTENER_TYPE.ERROR, message: err.error.reason?.message || "" } })
    ])
  ));

  constructor(private actions$: Actions,
              private addressesService: AddressesService,
              private customerService: CustomersService,
              private store: Store) {}
}
