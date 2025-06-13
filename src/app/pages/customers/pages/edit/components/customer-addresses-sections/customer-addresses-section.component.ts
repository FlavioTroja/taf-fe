import {
  Component, EventEmitter,
  inject,
  Input, Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent, ModalDialogData} from "../../../../../../components/modal/modal.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { MatIconModule } from "@angular/material/icon";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { CustomerAddressModalComponent } from "../customer-address-modal/customer-address-modal.component";
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AddressOnCustomerSection } from "../../../../../../models/Customer";
import { concatLatestFrom } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../../app.config";
import { getCustomerAddressFormActiveChanges } from "../../../../store/selectors/customers.selectors";
import * as CustomerActions from "../../../../store/actions/customers.actions";
import { MessageContainerComponent } from "../../../../../../components/message-container/message-container.component";

@Component({
  selector: 'app-customer-addresses-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    InfiniteScrollModule,
    MatDialogModule,
    CustomerAddressModalComponent,
    MatButtonModule,
    MatMenuModule,
    MessageContainerComponent
  ],
  template: `
      <div class="grid gap-2">
          <div class="flex flex-row justify-between p-2">
              <div class="flex flex-col text-xl font-extrabold uppercase"
                   *ngIf="!viewOnly || addressesArray.length > 0">indirizzi di spedizione
              </div>
              <div *ngIf="!viewOnly">
                  <button class="focus:outline-none p-2 rounded-full w-full border-input bg-foreground flex items-center"
                          (click)="manageAddress()">
                      <mat-icon class="align-to-center icon-size material-symbols-rounded">add</mat-icon>
                  </button>
              </div>
          </div>
      </div>

      <div class="flex flex-row justify-center" *ngIf="!viewOnly && !addressesArray.length">

<!--        <div class="m-auto mb-10" style="background-color: #F9F1E8">-->
<!--          <div class="p-2 items-start text-indigo-100 rounded-[1.7em] flex default-shadow-hover">-->
<!--              <span class="flex rounded-full uppercase p-3 text-xs font-bold"-->
<!--                    style="background-color: #EEA549">-->
<!--                  <mat-icon class="material-symbols-rounded-filled" style="color: #F9F1E8">warning</mat-icon>-->
<!--              </span>-->
<!--            <div class="flex flex-col gap-1">-->
<!--                      <span class="font-semibold text-left flex-auto pl-2"-->
<!--                            style="color: #EEA549">NESSUN INDIRIZZO</span>-->
<!--              <span class="text-left text-sm text-black flex-auto pl-2 pr-12 pb-2">-->
<!--            Per aggiungere un indirizzo di spedizione <br>-->
<!--            <div class="flex">-->
<!--              premi il tasto "<span class="h-5 w-5 rounded-full bg-foreground pl-1 pt-1">-->
<!--                                <mat-icon class="icon-size material-symbols-rounded"-->
<!--                                          style="font-size: 0.75rem">add</mat-icon>-->
<!--                              </span>" a destra-->
<!--            </div>-->
<!--          </span>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->

        <app-message-container
          type="warning"
          icon="warning"
          title="NESSUN INDIRIZZO"
          message="Per aggiungere un indirizzo di spedizione"
          [add]="true"/>

      </div>

      <!--    LISTA       -->
      <div class="flex flex-col gap-2" *ngIf="addressesArray.length">
          <ng-container *ngFor="let row of addressesArray, index as i">

              <div class="grid bg-foreground default-shadow rounded-md px-2 py-1 relative h-14"
                   *ngIf="!row?.toBeDisconnected">

                  <div class="flex justify-between">
                      <div class="flex flex-row items-center">

                          <div class="w-40">
                              {{ row?.address }}, {{ row?.number }}
                          </div>

                          <div class="w-64">
                              {{ row?.city }} ({{ row?.province }}), {{ row?.zipCode }}
                          </div>

                          <div class="w-40 font-bold">
                              {{ row?.country?.toUpperCase() }}, {{ row?.state?.toUpperCase() }}
                          </div>

                          <div class="flex gap-2">
                            <div *ngIf="row.billing"
                                 class="justify-center items-center text-white font-light text-sm px-2 rounded-full flex light-blu">
                              <mat-icon class="material-symbols-rounded-filled blue" style="transform: scale(0.7);">
                                <span>local_shipping</span>
                              </mat-icon>
                              <div class="blue">fatturazione</div>
                            </div>

                            <div *ngIf="row.defaultShipping"
                                 class="justify-center items-center text-white font-light text-sm px-2 rounded-full flex light-blu">
                              <mat-icon class="material-symbols-rounded-filled blue" style="transform: scale(0.7);">
                                <span>home</span>
                              </mat-icon>
                              <div class="blue">predefinito</div>
                            </div>
                          </div>

                          <div class="ps-4 w-96 italic">
                            {{ row?.note }}
                          </div>

                          <div *ngIf="!viewOnly" class="absolute right-4 flex items-center">
                              <button mat-button [matMenuTriggerFor]="menu">
                                  <mat-icon class="icon-size material-symbols-rounded options-icon">more_horiz
                                  </mat-icon>
                              </button>
                              <mat-menu #menu="matMenu" class="default-shadow">
                                  <div mat-menu-item (click)="removeAddress(row.code)">
                                      <mat-icon class="icon-size material-symbols-rounded red">delete</mat-icon>
                                      <div class="red">Elimina</div>
                                  </div>
                                  <div mat-menu-item (click)="editAddress(row)">
                                      <mat-icon class="icon-size material-symbols-rounded edit">edit</mat-icon>
                                      <div class="font-orange">Modifica</div>
                                  </div>
                                  <div mat-menu-item (click)="onToggleBilling($event, row)"
                                        [ngStyle]="row.billing ? {'pointer-events': 'none', 'opacity': '0.5'} : {}">
                                      <mat-icon class="icon-size material-symbols-rounded blue"
                                                [ngStyle]="row.billing ? {'opacity': '0.5'} : {}">
                                          check
                                      </mat-icon>
                                      <div class="blue">Di Fatturazione</div>
                                  </div>
                                  <div mat-menu-item (click)="onToggleDefault($event, row)"
                                       [ngStyle]="row.defaultShipping ? {'pointer-events': 'none', 'opacity': '0.5'} : {}">
                                    <mat-icon class="icon-size material-symbols-rounded blue"
                                              [ngStyle]="row.defaultShipping ? {'opacity': '0.5'} : {}">
                                      home
                                    </mat-icon>
                                    <div class="blue">Predefinito</div>
                                  </div>
                              </mat-menu>
                          </div>
                      </div>
                  </div>
              </div>

          </ng-container>
      </div>

      <ng-template #addAddressInCustomerTemplate>
        <app-customer-address-modal [currentAddress]="(currentAddress$ | async)!" />
      </ng-template>


  `,
  styles: [
    `.options-icon {
      transform: scale(1.3) !important
    }

    .mat-mdc-menu-item .mat-icon-no-color.edit {
      color: #EEA549;
    }
    `
  ]
})
export class CustomerAddressesSectionComponent {
  @ViewChild("addAddressInCustomerTemplate") addAddressInCustomerTemplate: TemplateRef<any> | undefined;

