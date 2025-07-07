import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import { AppState } from "../../../../app.config";
import { getProfileMunicipalityId } from "../../../../core/profile/store/profile.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import * as UIActions from "../../../../core/ui/store/ui.actions";
import { News } from "../../../../models/News";
import { NOTIFICATION_LISTENER_TYPE } from "../../../../models/Notification";
import { NewsService } from "../../services/news.service";
import * as NewsActions from "../actions/news.actions";
import { getActiveNewsChanges } from "../selectors/news.selectors";

@Injectable({
  providedIn: "root",
})
export class NewsEffects {

  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private newsService: NewsService,
  ) {
  }

  addNewsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(NewsActions.addNews),
    exhaustMap(({ news }) => this.newsService.addNews(news)
      .pipe(
        concatMap((news) => [
          NewsActions.addNewsSuccess({ news }),
          RouterActions.go({ path: [ '/news' ] })
        ]),
        catchError((error) => of(NewsActions.addNewsFailed({ error })))
      ))
  ))

  editNewsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(NewsActions.editNews),
    concatLatestFrom(() => [
      this.store.select(getActiveNewsChanges),
      this.store.select(selectCustomRouteParam("id"))
    ]),
    exhaustMap(([ _, changes, id ]) => {
      if ( id === 'new' ) {
        return of(NewsActions.addNews({
          news: {
            ...changes,
          }
        }));
      }
      return this.newsService.editNews(id, changes as News)
        .pipe(
          concatMap((news) => [
            NewsActions.editNewsSuccess({ news }),
            RouterActions.go({ path: [ "/news" ] })
          ]),
          catchError((err) => of(NewsActions.editNewsFailed(err)))
        )
    })
  ))

  deleteNewsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(NewsActions.deleteNews),
    concatLatestFrom(() => [
      this.store.select(getProfileMunicipalityId),
    ]),
    exhaustMap(([ { id }, municipalityId ]) => this.newsService.deleteNews(id)
      .pipe(
        map(() => NewsActions.loadPaginateNews({ query: { page: 0, limit: 10, filters: { municipalityId } } })),
        catchError((err) => of(NewsActions.deleteNewsFailed(err)))
      ))
  ))

  loadNewsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(NewsActions.loadPaginateNews),
    exhaustMap(({ query }) => this.newsService.loadNews(query)
      .pipe(
        concatMap((news) => [
          NewsActions.loadPaginateNewsSuccess({ news }),
          NewsActions.clearNewsActive()
        ]),
        catchError((error) => of(NewsActions.loadPaginateNewsFailed({ error })))
      ))
  ))

  getNewsEffect$ = createEffect(() => this.actions$.pipe(
    ofType(NewsActions.getNews),
    exhaustMap(({ id }) => this.newsService.getActiveNews(id)
      .pipe(
        concatMap((current) => [
          NewsActions.getNewsSuccess({ current })
        ]),
        catchError((error) => of(NewsActions.getNewsFailed({ error })))
      ))
  ))

  manageNotificationNewsErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(...[
      NewsActions.loadPaginateNewsFailed,
      NewsActions.getNewsFailed,
      NewsActions.addNewsFailed,
      NewsActions.editNewsFailed
    ]),
    exhaustMap((err) => [
      UIActions.setUiNotification({
        notification: {
          type: NOTIFICATION_LISTENER_TYPE.ERROR,
          message: err.error.error || ""
        }
      })
    ])
  ))
}
