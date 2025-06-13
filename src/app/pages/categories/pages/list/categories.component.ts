import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from "../../../../components/search/search.component";
import { TableComponent } from "../../../../components/table/table.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { Sort, Table } from "../../../../models/Table";
import { Category, CategoryFilter } from "../../../../models/Category";
import { FormControl } from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import * as CategoryActions from "../../../categories/store/actions/categories.actions";
import { createSortArray } from "../../../../../utils/utils";
import { getCategoriesPaginate } from "../../store/selectors/categories.selectors";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { FilterElement } from "../../../../models/Filters";
import { Query } from "../../../../../global";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [ CommonModule, SearchComponent, TableComponent, MatDialogModule, MatIconModule, MatTooltipModule ],
  template: `
    <div class="grid gap-3">

      <div class="flex justify-between gap-2">

        <div [ngStyle]="{'background-color': expandFilter ? '#F2F2F2' : '#FFFFFF'}"
             matTooltip="Filtri categorie"
             class="w-10 rounded-md aspect-square flex font-bold shadow-md bg-foreground text-gray-900 text-sm focus:outline-none p-2 opacity-50">
          <mat-icon *ngIf="!expandFilter" class="material-symbols-rounded">filter_list</mat-icon>
          <mat-icon *ngIf="expandFilter" class="material-symbols-rounded">close</mat-icon>
        </div>
        <div class="grow">
          <app-search [search]="search"/>
        </div>
      </div>

      <div class="flex gap-2" *ngIf="categoryPaginate$ | async as categoryPaginate">
        <div class="flex flex-wrap gap-3.5">
          <ng-container *ngFor="let category of categoryPaginate.docs; let i = index">
            <div (click)="navigateToUrl(category)"
                 class="flex flex-col h-40 w-full sm:w-60 bg-white p-2 rounded-lg text-center cursor-pointer aspect-square hover:bg-gray-100 bg-cover bg-no-repeat bg-center justify-between default-shadow-hover"
                 [style.background-image]="'url('+getImage(category)+')'">
              <div class="p-1.5 self-end bg-foreground rounded-lg shadow-md flex items-center"
                   (click)="navigateToEdit($event, category.id)">
                <mat-icon class="material-symbols-rounded !text-lg text-slate-400 items-center justify-center !flex">
                  edit_square
                </mat-icon>
              </div>
              <p class="font-bold text-white drop-shadow">{{category.name}}</p>
            </div>
          </ng-container>
        </div>
      </div>
    </div>

  `,
  styles: [`
  .category-box {
    width: 14.5rem;
    height: 10rem;
  }
  `]
})
export default class CategoriesComponent {
  store: Store<AppState> = inject(Store);
  categoryPaginate$ = this.store.select(getCategoriesPaginate);
  dialog = inject(MatDialog);

  paginator: WritableSignal<Table> = signal({
    pageIndex: 0,
    pageSize: 40
  });

  sorter: WritableSignal<Sort[]> = signal([{ active: "createdAt", direction: "desc" }]);

  id = toSignal(this.store.select(selectCustomRouteParam("id")));

  search = new FormControl("");
  searchText = toSignal(this.search.valueChanges.pipe(
    debounceTime(250),
    distinctUntilChanged(),
  ));

  expandFilter: boolean = false;
  filterTabs: FilterElement[] = [];

  filters: Query<CategoryFilter> = {
    query: {},
    options: {
      populate: "children",
      limit: this.paginator().pageSize,
      page: (this.paginator().pageIndex + 1),
      sort: createSortArray(this.sorter()),
    }
  }

  constructor() {
    effect(() => {

      this.filters = {
        ...this.filters,
        query: {
          value: this.searchText() ? this.searchText()! : ""
        }
      };

      this.changePage(1);
    }, { allowSignalWrites: true });

    effect(() => {

      this.filters = {
        ...this.filters,
        options: {
          populate: this.filters.options?.populate,
          limit: this.paginator().pageSize,
          page: (this.paginator().pageIndex + 1),
          sort: createSortArray(this.sorter())
        }
      }

      this.store.dispatch(CategoryActions.editCategoryFilter({ filters: this.filters }));

    }, { allowSignalWrites: true });
  }

  changePage(evt: number) {
    this.paginator
      .update((curr) => ({ ...curr, pageIndex: evt - 1 }));
  }

  getImage(category: Category) {
    return !!category?.image ?
      category?.image :  `https://eu.ui-avatars.com/api/?name=${category.name.slice(0,2)}&size=112`
  }

  navigateToUrl(category: Category) {
    // if(category?.children!.length > 0) {}

    this.store.dispatch(RouterActions.go({
      path: [ `/products` ],
      extras: { queryParams: { categories: category.id } }
    }));
  }

  navigateToEdit(event: PointerEvent | any, categoryId: number) {
    event.stopPropagation();
    event.preventDefault();

    this.store.dispatch(RouterActions.go({
      path: [ `/categories/${categoryId}` ]
    }));
  }

}