  @Input({ required: true }) viewOnly = false;
  @Input() addressesArray: AddressOnCustomerSection[] = [];

  @Output() onAddressAdd = new EventEmitter<{ newAddress: Partial<AddressOnCustomerSection> }>();
  @Output() onAddressChangeData = new EventEmitter<{ data: Partial<AddressOnCustomerSection> }>();

  @Output() onRemoveAddress = new EventEmitter<{ code: string }>();

  store: Store<AppState> = inject(Store);
  subject = new Subject();

  dialog = inject(MatDialog);
  currentAddress$ = this.store.select(getCustomerAddressFormActiveChanges);


  manageAddress(isEdit?: boolean) {

    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData> {
        title: "Aggiungi indirizzo di spedizione",
        content: ``,
        templateContent: this.addAddressInCustomerTemplate,
        buttons: [
          { iconName: "check", label: "Conferma", bgColor: "confirm",  onClick: () => dialogRef.close(true), selectors: { disabled: getCustomerAddressFormActiveChanges } },
          { iconName: "clear", label: "Annulla",  onClick: () => dialogRef.close(false) }
        ]
      }
    });

    dialogRef.afterClosed().pipe(
      concatLatestFrom(() => [ this.store.select(getCustomerAddressFormActiveChanges) ]),
      takeUntil(this.subject)
    ).subscribe(([ result, current ]: any) => {
      if(!result) {
        this.store.dispatch(CustomerActions.clearAddressFormActiveChanges());

        return;
      }

      if(isEdit) {
        this.onAddressChangeData.emit({ data: current });
      } else {
        this.onAddressAdd.emit({ newAddress: current });
      }

      this.store.dispatch(CustomerActions.clearAddressFormActiveChanges());
    });
  }

  editAddress(row: AddressOnCustomerSection) {
    this.store.dispatch(CustomerActions.addressFormActiveChanges({ changes: row }));

    this.manageAddress(true);
  }

  removeAddress(code: string) {
    this.onRemoveAddress.emit({ code });
  }

  onToggleBilling(event: any, row: AddressOnCustomerSection) {
    event.stopPropagation();
    event.preventDefault();
    this.onAddressChangeData.emit({ data: { code: row.code, billing: !row.billing } });
  }

  onToggleDefault(event: any, row: AddressOnCustomerSection) {
    event.stopPropagation();
    event.preventDefault();
    this.onAddressChangeData.emit({ data: { code: row.code, defaultShipping: !row.defaultShipping } });
  }

}
