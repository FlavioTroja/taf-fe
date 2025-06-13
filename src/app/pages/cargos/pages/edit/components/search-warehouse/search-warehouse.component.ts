import { Component, effect, EventEmitter, forwardRef, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators
} from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatOptionModule } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { Warehouse } from "../../../../../../models/Warehouse";
import { map, Subject, Subscription, takeUntil } from "rxjs";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../../app.config";
import { toSignal } from "@angular/core/rxjs-interop";
import { selectRouteQueryParamParam } from "../../../../../../core/router/store/router.selectors";
import { debounceTime } from "rxjs/operators";
import { WarehousesService } from "../../../../../warehouses/services/warehouses.service";

@Component({
  selector: 'app-search-warehouse',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatAutocompleteModule, MatOptionModule, ReactiveFormsModule, MatInputModule ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchWarehouseComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SearchWarehouseComponent),
      multi: true
    }
  ],
  template: `
    <div>
      <label class="text-md justify-left block px-3 py-0 font-medium">{{ inputLabel }}</label>
      <input type="text"
             class="focus:outline-none p-3 rounded-md w-full"
             [ngClass]="wareHouseIdField.invalid && wareHouseIdField?.dirty ? ('border-input-error') : ('border-input')"
             placeholder="Scegli magazzino"
             aria-label="Number"
             matInput
             [formControl]="formControl"
             [matAutocomplete]="autotwo">
      <mat-autocomplete #autotwo="matAutocomplete" [displayWith]="displayFn" (optionSelected)="selectionCurrentWarehouseChange($event)">
        <mat-option *ngFor="let option of currentWarehousesOptions" [value]="option"
                    [disabled]="option.id === fromWareHouseId">
          {{option.name}}
        </mat-option>
        <mat-option [disabled]="true" *ngIf="currentWarehousesOptions.length === 0">
          Magazzino non trovato
        </mat-option>
      </mat-autocomplete>
    </div>
  `,
  styles: [
  ]
})
export class SearchWarehouseComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy {
  @Input({ required: false }) inputLabel: string = 'magazzino'
  @Input({ required: true }) resetFormSubject: Subject<boolean> = new Subject<boolean>();
  @Input({ required: true }) wareHouseIdField!: FormControl | any;
  @Input({ required: false }) fromWareHouseId?: number;

  @Output() onSelectionCurrentWarehouseChange = new EventEmitter<any>;

  subscription!: Subscription;
  formControl: FormControl = new FormControl<Warehouse | any>("", {
    validators: [ Validators.required ],
    nonNullable: true
  });

  protected onTouched!: Function;
  subject: Subject<void> = new Subject();
  defaultFilterOptions = { page: 1, limit: 30 };

  warehousesService = inject(WarehousesService);
  store: Store<AppState> = inject(Store);
  private onChange!: Function;

  currentWarehousesOptions: Warehouse[] = [];
  allWarehouses: Warehouse[] = [];

  queryParams = toSignal(this.store.select(selectRouteQueryParamParam()));

  constructor() {
    effect(() => {
      if (!this.queryParams()) {
        return
      }

      const warehouseId = this.queryParams()!["warehouseId"];

      if (warehouseId) {
        this.warehousesService.getWarehouse(+warehouseId).pipe(
            takeUntil(this.subject)
        ).subscribe((currentWarehouse: Warehouse | any) => {
          /*If warehouse id inside query params, emit the event for setting the warehouse inside the parent form */
          this.onSelectionCurrentWarehouseChange.emit({ option: { value: currentWarehouse } });
          this.formControl.setValue(currentWarehouse);
        });
      }
    });
  }

  ngOnInit() {
    this.loadWareHouses();

    this.subscription = this.formControl.valueChanges
        .subscribe((textOrWarehouse) => {
          this.onChange && this.onChange(textOrWarehouse);
        })

    /* Subject for setting the warehouse field to default value */
    this.resetFormSubject.pipe(
        takeUntil(this.subject)
    ).subscribe(response => {
      if (response) {
        this.loadWareHouses();
        this.formControl.reset();
      }
    })

    /* Filter warehouses */
    this.formControl.valueChanges.pipe(
        debounceTime(250),
        takeUntil(this.subject)
    ).subscribe((textOrWarehouse) => {
      if ((textOrWarehouse as Warehouse | null)?.id) {
        this.currentWarehousesOptions = this.allWarehouses;
        return;
      }

      if (typeof textOrWarehouse === 'string') {
        this.currentWarehousesOptions = this.allWarehouses.filter(warehouse =>
            warehouse.name.toLowerCase().includes((textOrWarehouse || '').toLowerCase())
        );
      }
    });
  }

  loadWareHouses() {
    this.warehousesService.loadWarehouses({ query: {}, options: this.defaultFilterOptions }).pipe(
        map(res => res.docs),
        takeUntil(this.subject)
    ).subscribe(res => {
      this.currentWarehousesOptions = res;
      this.allWarehouses = res;
    });
  }

  displayFn(war: Warehouse): string {
    return war && war.name ? war.name : "";
  }

  selectionCurrentWarehouseChange($event: any) {
    this.onSelectionCurrentWarehouseChange.emit($event);
  }

  /* Methods for accessing formControl */
  writeValue(value: any) {
    this.formControl.setValue(value, { emitEvent: true });
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
    this.onTouched = fn;
  }

  validate(c: AbstractControl): ValidationErrors | null {
    return c.valid ? null : {
      invalidForm: {
        valid: false,
        message: "Current warehouse field is invalid"
      }
    };
  }

  ngOnDestroy() {
    this.subject.next();
    this.subscription.unsubscribe();
  }

}
