import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { filter, map, pairwise, startWith, Subject, takeUntil } from "rxjs";
import { difference } from "../../../../../utils/utils";
import { AppState } from "../../../../app.config";
import { InputComponent } from "../../../../components/input/input.component";
import { getRouterData, selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
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
        <div class="flex w-full flex-row gap-4">
          <div>
            <div class="flex gap-2">
              <app-file-upload
                [mainImage]="f.cover.value!"
                forImageService="MUNICIPAL_UPLOAD_COVER"
                [multiple]="false" label="Foto Cover"
                (onUpload)="onUploadCoverImage($event)"
                [onlyImages]="true"/>
            </div>
          </div>
          <div>
            <div class="flex gap-2">
              <app-file-upload
                [mainImage]="f.logo.value!"
                forImageService="MUNICIPAL_UPLOAD_LOGO"
                [multiple]="false" label="Foto Logo"
                (onUpload)="onUploadLogoImage($event)"
                [onlyImages]="true"/>
            </div>
          </div>
          <div>
            <div class="flex gap-2">
              <app-file-upload
                [mainImage]="f.icon.value!"
                forImageService="MUNICIPAL_UPLOAD_ICON"
                [multiple]="false" label="Foto Icona"
                (onUpload)="onUploadIconImage($event)"
                [onlyImages]="true"/>
            </div>
          </div>
        </div>
        <div class="flex gap-4 items-center">
          <app-input type="text" id="city" label="Città" formControlName="city" [formControl]="f.city"/>
          <app-input type="text" id="province" label="Provincia" formControlName="province" [formControl]="f.province"/>
        </div>
        <div class="flex gap-4 items-center">
          <app-input type="text" id="region" label="Regione" formControlName="region" [formControl]="f.region"/>
          <app-input type="text" id="domain" label="Dominio" formControlName="domain" [formControl]="f.domain"/>
        </div>
        <div class="flex flex-col basis-full">
          <label for="municipal-description" class="text-md justify-left block px-3 font-medium text-gray-900">
            Descrizione
          </label>
          <textarea
            class="focus:outline-none p-3 rounded-md w-full border-input h-32"
            id="municipal-description"
            formControlName="description">
          </textarea>
        </div>
      </div>
    </form>
  `
})
export default class EditMunicipalsComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  store: Store<AppState> = inject(Store)


  subject = new Subject();
  active$ = this.store.select(getActiveMunicipal)
  id = toSignal(this.store.select(selectCustomRouteParam('id')))
  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));

  initFormValue: PartialMunicipal = {}
  municipalForm = this.fb.group({
    city: this.fb.control({ value: '', disabled: this.viewOnly() }, Validators.required),
    province: this.fb.control({ value: '', disabled: this.viewOnly() }, Validators.required),
    region: this.fb.control({ value: '', disabled: this.viewOnly() }),
    domain: this.fb.control({ value: '', disabled: this.viewOnly() }),
    description: this.fb.control({ value: '', disabled: this.viewOnly() }),
    logo: this.fb.control({ value: '', disabled: this.viewOnly() }),
    icon: this.fb.control({ value: '', disabled: this.viewOnly() }),
    cover: this.fb.control({ value: '', disabled: this.viewOnly() }),
  });

  get f() {
    return this.municipalForm.controls;
  }

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
