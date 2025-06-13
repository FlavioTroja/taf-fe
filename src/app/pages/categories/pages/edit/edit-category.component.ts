import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from "../../../../components/input/input.component";
import { Store } from "@ngrx/store";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AppState } from "../../../../app.config";
import { Subject } from "rxjs";
import { Category, createCategoryPayload, PartialCategory } from "../../../../models/Category";
import { CategoriesService } from "../../services/categories.service";
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import * as CategoriesAction from "../../../categories/store/actions/categories.actions";
import { FileUploadComponent } from "../../../../components/upload-image/file-upload.component";
import { difference } from "../../../../../utils/utils";
import { getCurrentCategory } from "../../store/selectors/categories.selectors";
import { debounceTime, map, pairwise, takeUntil } from "rxjs/operators";
import { MatIconModule } from "@angular/material/icon";
import { ShowImageComponent } from "../../../../components/show-image/show-image.component";
import { MatDialogModule } from "@angular/material/dialog";

@Component({
  selector: 'app-edit-category',
  standalone: true,
  imports: [CommonModule, InputComponent, ReactiveFormsModule, FileUploadComponent, MatDialogModule,  MatIconModule, ShowImageComponent, MatAutocompleteModule],
  template: `
    <form [formGroup]="categoryForm">
      <div class="grid gap-3">
        <div class="text-2xl font-extrabold uppercase">informazioni generali</div>

        <div class="flex flex-row gap-4">
          <div class="flex flex-col basis-1/6">
            <div class="bg-foreground border-input rounded-md p-2">
              <app-file-upload label="immagine copertina" [mainImage]="f.image.value!" (onUpload)="onUploadGalleryImages($event)" (onDeleteMainImage)="onDeleteImage()" [onlyImages]="true"/>
            </div>
          </div>
          <div class="flex flex-col basis-10/12 justify-center gap-3">
            <app-input [formControl]="f.name" formControlName="name" label="nome" id="customer-name" type="text" />

            <div>
              <label class="text-md justify-left block px-3 py-0 font-medium">categoria padre (opzionale)</label>
              <input type="text"
                     class="focus:outline-none p-3 rounded-md w-full"
                     placeholder="Scegli la sua categoria padre"
                     matInput
                     formControlName="parentCategory"
                     [matAutocomplete]="autotwo"
                     >

              <mat-autocomplete #autotwo="matAutocomplete" [displayWith]="displayFn" (optionSelected)="onSelectionCategoryChange($event)">
                <mat-option [value]="-1" >NESSUNA CATEGORIA PADRE</mat-option>
                <mat-option *ngFor="let option of (categories$ | async)" [value]="option">
                  {{option.name}}
                </mat-option>
              </mat-autocomplete>
            </div>

          </div>
        </div>

      </div>
    </form>


<!--    LISTA   -->
    <div *ngIf="categoryForm.getRawValue().children?.length">
      <div>
        <div class="flex justify-between pt-5 pb-3">
          <div class="flex flex-col text-2xl font-extrabold">CATEGORIE FIGLIE</div>
          <div (click)="dissociatesAllChildCategories()" class="flex justify-center items-center px-2 rounded-full flex shadow-md default-shadow-hover font-bold text-lg bg-red-100 cursor-pointer">
            <mat-icon class="material-symbols-rounded-filled text-red-500">
              <span>link_off</span>
            </mat-icon>
            <div class="text-red-500">Scollega tutte</div>
          </div>
        </div>

        <div *ngFor="let child of categoryForm.getRawValue().children"
             class="flex flex-row w-full shadow-md bg-foreground text-gray-900 text-sm rounded-lg focus:outline-none block p-2.5 items-center mt-1">
          <div class="flex flex-col">
            <app-show-image classes="w-16 h-16" [imageUrl]="child.image || ''" [objectName]="child.name"/>
          </div>
          <div class="flex-auto px-6">
            <span class="font-bold pe-2">{{child.name}}</span>
          </div>
          <div class="flex flex-row-reverse gap-2 space-x-1 space-x-reverse">
            <button
              (click)="dissociatesChildCategory(child)"
              class="flex items-center p-2 text-orange-500 rounded-lg shadow-md default-shadow-hover error">
              <mat-icon class="align-to-center icon-size material-symbols-rounded">link_off</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>



  `,
  styles: [
  ]
})
export default class EditCategoryComponent implements OnInit, OnDestroy {

