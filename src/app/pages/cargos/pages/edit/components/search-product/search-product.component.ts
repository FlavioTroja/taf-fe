import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
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
import { MAT_AUTOCOMPLETE_DEFAULT_OPTIONS, MatAutocompleteModule, MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { MatOptionModule } from "@angular/material/core";
import { Product, ProductFilter } from "../../../../../../models/Product";
import { MatInputModule } from "@angular/material/input";
import { BehaviorSubject, map, Observable, of, pairwise, Subject, Subscription, takeUntil, tap } from "rxjs";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../../app.config";
import { toSignal } from "@angular/core/rxjs-interop";
import { selectRouteQueryParamParam } from "../../../../../../core/router/store/router.selectors";
import { ProductsService } from "../../../../../products/services/products.service";
import { debounceTime } from "rxjs/operators";
import { QueryOptions } from "../../../../../../../global";

@Component({
  selector: 'app-search-product',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatAutocompleteModule, MatOptionModule, ReactiveFormsModule, MatInputModule ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchProductComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SearchProductComponent),
      multi: true
    },
    {
      provide:  MAT_AUTOCOMPLETE_DEFAULT_OPTIONS,
      useValue: { overlayPanelClass: `bg-transparent` }
    }
  ],
  template: `
    <div>
      <label class="text-md justify-left block px-3 py-0 font-medium">{{ inputLabel }}</label>
      <input type="text"
             class="focus:outline-none p-3 rounded-md w-full"
             [ngClass]="productIdField?.invalid && productIdField?.dirty ? ('border-input-error') : ('border-input')"
             [placeholder]="inputPlaceholder"
             aria-label="Prodotto"
             matInput
             #inputProduct
             [formControl]="formControl"
             [matAutocomplete]="auto">
      <mat-autocomplete #auto="matAutocomplete"
                        [displayWith]="displayFn"
                        [class]="autoCompClass"
                        (optionSelected)="selectionProductChange($event)">
        <ng-container *ngIf="(products$ | async) as products">
          <mat-option *ngFor="let option of products" [value]="option">
            {{ option.name }}
          </mat-option>
          <mat-option [disabled]="true" *ngIf="products?.length === 0">
            Prodotto non trovato
          </mat-option>
        </ng-container>
      </mat-autocomplete>
    </div>
  `,
  styles: [`
    ::ng-deep .showAutoComplete {
      display: block;
      background: white;
    }

    ::ng-deep .hideAutoComplete {
      display: none;
      background: transparent !important;
    }

    `]
})
export class SearchProductComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy, AfterViewInit {
  @Input({ required: false }) inputLabel: string = 'prodotto';
  @Input({ required: true }) resetFormSubject: Subject<boolean> = new Subject<boolean>();
  @Input({ required: false }) productIdField!: FormControl | any;
  @Output() onSelectionProductChange = new EventEmitter<any>;
  @Input({ required: false }) openPanelAtStart = false;
  @Input({ required: false }) inputPlaceholder = 'Scegli prodotto';
  @Input({ required: false }) productFilterOptions: ProductFilter = {}

  @Input({ required: false }) productsLoadExtraOptions: QueryOptions = {};

  @ViewChild(MatAutocompleteTrigger) myMatAutocomplete!: MatAutocompleteTrigger;
  @ViewChild("inputProduct") inputProduct!: ElementRef;

  formControl: FormControl = new FormControl<Product | any>("", {
    validators: [ Validators.required ],
    nonNullable: true
  });
  store: Store<AppState> = inject(Store);
  productsService = inject(ProductsService);

  productsSubject = new BehaviorSubject<Product[]>([]);
  queryParams = toSignal(this.store.select(selectRouteQueryParamParam()));
  subscription!: Subscription;
  subject: Subject<void> = new Subject<void>();
  autoCompClass = "hideAutoComplete";

  defaultFilterOptions = { page: 1, limit: 30 };
  protected onTouched!: Function;
  products$: Observable<Product[]> = of([]);
  private onChange!: Function;

  constructor() {
    effect(() => {
      if (!this.queryParams()) {
        return
      }

      const productId = this.queryParams()!["productId"];

      if (productId) {
        this.productsService.getProduct(+productId).pipe(
            takeUntil(this.subject)
        ).subscribe((product: Product | any) => {
          this.onSelectionProductChange.emit({ option: { value: product } });
          this.formControl.setValue(product);
        });
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.openPanelAtStart) {
      this.myMatAutocomplete.openPanel();
      this.inputProduct.nativeElement.focus();
    }
  }

  ngOnInit() {
    this.subscription = this.formControl.valueChanges
        .subscribe((v) => {
          this.onChange && this.onChange(v);
        })

    this.resetFormSubject.pipe(
        takeUntil(this.subject)
    ).subscribe(response => {
      if (response) {
        this.products$ = this.productsService.loadProducts({ query: this.productFilterOptions, options: { page: 1, limit: 30 } }).pipe(
            map(res => res.docs)
        );
        this.formControl.reset();
      }
    })

    this.formControl.valueChanges.pipe(
        debounceTime(200),
        pairwise(),
        map(([ oldTextOrProduct, textOrProduct ]) => {
          if (!textOrProduct.trim()) {
            this.autoCompClass = 'hideAutoComplete';
            return [ oldTextOrProduct, textOrProduct ];
          }
          this.autoCompClass = 'showAutocomplete';
          return [ oldTextOrProduct, textOrProduct ];
        }),
        takeUntil(this.subject)
    ).subscribe(([ oldTextOrProduct, textOrProduct ]) => {
      if ((textOrProduct as Product | null)?.id) {
        return;
      }

      if (typeof textOrProduct === 'string') {
        this.products$ = this.loadProducts(textOrProduct, this.productsLoadExtraOptions).pipe(
            map((res) => {
              return res.docs
            }),
            tap((value) => {
              this.productsSubject.next(value);
              /* If previous value is an empty string and the current value returns only one field, select it automatically */
              if (this.productsSubject.getValue().length === 1 && oldTextOrProduct === '') {
                const prodToSelect = this.productsSubject.getValue().at(0);
                this.writeValue(prodToSelect || textOrProduct);
                this.myMatAutocomplete.closePanel();
                this.onSelectionProductChange.emit({ option: { value: prodToSelect } });
              }
            }),
        );
      }
    });

  }

  loadProducts(text?: string, extraOptions?: QueryOptions) {
    return this.productsService.loadProducts({
      query: {
        ...this.productFilterOptions,
        value: text || "",
      }, options: { ...this.defaultFilterOptions, ...extraOptions }
    }).pipe(takeUntil(this.subject));
  }

  displayFn(prod: Product): string {
    return prod && prod.name ? prod.name : "";
  }

  selectionProductChange($event: any) {
    this.onSelectionProductChange.emit($event);
  }

  writeValue(val: Product | string) {
    this.formControl.setValue(val, { emitEvent: true });
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
    this.onTouched = fn;
  }

  validate(c: AbstractControl): ValidationErrors | null {
    return c.valid ? null : { invalidForm: { valid: false, message: "product field is invalid" } };
  }

  ngOnDestroy() {
    this.subject.next();
    this.subscription.unsubscribe();
  }
}
