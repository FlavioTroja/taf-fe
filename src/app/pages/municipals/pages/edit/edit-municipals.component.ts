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

@Component({
  selector: 'app-edit-municipals',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, InputComponent ],
  template: `
    <form [formGroup]="municipalForm" autocomplete="off">
      <div class="flex gap-4">
        <app-input type="text" id="city" label="Città" formControlName="city" [formControl]="f.city"/>
        <app-input type="text" id="province" label="Provincia" formControlName="province" [formControl]="f.province"/>
        <app-input type="text" id="region" label="Regione" formControlName="region" [formControl]="f.region"/>
        <app-input type="text" id="domain" label="Dominio" formControlName="domain" [formControl]="f.domain"/>
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
    domain: [ '' ]
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
        if (!Object.values(this.initFormValue).length && !this.isNewMunicipal) {
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

    if (!this.isNewMunicipal) {
      this.store.dispatch(MunicipalActions.getMunicipal({ id: this.id() }))
    }

    this.active$.pipe(
      filter(() => this.id() !== 'new')
    ).subscribe((value: PartialMunicipal | any) => {
      if (!value) {
        return
      }

      this.initFormValue = value as PartialMunicipal;

      this.municipalForm.patchValue({
        ...value,
      }, { emitEvent: false });
    })

    this.editMunicipalChanges()

  }

  ngOnDestroy() {
    this.municipalForm.reset();

    this.store.dispatch(MunicipalActions.clearMunicipalActive())
  }

}
