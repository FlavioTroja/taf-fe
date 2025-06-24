import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Signal } from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { Store } from "@ngrx/store";
import { filter, map, pairwise, Subject, takeUntil } from "rxjs";
import { difference } from "../../../../../utils/utils";
import { AppState } from "../../../../app.config";
import { ImagesListComponent } from "../../../../components/image-list/image-list.component";
import { InputComponent } from "../../../../components/input/input.component";
import { FileUploadComponent } from "../../../../components/upload-image/file-upload.component";
import { FileService } from "../../../../components/upload-image/services/file.service";
import { getRouterData, selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { ACTIVITY_TYPES, createActivityPayload, PartialActivity } from "../../../../models/Activities";
import { Roles } from "../../../../models/User";
import * as ActivityActions from "../../store/actions/activities.actions";
import { getActiveActivity } from "../../store/selectors/activities.selectors";

@Component({
  selector: 'app-edit-activities',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, InputComponent, MatIconModule, MatSelectModule, FileUploadComponent, MatDialogModule, ImagesListComponent ],
  template: `
    <form [formGroup]="activityForm" autocomplete="off">
      <div class="flex flex-wrap gap-4">
        <div class="flex w-full flex-row gap-4 p-2">
          <div class="flex gap-2 basis-1/6">
            <app-images-list (setMainImage)="setMainImage($event)" [gallery]="f.photos.getRawValue() ?? []"
                             class="images-list-row-bkp"></app-images-list>
            <app-file-upload [ngClass]="{'pointer-events-none' : viewOnly()}"
                             class="h-[300px]"
                             forImageService="ACTIVITY_UPLOAD_GALLERY"
                             [mainImage]="mainGalleryImage" [multiple]="false" label="Galleria"
                             (onUpload)="onUploadGalleryImages($event)" (onDeleteMainImage)="removeGalleryImage()"
                             [onlyImages]="true"/>
          </div>

          <div *ngIf="!viewOnly() && activityForm.getRawValue().photos" class="flex flex-col basis-1/6 gap-2">
            <div class="flex flex-row">
              <div class="flex items-center p-2 rounded-lg shadow-md default-shadow-hover accent cursor-pointer"
                   (click)="input.click()">
                <mat-icon class="icon-size material-symbols-rounded">repeat</mat-icon>
                <input type="file"
                       #input
                       hidden
                       (change)="replaceImageInGallery($event)"
                       accept=".gif,.jpg,.jpeg,.png">
                Sostituisci
              </div>
            </div>
          </div>

          <div>
            <div class="flex gap-2 basis-1/6">
              <app-file-upload [ngClass]="{'pointer-events-none' : viewOnly()}"
                               class="h-[300px]"
                               forImageService="ACTIVITY_UPLOAD_LOGO"
                               [multiple]="false" label="Foto Logo"
                               (onUpload)="onUploadLogoImage($event)" (onDeleteMainImage)="removeLogoImage()"
                               [onlyImages]="true"/>
            </div>

            <div *ngIf="!viewOnly() && activityForm.getRawValue().photos" class="flex flex-col basis-1/6 gap-2">
              <div class="flex flex-row">
                <div class="flex items-center p-2 rounded-lg shadow-md default-shadow-hover accent cursor-pointer"
                     (click)="input.click()">
                  <mat-icon class="icon-size material-symbols-rounded">repeat</mat-icon>
                  <input type="file"
                         #input
                         hidden
                         (change)="replaceImageInGallery($event)"
                         accept=".gif,.jpg,.jpeg,.png">
                  Sostituisci
                </div>
              </div>
            </div>
          </div>

          <div>
            <div class="flex gap-2 basis-1/6">
              <app-file-upload [ngClass]="{'pointer-events-none' : viewOnly()}"
                               class="h-[300px]"
                               forImageService="ACTIVITY_UPLOAD_COVER"
                               [multiple]="false" label="Foto Cover"
                               (onUpload)="onUploadCoverImage($event)" (onDeleteMainImage)="removeCoverImage()"
                               [onlyImages]="true"/>
            </div>

            <div *ngIf="!viewOnly() && activityForm.getRawValue().photos" class="flex flex-col basis-1/6 gap-2">
              <div class="flex flex-row">
                <div class="flex items-center p-2 rounded-lg shadow-md default-shadow-hover accent cursor-pointer"
                     (click)="input.click()">
                  <mat-icon class="icon-size material-symbols-rounded">repeat</mat-icon>
                  <input type="file"
                         #input
                         hidden
                         (change)="replaceImageInGallery($event)"
                         accept=".gif,.jpg,.jpeg,.png">
                  Sostituisci
                </div>
              </div>
            </div>
          </div>
        </div>
        <app-input type="text" id="name" label="Nome" formControlName="name" [formControl]="f.name"/>
        <app-input type="text" id="address" label="Indirizzo" formControlName="address" [formControl]="f.address"/>
        <app-input type="text" id="phone" label="Telefono" formControlName="phone" [formControl]="f.phone"/>
        <app-input type="email" id="email" label="Email" formControlName="email" [formControl]="f.email"/>
        <div class="flex w-full gap-2 items-end">
          <app-input type="time" id="newTime" label="Orari di Apertura" *ngIf="!viewOnly()"
                     [formControl]="f.newTime" formControlName="newTime"/>
          <div class="flex gap-2 text-1xl font-extrabold uppercase">
            <button type="button" *ngIf="!viewOnly()"
                    [ngClass]="{ 'disabled': f.openingHours.invalid }"
                    class="focus:outline-none p-2 mb-[6px] rounded-full w-full border-input bg-foreground flex items-center"
                    (click)="addTime()">
              <mat-icon class="align-to-center icon-size material-symbols-rounded">add</mat-icon>
            </button>
            <div class="flex gap-2 items-center">
              <div *ngIf="viewOnly()">Orari di Apertura:</div>
              <ng-container *ngIf="!isNewActivity">
                <div *ngFor="let hour of f.openingHours.value; index as i;"
                     [ngClass]="{'tag': !viewOnly() }"
                     class="whitespace-nowrap bg-gray-200 text-sm flex items-center self-center px-2 py-1 rounded">
                  <div class="!font-normal">{{ hour }}</div>
                  <mat-icon
                    (click)="deleteHour(i)"
                    class="align-to-center !hidden close-icon !text-[16px] !w-[16px] !h-[16px] material-symbols-rounded">
                    close
                  </mat-icon>
                </div>
              </ng-container>
            </div>
          </div>
        </div>
        <app-input type="text" id="website" label="Sito" formControlName="website" [formControl]="f.website"/>
        <app-input type="text" id="description" label="Descrizione" formControlName="description"
                   [formControl]="f.description"/>
        <div class="basis-1/4">
          <label class="text-md justify-left block px-3 py-0 font-medium">Tipo</label>
          <mat-select
            class="focus:outline-none p-3 border-input rounded-md w-full !font-bold bg-foreground"
            formControlName="type"
            placeholder="Seleziona"
          >
            <mat-option class="p-3 bg-white !italic">Nessun valore</mat-option>
            <mat-option class="p-3 bg-white" *ngFor="let type of ACTIVITY_TYPES" [value]="type">{{ type }}
            </mat-option>
          </mat-select>
        </div>
        <div class="flex w-full gap-2 items-end">
          <app-input type="text" id="tags" label="Tags" *ngIf="!viewOnly()" formControlName="newTag"
                     [formControl]="f.newTag"/>
          <div class="flex gap-2 text-1xl font-extrabold uppercase">
            <button type="button" *ngIf="!viewOnly()"
                    [ngClass]="{ 'disabled': f.tags.invalid }"
                    class="focus:outline-none p-2 mb-[6px] rounded-full w-full border-input bg-foreground flex items-center"
                    (click)="addTag()">
              <mat-icon class="align-to-center icon-size material-symbols-rounded">add</mat-icon>
            </button>
            <div class="flex gap-2 items-center">
              <div *ngIf="viewOnly()">Tags:</div>
              <ng-container *ngIf="!isNewActivity">
                <div *ngFor="let tag of f.tags.value; index as i;"
                     [ngClass]="{'tag': !viewOnly() }"
                     class="whitespace-nowrap bg-gray-200 text-sm flex items-center self-center px-2 py-1 rounded">
                  <div class="!font-normal">{{ tag }}</div>
                  <mat-icon
                    (click)="deleteTag(i)"
                    class="align-to-center !hidden close-icon !text-[16px] !w-[16px] !h-[16px] material-symbols-rounded">
                    close
                  </mat-icon>
                </div>
              </ng-container>
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
export default class EditActivitiesComponent implements OnInit {
  fb = inject(FormBuilder);
  store: Store<AppState> = inject(Store);
  imageService = inject(FileService);
  mainGalleryImage = ''

  get f() {
    return this.activityForm.controls;
  }


  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));

  subject = new Subject();

  active$ = this.store.select(getActiveActivity)

  initFormValue: PartialActivity = {}
  activityForm = this.fb.group({
    name: [ { value: '', disabled: this.viewOnly() }, Validators.required ],
    address: [ { value: '', disabled: this.viewOnly() } ],
    phone: [ { value: '', disabled: this.viewOnly() } ],
    photos: [ { value: [ '' ], disabled: this.viewOnly() } ],
    cover: [ { value: '', disabled: this.viewOnly() } ],
    logo: [ { value: '', disabled: this.viewOnly() } ],
    email: [ { value: '', disabled: this.viewOnly() } ],
    openingHours: [ { value: [ '' ], disabled: this.viewOnly() } ],
    newTime: [ { value: '', disabled: this.viewOnly() } ],
    website: [ { value: '', disabled: this.viewOnly() } ],
    description: [ { value: '', disabled: this.viewOnly() } ],
    type: [ { value: '', disabled: this.viewOnly() } ],
    tags: [ { value: [ '' ], disabled: this.viewOnly() } ],
    newTag: [ { value: '', disabled: this.viewOnly() } ],
  });

  id = toSignal(this.store.select(selectCustomRouteParam('id')))

  get isNewActivity() {
    return this.id() === "new";
  }

  setMainImage(image: string) {
    this.mainGalleryImage = image;
  }

  addTime() {
    const current: string[] = this.f.openingHours.value ?? [];
    if (this.f.newTime.value) {
      this.f.openingHours.setValue([ ...current, this.f.newTime.value ]);
    }
  }

  addTag() {
    const current: string[] = this.f.tags.value ?? [];
    if (this.f.newTag.value) {
      this.f.tags.setValue([ ...current, this.f.newTag.value ]);
    }
  }

  editActivityChanges() {
    this.activityForm.valueChanges.pipe(
      pairwise(),
      map(([ prevValue, newState ]) => {
        if (!Object.values(this.initFormValue).length && !this.isNewActivity) {
          return {};
        }

        const diff = {
          ...difference(this.initFormValue, newState),
          openingHours: newState.openingHours ? newState.openingHours : undefined,
          tags: newState.tags ? newState.tags : undefined,
        };

        return createActivityPayload(diff);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.activityForm.invalid ? {
        ...changes,
        id: this.id()
      } : {}),
      takeUntil(this.subject),
      // tap(changes => console.log(changes)),
    ).subscribe((changes) => {
      this.store.dispatch(ActivityActions.activityActiveChanges({ changes }));
    });
  }


  ngOnInit() {

    if (!this.isNewActivity) {
      this.store.dispatch(ActivityActions.getActivity({ id: this.id() }))
    }

    this.active$.pipe(
      filter(() => this.id() !== 'new')
    ).subscribe((value: PartialActivity | any) => {
      if (!value) {
        return
      }

      this.initFormValue = value as PartialActivity;

      this.activityForm.patchValue({
        ...value,
      });
    })

    this.f.newTag.valueChanges
      .pipe(
        map((v) => v?.toUpperCase() ?? '')
      )
      .subscribe(upper => {
        if (this.f.newTag.value !== upper) {
          this.f.newTag.setValue(
            upper,
            { emitEvent: false }
          );
        }
      });

    this.editActivityChanges()
  }

  deleteHour(index: number) {
    this.f.openingHours.patchValue(this.f.openingHours.value?.filter((o, i) => i !== index) ?? [])
  }

  deleteTag(index: number) {
    this.f.tags.patchValue(this.f.tags.value?.filter((o, i) => i !== index) ?? [])
  }

  onUploadLogoImage(images: string[]) {
    this.activityForm.patchValue({ logo: images[0] });

  }

  removeLogoImage() {
    this.activityForm.patchValue({ logo: '' });

  }

  onUploadCoverImage(images: string[]) {
    this.activityForm.patchValue({ cover: images[0] });

  }

  removeCoverImage() {
    this.activityForm.patchValue({ cover: '' });
  }

  onUploadGalleryImages(images: string[]) {
    this.activityForm.patchValue({ photos: images });
  }

  removeGalleryImage() {
    this.activityForm.patchValue({ photos: [] });
  }

  replaceImageInGallery(event: any) {
    /*

     removeGalleryImage(id)

     const files: File[] = event.target.files;

     if (files.length === 0) {
       return;
     }
     of(files).pipe(
       mergeMap(r => r),
       map(file => {
         const formData = new FormData();
         formData.append("image", file, file.name);
         return formData;
       }),
       concatMap(formData => this.imageService.uploadGalleryImage(formData, this.id())),
       takeUntil(this.subject)
     ).subscribe(res => {
       this.activityForm.patchValue({ photos: [ ...this.f.photos.value, res.url] });
     });*/
  }

  protected readonly ACTIVITY_TYPES = ACTIVITY_TYPES;
  protected readonly Roles = Roles;
}
