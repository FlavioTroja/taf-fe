import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import { toSignal } from "@angular/core/rxjs-interop";
import { selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { MatIconModule } from "@angular/material/icon";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { MatTooltipModule } from "@angular/material/tooltip";
import * as CustomersActions from "../../../customers/store/actions/customers.actions";
import { getCurrentCustomer } from "../../store/selectors/customers.selectors";
import {
  CustomerAddressesSectionComponent
} from "../edit/components/customer-addresses-sections/customer-addresses-section.component";
import { AddressOnCustomerSection, customerTypeArray } from "../../../../models/Customer";



@Component({
  selector: 'app-view-customer',
  standalone: true,
  imports: [CommonModule, MatIconModule, ClipboardModule, MatTooltipModule, CustomerAddressesSectionComponent],
  template: `
    <div class="flex flex-col gap-2" *ngIf="active() as customer">
      <div class="bg-white default-shadow p-2 rounded-md">
        <div class="flex flex-row justify-between">
          <div class="flex flex-col justify-between">
            <div *ngIf="customer.fiscalCode" class="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 fit-content"
                 [cdkCopyToClipboard]="customer.fiscalCode.toUpperCase()"
                 matTooltip="Clicca per copiare il codice fiscale negli appunti">
              {{ customer.fiscalCode.toUpperCase() }}
            </div>
            <div class="text-4xl pt-6 pb-4 font-extrabold"> {{ customer.name }} </div>
            <div class="flex gap-2">
              <div *ngIf="customer.type" class="bg-gray-100 rounded-full max-w-max py-1 px-2 flex justify-between items-center">
                <mat-icon class="material-symbols-rounded">
                  <span *ngIf="customer.type === 'PRIVATO'">boy</span>
                  <span *ngIf="customer.type === 'INSTALLATORE'">install_desktop</span>
                  <span *ngIf="customer.type === 'DISTRIBUTORE'">circles_ext</span>
                  <span *ngIf="customer.type === 'RIVENDITORE'">partner_exchange</span>
                </mat-icon>
                <span class="px-1">{{ formatType(customer.type) }}</span>
              </div>

              <div *ngIf="customer.sdiNumber" class="bg-gray-100 rounded-full max-w-max py-1 px-2 flex justify-between items-center">
                <span class="font-bold letter-spacing">SDI</span>
                <span class="px-1">{{ customer.sdiNumber }}</span>
              </div>

              <div *ngIf="customer.pec" class="bg-gray-100 rounded-full max-w-max py-1 px-2 flex justify-between items-center">
                <span class="font-bold letter-spacing">PEC</span>
                <span class="px-1">{{ customer.pec }}</span>
              </div>

              <div *ngIf="customer.vatNumber" class="bg-gray-100 rounded-full max-w-max py-1 px-2 flex justify-between items-center">
                <span class="font-bold letter-spacing">IVA</span>
                <span class="px-1">{{ customer.vatNumber }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2 items-end">
            <a *ngIf="customer.email" [href]="'mailto:' + customer.email" class="inline-flex items-center px-2.5 py-0.5 rounded-md shadow-sm accent text-sm font-medium">
              <mat-icon class="icon-size material-symbols-rounded">mail</mat-icon>&nbsp;{{ customer?.email?.toLowerCase() }}
            </a>
            <a *ngIf="customer.phone" [href]="'https://wa.me/' + customer.phone" target="_blank"  class="inline-flex items-center px-2.5 py-0.5 rounded-md shadow-sm accent text-sm font-medium">
              <mat-icon class="icon-size material-symbols-rounded">phone</mat-icon>&nbsp;{{ customer.phone }}
            </a>
          </div>
        </div>

        <div *ngIf="customer.note">
          <div class="font-bold py-1">NOTE</div>
          <div>{{customer.note}}</div>
        </div>
      </div>

      <div class="flex flex-col text-xl font-extrabold uppercase px-2">
        statistiche
      </div>

      <app-customer-addresses-section
        [viewOnly]="true"
        [addressesArray]="addresses"
      />
    </div>
  `,
  styles: [``]
})
export default class ViewCustomerComponent implements OnInit {

  store: Store<AppState> = inject(Store);
  active = this.store.selectSignal(getCurrentCustomer);
  id = toSignal(this.store.select(selectCustomRouteParam("id")));

  ngOnInit() {
    this.store.dispatch(
      CustomersActions.getCustomer({ id: this.id()})
    );
  }

  get addresses() {
    return this.active()?.addresses.filter(o => Object.keys(o).length > 0) as AddressOnCustomerSection[];
  }

  formatType(value: string): string {
    return customerTypeArray.find(o => o.value === value)?.name!;
  }

}
