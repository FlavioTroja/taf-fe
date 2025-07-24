import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, switchMap, take, throwError } from "rxjs";
import { Store } from "@ngrx/store";
import { AppState } from "../../../app.config";
import { getAccessToken } from "../store/auth.selectors";
import { HttpError } from "../../../models/Notification";
import * as AuthActions from "../store/auth.actions";

export function AuthInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const store: Store<AppState> = inject(Store);

  return store.select(getAccessToken).pipe(
    take(1),
    switchMap(token => {
      const cloneReq = !!token ? req.clone({
          setHeaders: {
            Authorization: token
          }
        }
      ) : req;
      return next(cloneReq).pipe(
        catchError((err: HttpErrorResponse) => {
          handleError(store, err);
          const obj = {
            error: {
              statusCode: err.status,
              statusText: err.statusText,
              error: err.error
            } as HttpError
          }
          if ( obj.error.error === "ZodError" ) {
            return throwError(() => ({ error: mapZodError(obj.error) }));
          }
          return throwError(() => obj);
        })
      );
    })
  );
}

function handleError(store: Store<AppState>, err: HttpErrorResponse) {
  if ( err.status === 401 ) {
    return store.dispatch(AuthActions.unauthorizedToken());
  }
  // if(err instanceof HttpErrorResponse) {
  //   switch (err.status) {
  //     case 401:
  //       return store.dispatch(RouterActions.go({ path: ["/auth/login"] }));
  //     default: return null;
  //   }
  // }
}

function mapZodError(error: HttpError) {
  const errorFields = error.error
    .map((i: any) => i.path)  // i.path è un array, di conseguenza il "reduce" riduce tutti gli array di array in un solo array di stringhe
    .reduce((acc: any, curr: any) => ([ ...acc, ...curr ]), []);

  return {
    ...error,
    reason: {
      message: `Valori non consentiti per i seguenti campi: ${ errorFields.join(", ") }`
    }
  };
}
