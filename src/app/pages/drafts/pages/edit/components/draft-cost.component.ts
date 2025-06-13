import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ReactiveFormsModule} from "@angular/forms";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatIconModule} from "@angular/material/icon";
import {MatDialogModule} from "@angular/material/dialog";
import {Cost} from "../../../../../models/Setup";
import {TableButtonComponent} from "../../../../../components/table/components/button/button.component";
import {TableButton} from "../../../../../models/Table";
import {MatTooltipModule} from "@angular/material/tooltip";
import {preventInvalidCharactersForNumericTextInput} from "../../../../../../utils/utils";

@Component({
  selector: 'app-draft-cost',
  standalone: true,
  imports: [CommonModule, MatAutocompleteModule, MatInputModule, MatOptionModule, ReactiveFormsModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatIconModule, MatDialogModule, NgOptimizedImage, TableButtonComponent, MatTooltipModule],
  template: `
    <div class="p-2.5 w-full bg-foreground rounded-md flex flex-col gap-2.5">
      <div class="w-full flex gap-2.5">
        <div>
          <img class="rounded-md shadow-md w-16 h-16" height="76" width="76"
               [ngSrc]="getImage(cost)">
        </div>

        <div class="flex-grow flex">
          <div class="flex justify-between h-full items-center">
            {{ costTitle }}
          </div>
          <div class="flex justify-end gap-2.5 flex-grow items-center">
            <div class="relative w-28">
              <input type="number"
                     placeholder="quantità"
                     class="flex bg-foreground focus:outline-none p-3 rounded-md w-28 border-input pr-6"
                     min="0"
                     [readOnly]="!isEdit"
                     [disabled]="!isEdit"
                     (keydown)="preventInvalidCharactersForNumericTextInput($event, cost.product?.warehouseUm?.options?.float, false)"
                     (input)="onQuantityInputChange($event)"
                     [value]="quantity"

              >
              <span class="absolute right-1 top-3 font-bold pl-0.1">
                {{ um }}
              </span>
            </div>
            <span>x</span>
            <div class="relative w-28">
              <input type="number"
                     placeholder="prezzo"
                     class="flex bg-foreground focus:outline-none p-3 rounded-md w-28 border-input pr-6"
                     min="0"
                     [readOnly]="true"
                     [value]="price"
                     [matTooltip]="getLatestBuyingPrice ? 'Prezzo di acquisto: ' + getLatestBuyingPrice.toString() : ''"
              >
              <span class="absolute right-1 top-3 font-bold pl-0.1">
                €
              </span>
            </div>
            <span>=</span>
            <div class="p-2 rounded-full text-center light-blue blue">
              {{ totalPrice | currency }}
            </div>
            <app-table-button
              *ngIf="isEdit"
              [item]="deleteButton"
              [row]="cost"
              class="error rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export default class DraftCostComponent {
  @Input() cost!: Cost;
  @Input() isEdit: boolean = false;
  @Output() onDelete = new EventEmitter<void>();
  @Output() onCostQuantityChange = new EventEmitter<Cost>();

  // isOpen = false;
  deleteButton: TableButton<Cost> = {
    callback: _ => this.onDelete.emit(),
    iconName: 'delete',
    bgColor: 'error'
  };

  get costTitle() {
    if (!this.cost.resourceId && !this.cost.productId) {
      return this.cost.description;
    }

    return this.cost.resource?.name ?? this.cost.product?.name ?? "";
  }

  get price() {
    return this.cost.price
  }

  get quantity() {
    return this.cost.quantity
  }

  get totalPrice() {
    return this.cost.price * this.cost.quantity
  }

  get um() {
    if (!!this.cost.resourceId) {
      return "h";
    }

    return this.cost.unitOfMeasure ?? "";
  }

  // toggleOpen() {
  //   this.isOpen = !this.isOpen;
  // }

  get getLatestBuyingPrice () {
    if (!this.cost.product || !this.cost.product.buyingPrices) return
    return this.cost.product.buyingPrices.reduce((latest, current) =>
      new Date(current.date) > new Date(latest.date) ? current : latest
    ).price
  }

  getImage(cost: Cost) {
    //pick the image from product, resource or description
    if (!!cost.resourceId) {
      return !!cost.resource?.image ? cost.resource.image : this.getDefaultImage(cost.resource?.name.slice(0, 2)!);
    }

    if (!!cost.productId) {
      return cost.product?.image ? cost.product.image : this.getDefaultImage(cost.product?.name.slice(0, 2)!);
    }

    return this.getDefaultImage(cost.description?.slice(0, 2) ?? "");
  }

  getDefaultImage(name: string) {
    return `https://eu.ui-avatars.com/api/?name=${name}&size=112`;
  }

  onQuantityInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const quantity = parseInt(inputElement.value, 10);

    if (!isNaN(quantity) && this.cost && this.cost.quantity !== quantity) {
      const updatedCost: Cost = { ...this.cost, quantity };
      this.onCostQuantityChange.emit(updatedCost);
    }
  }

  protected readonly preventInvalidCharactersForNumericTextInput = preventInvalidCharactersForNumericTextInput;
}
