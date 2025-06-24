import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { DateTime } from "luxon";
import { filter, map, pairwise, Subject, takeUntil } from "rxjs";
import { difference } from "../../../../../utils/utils";
import { AppState } from "../../../../app.config";
import { InputComponent } from "../../../../components/input/input.component";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { PartialNews } from "../../../../models/News";
import * as NewsActions from "../../store/actions/news.actions";
import { getActiveNews } from "../../store/selectors/news.selectors";

@Component({
  selector: 'app-edit-news',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, InputComponent, MatIconModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule ],
  template: `
    <form [formGroup]="newsForm" autocomplete="off">
      <div class="flex flex-wrap gap-4">
        <app-input type="text" id="title" label="Titolo" formControlName="title" [formControl]="f.title"/>
        <app-input type="text" id="content" label="Contenuto" formControlName="content" [formControl]="f.content"/>
        <app-input type="text" id="author" label="Autore" formControlName="author" [formControl]="f.author"/>
        <div class="flex flex-col basis-1/4 relative">
          <mat-label>Data di nascita</mat-label>
          <input matInput [matDatepicker]="datePicker"
                 formControlName="publicationDate"
                 placeholder="gg/mm/yyyy"
                 class="focus:outline-none p-3 rounded-md w-full border-input">
          <mat-datepicker-toggle class="absolute end-0.5 top-6" matIconSuffix [for]="datePicker">
            <mat-icon class="material-symbols-rounded">event</mat-icon>
          </mat-datepicker-toggle>
          <mat-datepicker #datePicker></mat-datepicker>
        </div>
        <div class="flex w-full gap-2 items-end">
          <app-input type="text" id="tags" label="Tags" formControlName="newTag"
                     [formControl]="f.newTag"/>
          <div class="flex gap-2 text-1xl font-extrabold uppercase">
            <button type="button"
                    [ngClass]="{ 'disabled': f.tags.invalid }"
                    class="focus:outline-none p-2 mb-[6px] rounded-full w-full border-input bg-foreground flex items-center"
                    (click)="addTag()">
              <mat-icon class="align-to-center icon-size material-symbols-rounded">add</mat-icon>
            </button>
            <div class="flex gap-2 items-center">
              <div *ngFor="let tag of f.tags.value; index as i;"
                   class="whitespace-nowrap tag bg-gray-200 text-sm flex items-center self-center px-2 py-1 rounded">
                <div class="!font-normal">{{ tag }}</div>
                <mat-icon
                  (click)="deleteTag(i)"
                  class="align-to-center !hidden close-icon !text-[16px] !w-[16px] !h-[16px] material-symbols-rounded">
                  close
                </mat-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  `
})
export default class EditNewsComponent implements OnInit {
  fb = inject(FormBuilder);
  store: Store<AppState> = inject(Store)

  get f() {
    return this.newsForm.controls;
  }

  subject = new Subject();

  active$ = this.store.select(getActiveNews)

  initFormValue: PartialNews = {}
  newsForm = this.fb.group({
    title: [ '', Validators.required ],
    content: [ '' ],
    author: [ '' ],
    newTag: [ '' ],
    publicationDate: [ null ],
    tags: [ [ '' ] ]
  });

  id = toSignal(this.store.select(selectCustomRouteParam('id')))

  get isNewNews() {
    return this.id() === "new";
  }

  editNewsChanges() {
    this.newsForm.valueChanges.pipe(
      pairwise(),
      map(([ _, newState ]) => {
        if (!Object.values(this.initFormValue).length && !this.isNewNews) {
          return {};
        }
        const diff = {
          ...difference(this.initFormValue, newState),
          publicationDate: typeof newState.publicationDate! === "string" ? newState.publicationDate! : DateTime.fromJSDate(newState.publicationDate!).toISODate(),

        };
        return diff;
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.newsForm.invalid ? {
        ...changes,
        id: this.id()
      } : {}),
      takeUntil(this.subject),
      // tap(changes => console.log(changes)),
    ).subscribe((changes) => {
      this.store.dispatch(NewsActions.newsActiveChanges({ changes }));
    });
  }


  ngOnInit() {

    if (!this.isNewNews) {
      this.store.dispatch(NewsActions.getNews({ id: this.id() }))
    }

    this.active$.pipe(
      filter(() => this.id() !== 'new')
    ).subscribe((value: PartialNews | any) => {
      if (!value) {
        return
      }

      console.log('rere', value)
      this.initFormValue = value as PartialNews;

      this.newsForm.patchValue({
        ...value,
      });
    })

    this.editNewsChanges()

  }

  addTag() {
    const current: string[] = this.f.tags.value ?? [];
    if (this.f.newTag.value) {
      this.f.tags.setValue([ ...current, this.f.newTag.value ]);
    }
  }

  deleteTag(index: number) {
    this.f.tags.patchValue(this.f.tags.value?.filter((o, i) => i !== index) ?? [])
  }


}
