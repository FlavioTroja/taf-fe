import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import * as WarehousesActions from "../../store/actions/warehouses.actions";
import { getCurrentWarehouse } from "../../store/selectors/warehouses.selectors";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { PartialWarehouse } from "../../../../models/Warehouse";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { map, pairwise, Subject, takeUntil } from "rxjs";
import { difference } from "../../../../../utils/utils";
import { InputComponent } from "../../../../components/input/input.component";
import * as RouterActions from "../../../../core/router/store/router.actions";

@Component({
  selector: 'app-view-warehouse',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  template: `
    <form [formGroup]="wareHouseForm">
      <div class="flex flex-row space-x-2">
        <div class="flex flex-col basis-1/2">
          <app-input [formControl]="f.name" formControlName="name" label="nome" id="warehouse-name" type="text" />
        </div>

        <div class="flex flex-col basis-1/2">
          <app-input [formControl]="f.address" formControlName="address" label="indirizzo" id="warehouse-address" type="text" />
        </div>
      </div>
    </form>
  `,
  styles: [
  ]
})
export default class EditWarehouseComponent implements OnInit, AfterViewInit, OnDestroy {

  store: Store<AppState> = inject(Store);
  subject = new Subject();

  active$ = this.store.select(getCurrentWarehouse)
    .pipe(takeUntilDestroyed());
  fb = inject(FormBuilder);

  id = toSignal(this.store.select(selectCustomRouteParam("id")));

  wareHouseForm = this.fb.group({
    name: ["", Validators.required],
    address: ["", Validators.required]
  });

  initFormValue: PartialWarehouse = {};

  ngAfterViewInit(): void {
    if(isNaN(this.id())) {
      this.store.dispatch(RouterActions.go({ path: ["/404"] }))
    }
  }

  ngOnInit() {

    this.store.dispatch(
      WarehousesActions.getWarehouse({ id: this.id() })
    );

    this.active$
    .subscribe((value: PartialWarehouse | any) => {
      this.initFormValue = this.wareHouseForm.value as PartialWarehouse;

      this.wareHouseForm.patchValue(value);
      this.initFormValue = this.wareHouseForm.value as PartialWarehouse;
    });

    this.wareHouseForm.valueChanges.pipe(
      pairwise(),
      map(([_, newState]) => {
        return difference(this.initFormValue, newState);
      }),
      map(res => Object.keys(this.initFormValue).length !== 0 ? res : {}),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.wareHouseForm.invalid ? { ...changes, id: +this.id() } : {}),
      takeUntil(this.subject),
      // tap(changes => console.log(changes)),
    ).subscribe(changes => this.store.dispatch(WarehousesActions.warehouseActiveChanges({ changes })));
  }

  get f() {
    return this.wareHouseForm.controls;
  }

  ngOnDestroy(): void {
    this.wareHouseForm.reset();

    this.store.dispatch(WarehousesActions.clearWarehouseActive());
    this.store.dispatch(WarehousesActions.clearWarehouseHttpError());
  }
}
