import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatNativeDateModule, MatOptionModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { Store } from "@ngrx/store";
import { filter, map, pairwise, startWith, Subject, takeUntil } from "rxjs";
import { difference } from "../../../../../utils/utils";
import { AppState } from "../../../../app.config";
import { InputComponent } from "../../../../components/input/input.component";
import { FileUploadComponent } from "../../../../components/upload-image/file-upload.component";
import { getProfileMunicipalityId } from "../../../../core/profile/store/profile.selectors";
import { getRouterData, selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { createNewsPayload, PartialNews } from "../../../../models/News";
import * as NewsActions from "../../store/actions/news.actions";
import { getActiveNews } from "../../store/selectors/news.selectors";

@Component({
  selector: 'app-edit-news',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, InputComponent, MatIconModule, MatDatepickerModule, MatFormFieldModule, MatDialogModule, MatNativeDateModule, MatOptionModule, MatSelectModule, MatAutocompleteModule, FileUploadComponent ],
  template: `
    <form [formGroup]="newsForm" autocomplete="off">
      <div class="flex flex-col gap-4">
        <div class="flex basis-full items-center shrink-0 gap-4">
          <app-file-upload
            forImageService="NEWS_UPLOAD_GALLERY"
            [images]="f.photos.getRawValue() ?? []"
            [multiple]="false" label="Galleria"
            (onUpload)="onUploadGalleryImages($event)" (onDeleteMainImage)="removeGalleryImage($event)"
            [onlyImages]="true"/>
          <app-file-upload
            forImageService="NEWS_UPLOAD_COVER"
            [mainImage]="f.cover.value!" [multiple]="false" label="Foto Cover"
            (onUpload)="onUploadCoverImage($event)"
            [onlyImages]="true"/>
        </div>
        <div class="flex items-center gap-4">
          <app-input type="text" id="title" label="Titolo" [formControl]="f.title"/>
          <app-input type="text" id="content" label="Contenuto" [formControl]="f.content"/>
          <app-input type="text" id="author" label="Autore" [formControl]="f.author"/>
          <div class="flex flex-col basis-1/4 relative">
            <app-input type="datetime-local" id="publicationDate" label="Data di Pubblicazione"
                       [formControl]="f.publicationDate"></app-input>
          </div>
        </div>
        <div class="flex w-full flex-col gap-2">
          <div class="flex items-center justify-between w-1/2">
            <div>Tags:</div>
            <div>
              <button type="submit"
                      [disabled]="viewOnly()"
                      (click)="addTag()"
                      [ngClass]="{ 'disabled': viewOnly() }"
                      class="focus:outline-none p-2 rounded-full w-full border-input bg-foreground flex items-center"
              >
                <mat-icon class="align-to-center icon-size material-symbols-rounded">add</mat-icon>
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-2 w-1/2 p-1 overflow-y-scroll h-96">
            <div *ngFor="let a of f.tags.controls; index as i" class="relative tag">
              <app-input
                type="text"
                id="tags"
                label=""
                [formControl]="a"
              />
              <button type="button" *ngIf="!viewOnly()" class="close-icon hidden absolute top-1/4 right-1"
                      (click)="removeTag(i)">
                <mat-icon class="align-to-center icon-size material-symbols-rounded">close</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  `,
  styles: [ `
    .tag:hover .close-icon {
      display: block !important;
    }
  ` ]
})
export default class EditNewsComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  store: Store<AppState> = inject(Store);

  get f() {
    return this.newsForm.controls;
  }

  subject = new Subject();

  active$ = this.store.select(getActiveNews);

  id = toSignal(this.store.select(selectCustomRouteParam('id')));
  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));
  municipalityId = this.store.selectSignal(getProfileMunicipalityId);

  initFormValue: PartialNews = {}
  newsForm = this.fb.group({
    title: this.fb.control({ value: '', disabled: this.viewOnly() }, Validators.required),
    content: this.fb.control({
      value: '',
      disabled: this.viewOnly()
    }, [ Validators.minLength(1), Validators.required ]),
    author: this.fb.control({ value: '', disabled: this.viewOnly() }),
    photos: this.fb.control<string[]>({ value: [], disabled: this.viewOnly() }),
    cover: this.fb.control({ value: '', disabled: this.viewOnly() }),
    tags: this.fb.array<string>([]),
    publicationDate: this.fb.control({ value: '', disabled: this.viewOnly() })
  });

  onUploadGalleryImages(images: string[]) {
    this.newsForm.patchValue({ photos: images });
  }

  removeGalleryImage(photos: string[]) {
    this.newsForm.patchValue({ photos });
  }

  onUploadCoverImage(cover: string[]) {
    this.newsForm.patchValue({ cover: cover[0] })
  }

  get isNewNews() {
    return this.id() === "new";
  }

  editNewsChanges() {
    this.newsForm.valueChanges.pipe(
      startWith(this.initFormValue),
      pairwise(),
      map(([ _, newState ]) => {
        if (!Object.values(this.initFormValue).length && !this.isNewNews) {
          return {};
        }
        const diff = {
          ...difference(this.initFormValue, newState),
          municipalityId: this.municipalityId(),
          tags: newState.tags ? newState.tags : undefined,
        };

        console.log({ newState, diff, payload: createNewsPayload(diff) })

        return createNewsPayload(diff);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.newsForm.invalid ? {
        ...changes,
      } : {}),
      takeUntil(this.subject),
      // tap(changes => console.log(changes)),
    ).subscribe((changes) => {
      this.store.dispatch(NewsActions.newsActiveChanges({ changes }));
    });
  }


  ngOnInit() {

    if (!this.isNewNews) {
      this.store.dispatch(NewsActions.getNews({ id: this.id() }));
    }

    this.active$.pipe(
      filter(() => this.id() !== 'new'),
    ).subscribe((value) => {

      this.initFormValue = {
        ...value,
        cover: (value?.cover ? value?.cover + `?cd=${ Date.now() }` : undefined)
      } as PartialNews;

      this.newsForm.patchValue({
        ...value, cover: (value?.cover ? value?.cover + `?cd=${ Date.now() }` : undefined)
      }, { emitEvent: false });

      if (value?.tags) {
        const newTags = this.fb.array(
          value!.tags.map(tg =>
            this.fb.control(
              { value: tg, disabled: this.viewOnly() },
              Validators.required
            )
          )
        );

        this.newsForm.setControl('tags', newTags, { emitEvent: false });
      }
    })
    this.editNewsChanges();
  }

  addTag() {
    this.f.tags.push(this.fb.control({ value: '', disabled: this.viewOnly() }, Validators.required))
  }

  removeTag(index: number) {
    this.f.tags.removeAt(index);
  }

  ngOnDestroy() {
    this.newsForm.reset();
    this.store.dispatch(NewsActions.clearNewsActive());
  }
}
