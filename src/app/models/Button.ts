import { MemoizedSelector } from "@ngrx/store";
import {TemplateRef} from "@angular/core";

export interface Button {
  label: string,
  iconName: string,
  bgColor?: string
}

export interface ModalButton<T, Q> extends Button {
  onClick: () => any  | void,
  valueToEmit?: boolean,
  selectors?: {
    disabled: MemoizedSelector<T, Q>,
  },
  extraContent?: TemplateRef<any>,
}
