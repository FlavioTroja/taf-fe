import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { GoogleMapsModule } from "@angular/google-maps";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { Store } from "@ngrx/store";
import { map, pairwise, startWith, Subject, takeUntil } from "rxjs";
import { difference } from "../../../../../utils/utils";
import { AppState } from "../../../../app.config";
import { InputComponent } from "../../../../components/input/input.component";
import { FileUploadComponent } from "../../../../components/upload-image/file-upload.component";
import { getProfileMunicipalityId } from "../../../../core/profile/store/profile.selectors";
import { getRouterData, selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { ACTIVITY_TYPES, createActivityPayload, PartialActivity } from "../../../../models/Activities";
import { Roles } from "../../../../models/User";
import * as ActivityActions from "../../store/actions/activities.actions";
import { getActiveActivity } from "../../store/selectors/activities.selectors";
import { AutofocusDirective } from "../../../../shared/directives/autofocus.directive";

@Component({
  selector: 'app-edit-activities',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, InputComponent, MatIconModule, MatSelectModule, FileUploadComponent, MatDialogModule, GoogleMapsModule, AutofocusDirective ],
  template: `
    <form [formGroup]="activityForm" autocomplete="off">
      <div class="flex flex-wrap gap-4">
        <div class="flex w-full flex-row gap-4">
          <div class="flex gap-2">
            <app-file-upload
              [images]="f.photos.getRawValue() ?? []"
              forImageService="ACTIVITY_UPLOAD_GALLERY" [multiple]="false" label="Galleria"
              (onUpload)="onUploadGalleryImages($event)" (onDeleteMainImage)="removeGalleryImage($event)"
              [onlyImages]="true"/>
          </div>
          <div>
            <div class="flex gap-2">
              <app-file-upload
                [mainImage]="f.logo.value!"
                forImageService="ACTIVITY_UPLOAD_LOGO"
                [multiple]="false" label="Foto Logo"
                (onUpload)="onUploadLogoImage($event)"
                [onlyImages]="true"/>
            </div>
          </div>

          <div>
            <div class="flex gap-2">
              <app-file-upload
                [mainImage]="f.cover.value!"
                forImageService="ACTIVITY_UPLOAD_COVER"
                [multiple]="false" label="Foto Cover"
                (onUpload)="onUploadCoverImage($event)"
                [onlyImages]="true"/>
            </div>
          </div>
        </div>
        <app-input class="basis-[408px]" type="text" id="name" label="Nome" formControlName="name"
                   [formControl]="f.name"/>
        <app-input type="text" id="address" label="Indirizzo" formControlName="address" [formControl]="f.address"/>
        <app-input type="text" id="phone" label="Telefono" formControlName="phone" [formControl]="f.phone"/>
        <div class="flex w-full gap-2 items-end">
          <app-input type="time" id="newTime" label="Orari di Apertura" *ngIf="!viewOnly()"
                     [formControl]="f.newTime" formControlName="newTime"/>
          <div class="flex gap-2 text-1xl font-extrabold uppercase">
            <button type="button" *ngIf="!viewOnly()"
                    [ngClass]="{ 'disabled': !f.newTime.value }"
                    class="focus:outline-none p-2 mb-[6px] rounded-full w-full border-input bg-foreground flex items-center"
                    (click)="addTime()">
              <mat-icon class="align-to-center icon-size material-symbols-rounded">add</mat-icon>
            </button>
            <div class="flex gap-2 items-center">
              <div *ngIf="viewOnly()">Orari di Apertura:</div>
              <div *ngFor="let ctrl of f.openingHours.controls; index as i;"
                   [ngClass]="{'tag': !viewOnly() }"
                   class="whitespace-nowrap bg-gray-200 text-sm flex items-center self-center px-2 py-1 rounded">
                <div class="!font-normal">{{ ctrl.value }}</div>
                <mat-icon
                  (click)="deleteHour(i)"
                  class="align-to-center !hidden close-icon !text-[16px] !w-[16px] !h-[16px] material-symbols-rounded">
                  close
                </mat-icon>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col basis-full">
          <label for="activity-description" class="text-md justify-left block px-3 font-medium text-gray-900">
            Descrizione
          </label>
          <textarea
            class="focus:outline-none p-3 rounded-md w-full border-input h-32"
            id="activity-description"
            formControlName="description">
          </textarea>
        </div>
        <div class="flex gap-4 h-[450px] basis-full">
          <div class="flex flex-col h-full gap-1">
            <div class="px-3">Coordinate dell'attività</div>
            <google-map
              class="overflow-clip bg-foreground p-0.5 rounded-md"
              [height]="'400px'"
              [width]="'600px'"
              [center]="center"
              [zoom]="15"
              (mapClick)="onMapClick($event)">
              <map-marker
                [position]="marker.position">
              </map-marker>
            </google-map>
          </div>
          <div class="flex flex-col w-full h-full gap-4">
            <div class="flex gap-4">

              <app-input class="basis-2/3" type="text" id="website" label="Sito" formControlName="website"
                         [formControl]="f.website"/>
              <div class="basis-1/3">
                <label class="text-md justify-left block px-3 py-0 font-medium">Tipo</label>
                <mat-select
                  class="focus:outline-none p-3 border-input rounded-md w-full !font-bold bg-foreground"
                  formControlName="type"
                  placeholder="Seleziona"
                >
                  <mat-option class="p-3 bg-white !italic">Nessun valore</mat-option>
                  <mat-option class="p-3 bg-white" *ngFor="let type of ACTIVITY_TYPES"
                              [value]="type.value">{{ type.label }}
                  </mat-option>
                </mat-select>
              </div>
            </div>
            <div class="flex w-full basis-full flex-col gap-2">
              <div class="flex items-center justify-between">
                <div class="px-3">Tags</div>
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
              <div class="flex flex-col basis-1/2 gap-2 p-1 overflow-y-scroll h-full">
                <div *ngFor="let a of f.tags.controls; index as i" class="relative tag">
                  <app-input
                    [appAutofocus]="i === f.tags.length - 1"
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
export default class EditActivitiesComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  store: Store<AppState> = inject(Store);

  get f() {
    return this.activityForm.controls;
  }

  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));
  municipalityId = this.store.selectSignal(getProfileMunicipalityId);

  center: any;
  zoom = 6;
  marker: any = {};

  subject = new Subject();

  active$ = this.store.select(getActiveActivity)

  initFormValue: PartialActivity = {}
  activityForm = this.fb.group({
    name: this.fb.control({ value: '', disabled: this.viewOnly() }, Validators.required),
    address: this.fb.control({ value: '', disabled: this.viewOnly() }),
    phone: this.fb.control({ value: '', disabled: this.viewOnly() }),
    photos: this.fb.control<string[]>({ value: [], disabled: this.viewOnly() }),
    cover: this.fb.control({ value: '', disabled: this.viewOnly() }),
    latitude: this.fb.control({
      value: 41.9028,
      disabled: this.viewOnly()
    }, [ Validators.min(-90), Validators.max(90) ]),
    longitude: this.fb.control({
      value: 12.4964,
      disabled: this.viewOnly()
    }, [ Validators.min(-180), Validators.max(180) ]),
    logo: this.fb.control({ value: '', disabled: this.viewOnly() }),
    openingHours: this.fb.array<string>([]),
    newTime: this.fb.control({ value: '', disabled: this.viewOnly() }),
    website: this.fb.control({ value: '', disabled: this.viewOnly() }),
    description: this.fb.control({ value: '', disabled: this.viewOnly() }),
    type: this.fb.control({ value: '', disabled: this.viewOnly() }),
    tags: this.fb.array<string>([]),
  });

  id = toSignal(this.store.select(selectCustomRouteParam('id')))

  get isNewActivity() {
    return this.id() === "new";
  }

  addTime() {
    if ( this.f.newTime.value ) {
      this.f.openingHours.push(this.fb.control(this.f.newTime.value));
    }
  }

  addTag() {
    this.f.tags.push(this.fb.control({ value: '', disabled: this.viewOnly() }, Validators.required))
  }

  removeTag(index: number) {
    this.f.tags.removeAt(index);
  }

  deleteHour(index: number) {
    this.f.openingHours.removeAt(index);
  }

  editActivityChanges() {
    this.activityForm.valueChanges.pipe(
      startWith(this.initFormValue),
      pairwise(),
      map(([ _, newState ]) => {
        if ( !Object.values(this.initFormValue).length && !this.isNewActivity ) {
          return {};
        }

        const diff = {
          ...difference(this.initFormValue, newState),
          municipalityId: this.municipalityId(),
          openingHours: newState.openingHours ? newState.openingHours : undefined,
          tags: newState.tags ? newState.tags : undefined,
        };

        // console.log({ newState, diff, payload: createActivityPayload(diff) })

        return createActivityPayload(diff);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.activityForm.invalid ? {
        ...changes,
      } : {}),
      takeUntil(this.subject),
      // tap(changes => console.log(changes)),
    ).subscribe((changes) => {
      this.store.dispatch(ActivityActions.activityActiveChanges({ changes }));
    });
  }

  onMapClick(event: any) {

    if ( this.viewOnly() ) {
      return;
    }

    if ( event.latLng ) {
      const pos = event.latLng.toJSON();
      this.activityForm.patchValue({
        latitude: pos.lat,
        longitude: pos.lng
      });
      this.center = pos;
      this.marker = { position: pos };
    }
  }

  ngOnInit() {

    if ( !this.isNewActivity ) {
      this.store.dispatch(ActivityActions.getActivity({ id: this.id() }))
    }

    this.active$.pipe()
      .subscribe((value: PartialActivity | any) => {
        if ( !value ) {
          return
        }

        this.initFormValue = {
          ...value,
          cover: (value?.cover ? value?.cover + `?cd=${ Date.now() }` : undefined)
        } as PartialActivity;

        const latValid = typeof value?.latitude === 'number' && value?.latitude >= -90 && value?.latitude <= 90;
        const lngValid = typeof value?.longitude === 'number' && value?.longitude >= -180 && value?.longitude <= 180;

        if ( latValid && lngValid ) {
          this.center = { lat: value?.latitude, lng: value?.longitude };
        } else {
          this.center = { lat: this.activityForm.value.latitude ?? 0, lng: this.activityForm.value.longitude ?? 0 };
        }

        this.marker = { position: this.center };

        // console.log(this.initFormValue);

        this.activityForm.patchValue({
          ...value,
          cover: (value?.cover ? value?.cover + `?cd=${ Date.now() }` : undefined)
        }, { emitEvent: false });

        if ( value?.tags ) {
          const newTags: FormArray = this.fb.array(
            value!.tags.map((tg: string) =>
              this.fb.control(
                { value: tg, disabled: this.viewOnly() },
                Validators.required
              )
            )
          );

          this.activityForm.setControl('tags', newTags, { emitEvent: false });
        }


        if ( value?.openingHours ) {
          const newOpeningHours: FormArray = this.fb.array(
            value!.openingHours.map((oh: string) =>
              this.fb.control(
                { value: oh, disabled: this.viewOnly() },
                Validators.required
              )
            )
          );

          this.activityForm.setControl('openingHours', newOpeningHours, { emitEvent: false });
        }
      })

    this.editActivityChanges()
  }

  onUploadLogoImage(images: string[]) {
    this.activityForm.patchValue({ logo: images[0] });

  }

  onUploadCoverImage(images: string[]) {
    this.activityForm.patchValue({ cover: images[0] });
  }

  onUploadGalleryImages(images: string[]) {
    this.activityForm.patchValue({ photos: images });
  }

  removeGalleryImage(photos: string[]) {
    this.activityForm.patchValue({ photos });
  }

  ngOnDestroy(): void {
    this.activityForm.reset();

    this.store.dispatch(ActivityActions.clearActivityActive())
  }

  protected readonly ACTIVITY_TYPES = ACTIVITY_TYPES;
  protected readonly Roles = Roles;
}
