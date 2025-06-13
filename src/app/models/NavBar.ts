import { MemoizedSelector } from "@ngrx/store";
import { ModalButton } from "./Button";
import { TooltipOpts } from "../../global";

export enum NAVBAR_ACTION {

  HOME = "HOME",

  USERS_CREATE = "USERS_CREATE",
  USERS_EDIT = "USERS_EDIT",
  USERS_DELETE = "USERS_DELETE",

  // Warehouse section
  WAREHOUSE_SAVE = "WAREHOUSE_SAVE",

  // Product section
  PRODUCT_SAVE= "PRODUCT_SAVE",
  PRODUCT_NAVIGATE_ON_MODIFY = "PRODUCT_NAVIGATE_ON_MODIFY",
  PRODUCT_NAVIGATE_ON_MOVE = "PRODUCT_NAVIGATE_ON_MOVE",
  PRODUCT_DELETE = "PRODUCT_DELETE",

  // Supplier section
  SUPPLIER_SAVE= "SUPPLIER_SAVE",
  SUPPLIER_NAVIGATE_ON_MODIFY = "SUPPLIER_NAVIGATE_ON_MODIFY",

  // Customer section
  CUSTOMER_SAVE= "CUSTOMER_SAVE",
  CUSTOMER_NAVIGATE_ON_MODIFY = "CUSTOMER_NAVIGATE_ON_MODIFY",

  // Category section
  CATEGORY_SAVE= "CATEGORY_SAVE",
  CATEGORY_DELETE = "CATEGORY_DELETE",

  // Users section
  USER_SAVE = "USER_SAVE",
  USER_NAVIGATE_ON_MODIFY = "USER_NAVIGATE_ON_MODIFY",

  //Cargo section
  CARGO_CREATE_BLOCK = "CARGO_CREATE_BLOCK",

  //Inspection section
  INSPECTION_SAVE = "INSPECTION_SAVE",
  INSPECTION_NAVIGATE_ON_MODIFY = "INSPECTION_SAVE_ON_MODIFY",
  INSPECTION_DELETE = "INSPECTION_DELETE",
  INSPECTION_COMPLETE = "INSPECTION_COMPLETE",

  //Resources section
  RESOURCE_SAVE = "RESOURCE_SAVE",
  RESOURCE_NAVIGATE_ON_MODIFY = "RESOURCE_NAVIGATE_ON_MODIFY",
  RESOURCE_DELETE = "RESOURCE_DELETE",

  //Setup Drafts section
  DRAFT_SETUP_EDIT = "DRAFT_SETUP_EDIT",
  DRAFT_NAVIGATE_ON_MODIFY = "DRAFT_NAVIGATE_ON_MODIFY",
}

export interface NavBarButton<T, Q> {
  label: string;
  iconName: string;
  action: string;
  navigate?: string;
  tooltipOpts?: TooltipOpts;
  dialog?: NavBarButtonDialog<T, Q>;
  selectors?: {
    hidden?: MemoizedSelector<T, Q>,
    disabled?: MemoizedSelector<T, Q>,
    isLoading?: MemoizedSelector<T, Q>,
  };
  roleSelector?: string;
}

export interface NavBarButtonDialog<T, Q> {
  title: string;
  content: MemoizedSelector<T, Q>;
  action: NAVBAR_ACTION;
  buttons?: ModalButton<T, Q>[];
}
