import { Action, createReducer, on } from "@ngrx/store";
import * as CargoActions from "../actions/cargos.actions";
import { CargoBulk } from "../../../../models/Cargo";

const initialState: Partial<CargoBulk> = {};

const activeBatchCargoReducer = createReducer(
  initialState,
  on(CargoActions.bulkCargoActiveChanges, (state, { changes }) => ({
    ...state,
    changes: changes
  })),
  on(CargoActions.bulkCargoSetItems, (state, { items }) => ({
    ...state,
    items: items
  })),
  on(CargoActions.bulkCargoAddItem, (state, { item}) => {
    return {
      ...state,
      items: [
        ...(state.items || []),
        item
      ]
    }
  }),
  on(CargoActions.bulkCargoRemoveItem, (state, { code }) => ({
    ...state,
    items: [
      ...(state.items || []).filter(p => p.code !== code)
    ]
  })),
  on(CargoActions.bulkCargoUpdateItemQuantity, (state, { code, newQta }) => ({
    ...state,
    items: [
      ...(state.items || []).map(p => {
        if(p.code === code) {

          return {
            ...p,
            quantity: newQta
          };
        }
        return p;
      })
    ]
  })),
  on(CargoActions.bulkCargoClearItems, (state) => ({
    ...state,
    items: []
  })),
);

export function reducer(state: Partial<CargoBulk> | undefined, action: Action) {
  return activeBatchCargoReducer(state, action);
}