  store: Store<AppState> = inject(Store);
  subject = new Subject();

  fb = inject(FormBuilder);
  active$ = this.store.select(getCurrentCategory)
    .pipe(takeUntilDestroyed());

  categoriesService = inject(CategoriesService);

  id = toSignal(this.store.select(selectCustomRouteParam("id")));

  currentCategory: PartialCategory = {};

  categoryForm = this.fb.group({
    name: ["", Validators.required],
    image: [""],
    parentCategoryId: [-1],
    parentCategory: [""],
    children:[this.currentCategory.children || []]
  });

  initFormValue: PartialCategory = {};

  categories$ = this.categoriesService.loadAllCategories({ query: { }, options: { populate: "children" } });

  get f() {
    return this.categoryForm.controls;
  }

  get isNewCategory() {
    return this.id() === "new";
  }

  ngOnInit(): void {
    if(!this.isNewCategory) {

      this.store.dispatch(
        CategoriesAction.getCategory({ id: this.id() })
      );
    }

    this.active$
      .subscribe((value: Category | any) => {
        this.categoryForm.patchValue(value);
        this.initFormValue = this.categoryForm.value as PartialCategory;
        this.currentCategory = value;
    });

    this.f.parentCategory.valueChanges.pipe(
      debounceTime(200),
      takeUntil(this.subject),
    ).subscribe((textOrCategory: any) => {

      if((textOrCategory as Category | null)?.id) {
        return;
      }

      if(textOrCategory === -1) {
        this.categoryForm.patchValue({
          parentCategoryId: -1,
          parentCategory: ""
        });
        return;
      }

      this.categories$ = this.categoriesService.loadAllCategories(
        { query: {
            value: textOrCategory || ""
          }, options: {} });
    });

    this.editCategoryChanges();
  }

  editCategoryChanges() {
    this.categoryForm.valueChanges.pipe(
      pairwise(),
      map(([_, newState]) => {
        if(!Object.values(this.initFormValue).length && !this.isNewCategory) {
          return {};
        }
        const diff = {
          ...difference(this.initFormValue, newState),

          // Viene mandato sempre, eventualmente si potrebbe confrontare con quello relativo all'oggetto di partenza e capire se ci sono cambiamenti
          children: this.categoryForm.getRawValue().children?.map(c => c.id)
        };
        return createCategoryPayload(diff);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.categoryForm.invalid ? { ...changes, id: +this.id() } : {}),
      takeUntil(this.subject)
    ).subscribe(changes => this.store.dispatch(CategoriesAction.categoryActiveChanges({ changes })));
  }

  onUploadGalleryImages(image: string[]) {
    this.categoryForm.patchValue({
      image: image[0]
    });
  }

  onDeleteImage() {
    this.categoryForm.patchValue({
      image: ""
    });
  }

  displayFn(cat: PartialCategory): string {
    return cat && cat.name ? cat.name : "";
  }

  onSelectionCategoryChange(evt: MatAutocompleteSelectedEvent) {
    const parentCategory = evt?.option?.value;

    if(!parentCategory) {
      this.categoryForm.patchValue({ parentCategoryId: -1, parentCategory: "" });
      return;
    }

    this.categoryForm.patchValue({ parentCategoryId: parentCategory.id, parentCategory });
  }

  dissociatesChildCategory(category: Category) {
    const filtered = this.categoryForm.getRawValue().children!.filter(child => child.id !== category.id);
    this.categoryForm.patchValue({ children: filtered });
  }

  dissociatesAllChildCategories() {
    this.categoryForm.patchValue({ children: [] });
  }

  ngOnDestroy(): void {
    this.categoryForm.reset();

    this.store.dispatch(CategoriesAction.clearCategoryActive());
    this.store.dispatch(CategoriesAction.clearCategoryHttpError());
  }

}
