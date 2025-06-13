import { inject, Injectable, signal } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../../../app.config";
import { NAVBAR_ACTION } from "../../../models/NavBar";
import * as RouterActions from "../../router/store/router.actions";
import * as WarehouseActions from "../../../pages/warehouses/store/actions/warehouses.actions";
import * as ProductActions from "../../../pages/products/store/actions/products.actions";
import * as UserActions from "../../../pages/users/store/actions/users.actions";
import * as SupplierActions from "../../../pages/suppliers/store/actions/suppliers.actions";
import * as CustomerActions from "../../../pages/customers/store/actions/customers.actions";
import * as CategoryActions from "../../../pages/categories/store/actions/categories.actions";
import * as CargoActions from "../../../pages/cargos/store/actions/cargos.actions"
import * as ResourceActions from "../../../pages/resources/store/actions/resources.actions"
import * as InspectionActions from "../../../pages/inspections/store/actions/inspections.actions"
import * as SetupDraftsActions from "../../../pages/drafts/store/actions/drafts.actions"
import { toSignal } from "@angular/core/rxjs-interop";
import { selectCustomRouteParam } from "../../router/store/router.selectors";

@Injectable({
  providedIn: 'root'
})
export class NavbuttonService {
  store: Store<AppState> = inject(Store);
  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  url = signal(document.location.href);

  navbarButtonActions = [
    {
      actionName: NAVBAR_ACTION.WAREHOUSE_SAVE,
      callback: () => this.store.dispatch(WarehouseActions.editWarehouse())
    },
    {
      actionName: NAVBAR_ACTION.PRODUCT_SAVE,
      callback: () => this.store.dispatch(ProductActions.editProduct())
    },
    {
      actionName: NAVBAR_ACTION.PRODUCT_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `products/${this.id()}` ] }))
    },
    {
      actionName: NAVBAR_ACTION.PRODUCT_DELETE,
      callback: () => this.store.dispatch(ProductActions.deleteProductFromView({ id: this.id() }))
    },
    {
      actionName: NAVBAR_ACTION.PRODUCT_NAVIGATE_ON_MOVE,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `cargos` ], extras: { queryParams: { productId: this.id() } } }))
    },
    {
      actionName: NAVBAR_ACTION.CARGO_CREATE_BLOCK,
      callback: () => this.store.dispatch(CargoActions.batchCargoCreate())
    },
    {
      actionName: NAVBAR_ACTION.SUPPLIER_SAVE,
      callback: () => this.store.dispatch(SupplierActions.editSupplier())
    },
    {
      actionName: NAVBAR_ACTION.SUPPLIER_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `suppliers/${this.id()}` ] }))
    },
    {
      actionName: NAVBAR_ACTION.CUSTOMER_SAVE,
      callback: () => this.store.dispatch(CustomerActions.editCustomer())
    },
    {
      actionName: NAVBAR_ACTION.CUSTOMER_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `customers/${this.id()}` ] }))
    },
    {
      actionName: NAVBAR_ACTION.RESOURCE_SAVE,
      callback: () => this.store.dispatch(ResourceActions.editResource())
    },
    {
      actionName: NAVBAR_ACTION.RESOURCE_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `resources/${this.id()}` ] }))
    },
    {
      actionName: NAVBAR_ACTION.INSPECTION_SAVE,
      callback: () => this.store.dispatch(InspectionActions.editSetup())
    },
    {
      actionName: NAVBAR_ACTION.INSPECTION_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `inspections/${this.id()}` ] }))
    },
    {
      actionName: NAVBAR_ACTION.INSPECTION_COMPLETE,
      callback: () => this.store.dispatch(InspectionActions.completeInspectionStatus({ id: this.id() }))
    },
    {
      actionName: NAVBAR_ACTION.DRAFT_SETUP_EDIT,
      callback: () => this.store.dispatch(SetupDraftsActions.editSetupDraft())
    },
    {
      actionName: NAVBAR_ACTION.CATEGORY_SAVE,
      callback: () => this.store.dispatch(CategoryActions.editCategory())
    },
    {
      actionName: NAVBAR_ACTION.CATEGORY_DELETE,
      callback: () => this.store.dispatch(CategoryActions.deleteCategoryFromEdit({ id: this.id() }))
    },
    {
      actionName: NAVBAR_ACTION.USER_SAVE,
      callback: () => this.store.dispatch(UserActions.editUser())
    },
    {
      actionName: NAVBAR_ACTION.USER_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `users/${this.id()}` ] }))
    },
    {
      actionName: NAVBAR_ACTION.HOME,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `/` ] }))
    },
    {
      actionName: NAVBAR_ACTION.DRAFT_NAVIGATE_ON_MODIFY,
      callback: () => this.store.dispatch(RouterActions.go({ path: [ `drafts/${this.id()}` ] }))
    },
  ];

  dispatchAction(action: string) {
    return this.navbarButtonActions.find(({ actionName }) => actionName === action)?.callback();
  }


}
