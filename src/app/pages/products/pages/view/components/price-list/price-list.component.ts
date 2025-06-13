import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { BuyingPrice } from "../../../../../../models/Product";
@Component({
  selector: 'app-price-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
      <div class="flex flex-row gap-2" *ngIf="!lastPrice">
          <div class="" *ngFor="let historyPrice of getHistoryPrices">
            <div class="bg-white rounded-md main-shadow p-1">
              <div class="flex-col flex justify-between">
                <div class="flex-row flex justify-between p-1">
                  <div class="font-normal">{{ historyPrice?.date | date: 'dd/MM/yyyy' }}</div>
<!--                  <div class="light-blu aspect-square rounded-md main-shadow cursor-pointer p-0.5 flex blue items-center w-8 h-8 justify-center">-->
<!--                    <mat-icon class="icon-size material-symbols-rounded-filled cursor-pointer">visibility</mat-icon>-->
<!--                  </div>-->
                </div>
                <div class="self-end pr-1 text-5xl blue">
                  {{ historyPrice.price | currency }}
                </div>
              </div>
            </div>
          </div>
      </div>

      <div class="h-full" *ngIf="lastPrice">
          <div class="bg-white rounded-md main-shadow h-full p-1">
              <div class="flex-col flex justify-between h-full flex-end">
                  <div class="flex-row flex justify-between p-1">
                    <div class="pe-2">
                      <div>
                        ULTIMO PREZZO <br>
                        DI ACQUISTO
                      </div>
                      <div *ngIf="getHistoryPrices.length > 0" class="font-normal">{{ getHistoryPrices[0].date | date: 'dd/MM/yyyy' }}</div>
                    </div>
<!--                      <div class="light-blu aspect-square rounded-md main-shadow cursor-pointer p-0.5 flex blue items-center justify-center w-8 h-8">-->
<!--                          <mat-icon class="icon-size material-symbols-rounded-filled cursor-pointer">visibility</mat-icon>-->
<!--                      </div>-->
                  </div>
                  <div *ngIf="getHistoryPrices.length > 0" class="self-end pr-1 text-5xl blue">
                      {{ getHistoryPrices[0].price | currency }}
                  </div>
              </div>
          </div>
      </div>


  `,
  styles: [
  ]
})
export class PriceListComponent {
  @Input() lastPrice: boolean | undefined;
  @Input() historyPrices: BuyingPrice[] = [];

  get getHistoryPrices(): BuyingPrice[] {
    const prices = [ ...this.historyPrices ]
      .sort((first, second) => (new Date(second.date).getTime() - new Date(first.date).getTime()));
    if(this.lastPrice) {
      return prices;
    }
    return prices.slice(1, 15);
  }
}
