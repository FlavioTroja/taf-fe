import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, Signal } from '@angular/core';
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
import { debounceTime } from "rxjs/operators";
import { difference } from "../../../../../utils/utils";
import { AppState } from "../../../../app.config";
import { InputComponent } from "../../../../components/input/input.component";
import { FileUploadComponent } from "../../../../components/upload-image/file-upload.component";
import { getProfileMunicipalityId } from "../../../../core/profile/store/profile.selectors";
import { getRouterData, selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { Activity, PartialActivity } from "../../../../models/Activities";
import { createEventPayload, EVENT_TYPES, PartialEvent } from "../../../../models/Event";
import { ActivitiesService } from "../../../activities/services/activities.service";
import { loadActivities } from "../../../activities/store/actions/activities.actions";
import { getActivitiesPaginate } from "../../../activities/store/selectors/activities.selectors";
import * as EventsActions from "../../store/actions/events.actions";
import { getActiveEvent } from "../../store/selectors/events.selectors";

@Component({
  selector: 'app-edit-events',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, InputComponent, MatIconModule, MatDatepickerModule, MatFormFieldModule, MatDialogModule, MatNativeDateModule, MatOptionModule, MatSelectModule, MatAutocompleteModule, FileUploadComponent ],
  template: `
    <form [formGroup]="eventsForm" autocomplete="off">
      <div class="flex flex-col gap-4">
        <div class="flex basis-full items-center shrink-0 gap-4">
          <app-file-upload
            forImageService="EVENTS_UPLOAD_GALLERY"
            [images]="f.photos.getRawValue() ?? []"
            [multiple]="false" label="Galleria"
            (onUpload)="onUploadGalleryImages($event)" (onDeleteMainImage)="removeGalleryImage($event)"
            [onlyImages]="true"/>
          <app-file-upload
            forImageService="EVENTS_UPLOAD_COVER"
            [mainImage]="f.cover.value!" [multiple]="false" label="Foto Cover"
            (onUpload)="onUploadCoverImage($event)"
            [onlyImages]="true"/>
        </div>
        <div class="flex flex-col items-center gap-4">
          <div class="flex self-start items-center gap-4">
            <app-input type="text" id="title" label="Titolo" [formControl]="f.title"/>
            <app-input type="text" id="location" label="Luogo" [formControl]="f.location"/>
            <app-input type="text" id="organizer" label="Organizzatore" [formControl]="f.organizer"/>
          </div>
          <div class="flex self-start items-center gap-4">
            <app-input type="email" id="contactEmail" label="Email" [formControl]="f.contactEmail"/>
            <app-input type="text" id="contactPhone" label="Telefono" [formControl]="f.contactPhone"/>
            <app-input type="number" id="maxParticipants" label="Numero massimo partecipanti"
                       [formControl]="f.maxParticipants"/>
            <app-input type="number" id="currentParticipants" label="Totale partecipanti"
                       [formControl]="f.currentParticipants"/>
          </div>

          <div class="flex flex-col w-full basis-full">
            <label for="activity-description" class="text-md justify-left block px-3 font-medium text-gray-900">
              Descrizione
            </label>
            <textarea
              class="focus:outline-none p-3 rounded-md w-full border-input h-32"
              id="activity-description"
              formControlName="description">
          </textarea>
          </div>

          <div class="flex items-center justify-center w-full gap-4">
            <div class="flex basis-1/4 self-end">
              <div class="bg-foreground rounded-md p-3 w-full h-12 flex flex-row border-input justify-between">
                <div class="font-bold self-center text-lg">
                  Pubblico?
                </div>
                <div class="self-center">
                  <label class="switch">
                    <input type="checkbox" formControlName="isPublic">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
            <div class="flex basis-1/4 self-end">
              <div class="bg-foreground rounded-md p-3 w-full h-12 flex flex-row border-input justify-between">
                <div class="font-bold self-center text-lg">
                  Cancellato?
                </div>
                <div class="self-center">
                  <label class="switch">
                    <input type="checkbox" formControlName="isCancelled">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
            <div class="basis-1/4">
              <label class="text-md justify-left block px-3 py-0 font-medium">Tipo</label>
              <mat-select
                class="focus:outline-none p-3 border-input rounded-md w-full !font-bold bg-foreground"
                formControlName="type"
                placeholder="Seleziona"
              >
                <mat-option class="p-3 bg-white !italic">Nessun valore</mat-option>
                <mat-option class="p-3 bg-white" *ngFor="let type of EVENT_TYPES"
                            [value]="type.value">{{ type.label }}
                </mat-option>
              </mat-select>
            </div>
          </div>
          <div class="flex items-center gap-4 basis-full">
            <div class="flex flex-col basis-1/4 relative">
              <app-input type="datetime-local" id="startDateTime" label="Data di inizio evento"
                         [formControl]="f.startDateTime"></app-input>
            </div>

            <div class="flex flex-col basis-1/4 relative">
              <app-input type="datetime-local" id="endDateTime" label="Data di fine evento"
                         [formControl]="f.endDateTime"></app-input>
            </div>
            <div class="flex flex-col w-full lg:w-1/2">
              <label class="text-md justify-left block px-3 py-0 font-medium">Attività associata</label>
              <input
                [ngStyle]="viewOnly() ? {'cursor': 'pointer'} : {}"
                type="text"
                class="focus:outline-none p-3 rounded-md w-full border-input"
                placeholder="Scegli l'attività"
                matInput
                formControlName="activity"
                [matAutocomplete]="autotwo"
                [readonly]="viewOnly()"
              >

              <mat-autocomplete #autotwo="matAutocomplete" [displayWith]="displayActivity"
                                (optionSelected)="onActivitySelect($event)">
                <div *ngIf="(activities$ | async) as activities">
                  <mat-option *ngFor="let activity of activities.content" [value]="activity">
                    {{ activity.name }}
                  </mat-option>
                  <mat-option *ngIf="!activities.content?.length">Nessun risultato</mat-option>
                </div>
              </mat-autocomplete>
            </div>
          </div>
          <div class="flex w-1/2 self-center flex-col gap-4">
            <div class="flex items-center justify-between w-full">
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
            <div class="flex flex-col gap-2 w-full p-1 overflow-y-scroll h-96">
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
      </div>
    </form>
  `,
  styles: [ `
    .tag:hover .close-icon {
      display: block !important;
    }
  ` ]
})
export default class EditEventsComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  store: Store<AppState> = inject(Store);
  activitiesService = inject(ActivitiesService);

  get f() {
    return this.eventsForm.controls;
  }

  subject = new Subject();

  active$ = this.store.select(getActiveEvent);
  activities$ = this.store.select(getActivitiesPaginate)

  id = toSignal(this.store.select(selectCustomRouteParam('id')));
  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));

  municipalityId = this.store.selectSignal(getProfileMunicipalityId);


  initFormValue: PartialEvent = {};
  eventsForm = this.fb.group({
    title: this.fb.control({ value: '', disabled: this.viewOnly() }, Validators.required),
    description: this.fb.control({ value: '', disabled: this.viewOnly() }),
    type: this.fb.control({
      value: '',
      disabled: this.viewOnly()
    }, Validators.required),
    startDateTime: this.fb.control({ value: '', disabled: this.viewOnly() }, Validators.required),
    endDateTime: this.fb.control({ value: '', disabled: this.viewOnly() }),
    location: this.fb.control({ value: '', disabled: this.viewOnly() }),
    photos: this.fb.control<string[]>({ value: [], disabled: this.viewOnly() }),
    cover: this.fb.control({ value: '', disabled: this.viewOnly() }),
    organizer: this.fb.control({ value: '', disabled: this.viewOnly() }),
    contactEmail: this.fb.control({ value: '', disabled: this.viewOnly() }),
    contactPhone: this.fb.control({ value: '', disabled: this.viewOnly() }),
    tags: this.fb.array<string>([]),
    activity: this.fb.control<PartialActivity | null>({ value: null, disabled: this.viewOnly() }),
    maxParticipants: this.fb.control<number>({ value: 0, disabled: this.viewOnly() }, Validators.min(0)),
    currentParticipants: this.fb.control<number>({ value: 0, disabled: this.viewOnly() }, Validators.min(0)),
    isPublic: this.fb.control<boolean>({ value: false, disabled: this.viewOnly() }),
    isCancelled: this.fb.control<boolean>({ value: false, disabled: this.viewOnly() }),
    url: this.fb.control({ value: '', disabled: this.viewOnly() }),
    /*participants: this.fb.array<string>([]),
    checkInTimes: this.fb.control({ value: [], disabled: this.viewOnly() }),*/
  });

  displayActivity(customer: PartialActivity): string {
    return customer?.name ?? "";
  }

  onActivitySelect(event: any) {
    const activity = event.option.value as Activity | any;
    this.eventsForm.patchValue({ activity })
  }

  onUploadGalleryImages(images: string[]) {
    this.eventsForm.patchValue({ photos: images });
  }

  removeGalleryImage(photos: string[]) {
    this.eventsForm.patchValue({ photos });
  }

  onUploadCoverImage(cover: string[]) {
    this.eventsForm.patchValue({ cover: cover[0] })
  }

  get isNewEvent() {
    return this.id() === "new";
  }

  editEventChanges() {
    this.eventsForm.valueChanges.pipe(
      startWith(this.initFormValue),
      pairwise(),
      map(([ _, newState ]) => {
        if ( !Object.values(this.initFormValue).length && !this.isNewEvent ) {
          return {};
        }
        const diff = {
          ...difference(this.initFormValue, newState),
          municipalityId: this.municipalityId(),
          tags: newState.tags ?? undefined,
        };

        // console.log({ newState, diff, payload: createEventPayload(diff) })

        return createEventPayload(diff);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.eventsForm.invalid ? {
        ...changes,
      } : {}),
      takeUntil(this.subject),
    ).subscribe((changes) => {
      this.store.dispatch(EventsActions.eventActiveChanges({ changes }));
    });
  }


  ngOnInit() {

    if ( !this.isNewEvent ) {
      this.store.dispatch(EventsActions.getEvent({ id: this.id() }));
    }

    this.active$.pipe(
      filter(() => this.id() !== 'new'),
    ).subscribe((value) => {

      this.initFormValue = {
        ...value,
        cover: (value?.cover ? value?.cover + `?cd=${ Date.now() }` : undefined),
        activity: value?.activity ?? undefined,
      } as PartialEvent;

      this.eventsForm.patchValue({
        ...value,
        cover: (value?.cover ? value?.cover + `?cd=${ Date.now() }` : undefined),
        activity: value?.activity ?? null,
      }, { emitEvent: false });

      if ( value?.tags ) {
        const newTags = this.fb.array(
          value!.tags.map(tg =>
            this.fb.control(
              { value: tg, disabled: this.viewOnly() },
              Validators.required
            )
          )
        );

        this.eventsForm.setControl('tags', newTags, { emitEvent: false });
      }
    })

    this.f.activity.valueChanges
      .pipe(
        debounceTime(300),
      )
      .subscribe((value) => {

        if ( typeof value === 'string' ) {
          this.store.dispatch(loadActivities({
            query: {
              page: 0,
              limit: 10,
              search: value as string,
              filters: { municipalityId: this.municipalityId() }
            }
          }))
        }
      })

    this.editEventChanges();
  }

  addTag() {
    this.f.tags.push(this.fb.control({ value: '', disabled: this.viewOnly() }, Validators.required))
  }

  removeTag(index: number) {
    this.f.tags.removeAt(index);
  }

  ngOnDestroy() {
    this.eventsForm.reset();
    this.store.dispatch(EventsActions.clearEventActive());
  }

  protected readonly EVENT_TYPES = EVENT_TYPES;
}
