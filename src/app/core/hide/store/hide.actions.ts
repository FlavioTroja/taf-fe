import { createAction, props } from "@ngrx/store";

export const getOwn = createAction("[Hide] get user's hidden components");

export const ownSuccessful = createAction("[Hide] save user's hidden components config", props<{ sections: string[] }>());

