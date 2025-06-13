import { Component, inject, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { getCurrentSupplier } from "../../store/selectors/suppliers.selectors";
import { toSignal } from "@angular/core/rxjs-interop";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import * as SuppliersActions from "../../../suppliers/store/actions/suppliers.actions";
import { MatIconModule } from "@angular/material/icon";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Supplier } from "../../../../models/Supplier";

@Component({
  selector: 'app-view-supplier',
  standalone: true,
  imports: [CommonModule, MatIconModule, ClipboardModule, MatTooltipModule],
  template: `
    <div class="flex flex-col gap-2" *ngIf="active() as supplier">
      <div class="flex flex-row justify-between bg-white default-shadow p-2 rounded-md">
        <div class="flex flex-col justify-between">
          <div class="text-4xl pt-6 pb-4 font-extrabold"> {{ supplier.name }} </div>
          <div class="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 fit-content"
               [cdkCopyToClipboard]="supplier.iban!"
               matTooltip="Clicca per copiare l IBAN negli appunti">
            <mat-icon class="icon-size material-symbols-rounded">account_balance</mat-icon>&nbsp;{{ supplier.iban }}
          </div>
        </div>

          <div class="flex flex-col gap-2 items-end">
            <a [href]="'mailto:' + supplier.email" class="inline-flex items-center px-2.5 py-0.5 rounded-md shadow-sm accent text-sm font-medium">
              <mat-icon class="icon-size material-symbols-rounded">mail</mat-icon>&nbsp;{{ supplier.email?.toLowerCase() }}
            </a>
              <a [href]="'https://wa.me/' + supplier.phone" target="_blank"  class="inline-flex items-center px-2.5 py-0.5 rounded-md shadow-sm accent text-sm font-medium">
              <mat-icon class="icon-size material-symbols-rounded">phone</mat-icon>&nbsp;{{ supplier.phone }}
            </a>
          </div>
      </div>
      <div class="text-1xl font-extrabold uppercase pt-3">Indirizzo</div>
      <div class="grid bg-foreground default-shadow rounded-md px-2 py-1 relative h-14">
        <div class="flex justify-between">
          <div class="flex flex-row items-center">

            <div class="w-40">
              {{ supplier?.address?.address }}, {{ supplier?.address?.number }}
            </div>

            <div class="w-64">
              {{ supplier?.address?.city }} ({{ supplier?.address?.province?.toUpperCase() }}), {{ supplier?.address?.zipCode }}
            </div>

            <div class="w-64 font-bold">
              {{ supplier?.address?.country?.toUpperCase() }}, {{ supplier?.address?.state?.toUpperCase() }}
            </div>

            <div class="w-96 italic">
              {{ supplier?.address?.note }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})
export default class ViewSupplierComponent implements OnInit{

  store: Store<AppState> = inject(Store);
  active: Signal<Supplier | undefined> = this.store.selectSignal(getCurrentSupplier);
  id = toSignal(this.store.select(selectCustomRouteParam("id")));

  ngOnInit() {

    this.store.dispatch(
      SuppliersActions.getSupplier({ id: this.id(), params: { populate: "address" }})
    );
  }

}
