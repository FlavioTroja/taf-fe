import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { filter, map, pairwise, startWith, Subject, takeUntil } from "rxjs";
import { difference } from "../../../../../utils/utils";
import { AppState } from "../../../../app.config";
import { InputComponent } from "../../../../components/input/input.component";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { createMunicipalPayload, PartialMunicipal } from "../../../../models/Municipals";
import * as MunicipalActions from "../../store/actions/municipals.actions";
import { getActiveMunicipal } from "../../store/selectors/municipals.selectors";
import { FileUploadComponent } from "../../../../components/upload-image/file-upload.component";
import { MatDialogModule } from "@angular/material/dialog";

@Component({
  selector: 'app-edit-municipals',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, InputComponent, FileUploadComponent, MatDialogModule ],
  template: `
    <form [formGroup]="municipalForm" autocomplete="off">
      <div class="flex flex-col gap-4">
        <div class="flex w-full flex-row gap-4 p-2">
          <div>
            <div class="flex gap-2 basis-1/6">
              <app-file-upload
                class="h-[300px]"
                [mainImage]="f.logo.value!"
                forImageService="MUNICIPAL_UPLOAD_LOGO"
                [multiple]="false" label="Foto Logo"
                (onUpload)="onUploadLogoImage($event)"
                [onlyImages]="true"/>
            </div>
          </div>
          <div>
            <div class="flex gap-2 basis-1/6">
              <app-file-upload
                class="h-[300px]"
                [mainImage]="f.cover.value!"
                forImageService="MUNICIPAL_UPLOAD_COVER"
                [multiple]="false" label="Foto Cover"
                (onUpload)="onUploadCoverImage($event)"
                [onlyImages]="true"/>
            </div>
          </div>

          <div>
            <div class="flex gap-2 basis-1/6">
              <app-file-upload
                class="h-[300px]"
                [mainImage]="f.icon.value!"
                forImageService="MUNICIPAL_UPLOAD_ICON"
                [multiple]="false" label="Foto Icona"
                (onUpload)="onUploadIconImage($event)"
                [onlyImages]="true"/>
            </div>
          </div>
        </div>
        <div class="flex gap-3 items-center">
          <app-input type="text" id="city" label="Città" formControlName="city" [formControl]="f.city"/>
          <app-input type="text" id="province" label="Provincia" formControlName="province" [formControl]="f.province"/>
        </div>
        <div class="flex gap-3 items-center">
          <app-input type="text" id="region" label="Regione" formControlName="region" [formControl]="f.region"/>
          <app-input type="text" id="domain" label="Dominio" formControlName="domain" [formControl]="f.domain"/>
        </div>
        <app-input type="text" id="description" label="Descrizione" formControlName="description"
                   [formControl]="f.description"/>
      </div>
    </form>
  `
})
export default class EditMunicipalsComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  store: Store<AppState> = inject(Store)

  get f() {
    return this.municipalForm.controls;
  }

  subject = new Subject();

  active$ = this.store.select(getActiveMunicipal)

  initFormValue: PartialMunicipal = {}
  municipalForm = this.fb.group({
    city: [ '', Validators.required ],
    province: [ '', Validators.required ],
    region: [ '' ],
    domain: [ '' ],
    description: [ '' ],
    logo: this.fb.control(''),
    icon: this.fb.control(''),
    cover: this.fb.control(''),
  });
  id = toSignal(this.store.select(selectCustomRouteParam('id')))

  get isNewMunicipal() {
    return this.id() === "new";
  }

  editMunicipalChanges() {
    this.municipalForm.valueChanges.pipe(
      startWith(this.initFormValue),
      pairwise(),
      map(([ _, newState ]) => {
        if ( !Object.values(this.initFormValue).length && !this.isNewMunicipal ) {
          return {};
        }

        const diff = {
          ...difference(this.initFormValue, newState),

        };

        return createMunicipalPayload(diff);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.municipalForm.invalid ? {
        ...changes,
      } : {}),
      takeUntil(this.subject),
      // tap(changes => console.log(changes)),
    ).subscribe((changes) => {
      this.store.dispatch(MunicipalActions.municipalActiveChanges({ changes }));
    });
  }


  ngOnInit() {

    if ( !this.isNewMunicipal ) {
      this.store.dispatch(MunicipalActions.getMunicipal({ id: this.id() }))
    }

    this.active$.pipe(
      filter(() => this.id() !== 'new')
    ).subscribe((value: PartialMunicipal | any) => {
      if ( !value ) {
        return
      }

      this.initFormValue = value as PartialMunicipal;

      this.municipalForm.patchValue({
        ...value,
      }, { emitEvent: false });
    })

    this.editMunicipalChanges()

  }

  onUploadLogoImage(images: string[]) {
    this.municipalForm.patchValue({ logo: images[0] });

  }

  onUploadIconImage(images: string[]) {
    this.municipalForm.patchValue({ icon: images[0] });

  }

  onUploadCoverImage(images: string[]) {
    this.municipalForm.patchValue({ cover: images[0] });
  }

  ngOnDestroy() {
    this.municipalForm.reset();

    this.store.dispatch(MunicipalActions.clearMunicipalActive())
  }

}
