import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { CategoriesService } from "../../services/categories.service";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";
import * as CategoriesActions from "../actions/categories.actions";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { Store } from "@ngrx/store";
import { Category } from "../../../../models/Category";
import { getActiveCategoryChanges, getCategoryFilter } from "../selectors/categories.selectors";


@Injectable({
  providedIn: 'root'
})
export class CategoriesEffects  {

  addCategoryEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CategoriesActions.addCategory),
    exhaustMap(({ category }) => this.categoryService.addCategory(category)
      .pipe(
        concatMap((category) => [
          CategoriesActions.addCategorySuccess({ category }),
          RouterActions.go({ path: [`/categories`] })
        ]),
        catchError((err) => of(CategoriesActions.addCategoryFailed(err)))
      ))
  ));

  getCategoryEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CategoriesActions.getCategory),
    exhaustMap(({ id }) => this.categoryService.getCategory(id)
      .pipe(
        map((category) => CategoriesActions.getCategorySuccess({ current: category })),
        catchError((err) => of(CategoriesActions.getCategoryFailed(err)))
      ))
  ));

  getCategoryFailedEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CategoriesActions.getCategoryFailed),
    exhaustMap(() => [
      RouterActions.go({ path: ["/categories"] })
    ])
  ));

  deleteCategoryEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CategoriesActions.deleteCategory),
    exhaustMap(({ id  }) => this.categoryService.deleteCategory(id)
      .pipe(
        map((category) => CategoriesActions.loadCategories()),
        catchError((err) => of(CategoriesActions.deleteCategoryFailed(err)))
      ))
  ));

  loadCategoryEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CategoriesActions.loadCategories),
    concatLatestFrom(() => [
      this.store.select(getCategoryFilter)
    ]),
    exhaustMap(([_, query]) => this.categoryService.loadCategories(query!)
      .pipe(
        concatMap((categories) => [
          CategoriesActions.loadCategoriesSuccess({ categories }),
          CategoriesActions.clearCategoryActive()
        ]),
        catchError((err) => {
          return of(CategoriesActions.loadCategoriesFailed(err));
        })
      ))
  ));

  editCategoryEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CategoriesActions.editCategory),
    concatLatestFrom(() => [
      this.store.select(getActiveCategoryChanges)
    ]),
    exhaustMap(([_, changes]) => {
      if(isNaN(changes.id!)) {
        return of(CategoriesActions.addCategory({ category: changes as Category }));
      }
      return this.categoryService.editCategory(changes?.id!, changes as Category)
        .pipe(
          concatMap((category) => [
            CategoriesActions.editCategorySuccess({ category }),
            RouterActions.go({ path: ["/categories"] })
          ]),
          catchError((err) => of(CategoriesActions.editCategoryFailed(err)))
        )
    })
  ));

  deleteCategoryFromEditEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CategoriesActions.deleteCategoryFromEdit),
    exhaustMap(({ id  }) => this.categoryService.deleteCategory(id)
      .pipe(
        map((product) => RouterActions.go({ path: ["categories"] })),
        catchError((err) => of(CategoriesActions.editCategoryFailed(err)))
      ))
  ));

  editCategoryFilterEffect$ = createEffect(() => this.actions$.pipe(
    ofType(CategoriesActions.editCategoryFilter),
    concatMap(({ filters }) => [
      CategoriesActions.editCategoryFilterSuccess({ filters }),
      CategoriesActions.loadCategories()
    ])
  ));

  constructor(private actions$: Actions,
              private categoryService: CategoriesService,
              private store: Store) {}
}
