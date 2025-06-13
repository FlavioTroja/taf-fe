import { AfterViewInit, Component, inject, OnInit, ViewChild, Renderer2, TemplateRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import * as RouterActions from "../../../../core/router/store/router.actions";
import { toSignal} from "@angular/core/rxjs-interop";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import * as ProductsActions from "../../store/actions/products.actions";
import { Subject} from "rxjs";
import { getCurrentProduct } from "../../store/selectors/products.selectors";
import { PrimaryInfoComponent } from "./components/primary-info/primary-info.component";
import { ImagesListComponent } from "./components/images-list/images-list.component";
import { GeneralCardComponent } from "./components/general-card/general-card.component";
import { PriceListComponent } from "./components/price-list/price-list.component";
import { ActionsButtonComponent } from "./components/actions-button/actions-button.component";
import { MatIconModule } from "@angular/material/icon";
import { NgxBarcode6Component, NgxBarcode6Module } from "ngx-barcode6";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { writeHtml } from "../../../../../utils/utils";
import { BuyingPrice, Product } from "../../../../models/Product";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HorizontalScrollDirective } from "../../../../shared/directives/horizontal-scroll.directive";
import { ButtonSquareComponent } from "../../../../components/button-square/button-square.component";
import { MatSelectModule } from "@angular/material/select";
import { MessageContainerComponent } from "../../../../components/message-container/message-container.component";

@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PrimaryInfoComponent,
    ImagesListComponent,
    GeneralCardComponent,
    PriceListComponent,
    ActionsButtonComponent,
    MatIconModule,
    HorizontalScrollDirective,
    NgxBarcode6Module,
    MatDialogModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    ButtonSquareComponent,
    MatSelectModule,
    MessageContainerComponent
  ],
  templateUrl: './view-product.component.html',
  styles: []

})
export default class ViewProductComponent implements OnInit, AfterViewInit {

  dialog = inject(MatDialog);
  renderer = inject(Renderer2);

  store: Store<AppState> = inject(Store);
  subject = new Subject();
  populateParam = "warehouses warehouses.warehouse warehouseUm um categories categories.category";

  @ViewChild("productSKU") productSKU!: NgxBarcode6Component;
  @ViewChild("productEAN") productEAN!: NgxBarcode6Component;
  @ViewChild("showPricesQuestionDialogBody") showPricesQuestionDialogBody!: TemplateRef<any>;

  // active$ = this.store.select(getCurrentProduct)
  //   .pipe(takeUntilDestroyed());

  changeInitialPriceStatus: boolean = false;
  fb = inject(FormBuilder);

  initialPriceForm = this.fb.group({
    price: [0],
    vat: [0]
  });

  active = this.store.selectSignal(getCurrentProduct);

  id = toSignal(this.store.select(selectCustomRouteParam("id")));

  checked: boolean = false;

  constructor() {
      effect(() => {
        if (this.active()) {
            this.initialPriceForm.patchValue({
              price: this.active()!.buyingPrices[0]?.price,
              vat: this.active()!.buyingPrices[0]?.vat
            });
        }
      })
  }

  ngAfterViewInit(): void {
    if(isNaN(this.id())) {
      this.store.dispatch(RouterActions.go({ path: ["/404"] }))
    }
  }

  ngOnInit() {

    this.store.dispatch(
      ProductsActions.getProduct({ id: this.id(), params: { populate: this.populateParam }})
    );

    // this.active$.pipe(
    //   takeUntil(this.subject)
    // ).subscribe((value: PartialProduct) => );
  }

  getColorProperty(quantity: number | any, yellowThreshold: number | any, redThreshold: number | any, isText?: boolean) {
      if (quantity <= redThreshold) {
        return isText ? 'red' : 'light-red';
      }

      if (quantity <= yellowThreshold) {
        return isText ? 'font-orange' : 'light-orange';
      }

      return isText ? 'green' : 'light-green';
  }

  downloadSKU() {
      const canvas = this.productSKU.bcElement.nativeElement.children[0];
      this.downloadCanvas(canvas, (this.active()?.sku as string));
  }
  downloadCanvas(canvas: HTMLCanvasElement, download: string) {
      const a = this.renderer.createElement("a");

      a.href = canvas.toDataURL();
      a.download = download;
      a.click();
  }

  printSKU() {
    const canvas = this.productSKU.bcElement.nativeElement.children[0];
    this.printCanvas(canvas, "sku");
  }
  printCanvas(canvas: HTMLCanvasElement, eanOrSku: "ean"|"sku") {

    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData> {
        title: "Mostrare il prezzo?",
        content: `Desideri includere il prezzo nella stampa del seguente ${eanOrSku.toUpperCase()}?`,
        templateContent: this.showPricesQuestionDialogBody,
        buttons: [
          { iconName: "print", label: "Stampa", bgColor: "confirm", onClick: () => dialogRef.close(true) },
          { iconName: "clear", label: "Annulla",  onClick: () => dialogRef.close(false) }
        ]
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {

      if(!result) {
        return;
      }
      const product = this.active() as Product;
      const win = window.open("", "_blank");

      if (win) {
        win.document.write(writeHtml(product, canvas, eanOrSku, this.checked));
        win.document.close(); // Close the document stream
        win.onload = () => {
          win.print(); // Trigger print dialog once the document is fully loaded
        };
      }
    });
  }

  toggleStatus() {
    this.changeInitialPriceStatus = !this.changeInitialPriceStatus;

    if (!this.changeInitialPriceStatus) {
        const changes = this.initialPriceForm.getRawValue() as Partial<BuyingPrice>;
        changes.vat = +changes.vat! || this.active()?.vat;

        if (!!(changes.vat && changes.price)) {
          this.store.dispatch(ProductsActions.changeBuyingPriceProduct({
            productOpts: { id: +this.id(), populate: this.populateParam },
            changes: { ...changes }
          }));
        }
    }
  }

  downloadEAN() {
    const canvas = this.productEAN.bcElement.nativeElement.children[0];
    this.downloadCanvas(canvas, (this.active()?.ean as string));
  }

  printEAN() {
    const canvas = this.productEAN.bcElement.nativeElement.children[0];
    this.printCanvas(canvas, "ean");
  }

  getTotalQuantity(): number {
    const product =  this.active() as Product;
    return product.warehouses?.reduce( (acc, curr) =>  acc + curr.quantity, 0 ) ?? 0;
  }

}
