import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as ConfigActions from "./hide.actions";
import { HiddenComponentsConfigService } from "../services/hiddenComponentsConfig.service";
import { exhaustMap, map } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HideEffects {
  constructor(private actions$: Actions,
              private hiddenComponentsConfigService: HiddenComponentsConfigService) {}

  getOwnEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ConfigActions.getOwn),
    exhaustMap(() => this.hiddenComponentsConfigService.getOwn().pipe(
      map(config => {

        const result: string[] = [];

        for (const firstKey in config) {
          const innerObject = config[firstKey];
          for (const secondKey in innerObject) {
            const values = innerObject[secondKey];
            values.forEach(value => {
              result.push(`${firstKey}.${secondKey}.${value}`);
            });
          }
        }

        return result.length ? result : [""];
      }),
      map((result) => ConfigActions.ownSuccessful({ sections: result })),
    ))
  ));

}
