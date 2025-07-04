import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from "@ngrx/effects";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import * as ConfigActions from "../../hide/store/hide.actions";
import { ProfileService } from "../services/profile.service";
import * as ProfileAction from "./profile.actions";

@Injectable({
  providedIn: 'root'
})
export class ProfileEffects {
  constructor(private actions$: Actions,
              private profileService: ProfileService) {
  }

  document = inject(DOCUMENT);

  loadProfile$ = createEffect(() => this.actions$.pipe(
    ofType(ProfileAction.loadProfile),
    exhaustMap(() => this.profileService.load().pipe(
      concatMap((user) => [
        ProfileAction.loadProfileSuccess({ user: user }),
        ConfigActions.getOwn(),
      ]),
      catchError(() => of(ProfileAction.loadProfileFailed()))
    ))
  ));

  domainEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ROOT_EFFECTS_INIT),
    exhaustMap(() => [
      ProfileAction.getByDomain({ domain: this.document.location.hostname })
    ])
  ));

  getByDomainEffect$ = createEffect(() => this.actions$.pipe(
    ofType(ProfileAction.getByDomain),
    exhaustMap(({ domain }) => this.profileService.findByDomain(domain)
      .pipe(
        map(({ id }) => ProfileAction.getByDomainSuccess({ municipalityId: id }))
      )))
  )

  editProfile$ = createEffect(() => this.actions$.pipe(
    ofType(ProfileAction.editProfile),
    exhaustMap(({ user }) => this.profileService.edit(user).pipe(
      map((user) => ProfileAction.editProfileSuccess({ user })),
      catchError(() => of(ProfileAction.editProfileFailed()))
    ))
  ));

}
