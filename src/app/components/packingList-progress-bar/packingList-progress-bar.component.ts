import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { ProductsInOrder } from "../../models/Order";
// import { ProductsOnPackingLists } from "../../models/PackingList";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: 'app-packingList-progress-bar',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  template: `
    <div class="flex flex-col gap-0.5">
        <span class="text-sm font-bold ps-3"
              [ngClass]="{'font-red': (getPackingListPercentage <= 20),
                            'font-orange': (getPackingListPercentage >= 21 && getPackingListPercentage <= 49),
                            'font-soko-accent': (getPackingListPercentage >= 50 && getPackingListPercentage <= 99),
                            'font-green': getPackingListPercentage == 100 }">
            {{ productsInPackingListQuantity+"/"+productsInOrderQuantity }}
        </span>
      <div class="progress-container">
        <div class="forfait-standard-part rounded-full" #standardPart matTooltip="Avanzamento produzione ordine">
          <div class="forfait-progress forfait-standard-loader"
               #standard
               [ngClass]="{'background-red': (getPackingListPercentage <= 20),
                          'background-orange': (getPackingListPercentage >= 21 && getPackingListPercentage <= 49),
                          'background-soko-accent': (getPackingListPercentage >= 50 && getPackingListPercentage <= 99),
                          'background-green': getPackingListPercentage > 99 }"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      display: flex;
      flex-direction: row;;
      height: 1.5rem;
      width: 20rem;
      padding: 0.1rem;
      gap: 2px;
    }

    .forfait-progress {
      background: #70C995;
      width: 100%;
      height: 100%;
      box-shadow: 0px 0px 4px 0px rgba(229, 79, 71, 0.16);
    }

    .forfait-standard-part {
      background: #F2F2F2;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.16) inset;
      width: 60%;
      padding: 2px;
    }

    .forfait-standard-loader {
      border-radius: 1rem 0.2rem 0.2rem 1rem;
    }

    .font-soko-accent {
      color: rgb(var(--soko-accent)) !important;
    }

    .font-green {
      color: #70C995;
    }

    .font-orange {
      color: #EEA549 !important;
    }

    .font-red {
      color: #E54F47 !important;
    }

    .background-soko-accent {
      background-color: rgb(var(--soko-accent)) !important;
    }

    .background-green {
      background-color: #70C995;
    }

    .background-orange {
      background-color: #EEA549 !important;
    }

    .background-red {
      background-color: #E54F47 !important;
    }
  `]
})
export class PackingListProgressBarComponent implements OnInit, AfterViewInit {
  @ViewChild("standard") standard: ElementRef | undefined;
  @ViewChild("standardPart") standardPart: ElementRef | undefined;

  // @Input({ required: true }) productsInOrder: ProductsInOrder[] = [];
  // @Input({ required: true }) productsInPackingList: ProductsOnPackingLists[] = [];

  productsInOrderQuantity: number = 0;
  productsInPackingListQuantity: number = 0;

  ngOnInit() {
    // this.productsInOrderQuantity = this.productsInOrder.reduce((acc, product) => acc + product.quantity, 0);
    // this.productsInPackingListQuantity = this.productsInPackingList.reduce((acc, product) => acc + product.quantity, 0);
  }

  ngAfterViewInit() {
    this.setProgressBar();
  }

  get getPackingListPercentage() {
    if(this.productsInPackingListQuantity === 0 ) {
      return 0;
    }

    if(this.productsInOrderQuantity === this.productsInPackingListQuantity) {
      return 100;
    }

    return Math.round((this.productsInPackingListQuantity / this.productsInOrderQuantity) * 100);
  }

  setProgressBar() {
        this.standard!.nativeElement.style.width = `${this.productsInPackingListQuantity * 100 / this.productsInOrderQuantity}%`;
        this.standard!.nativeElement.style.borderRadius = '999px';
  }
}
