import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ReferenceNameComponent } from "../reference-name/reference-name.component";

@Component({
  selector: 'app-payments-progress-bar',
  standalone: true,
  imports: [CommonModule, ReferenceNameComponent],
  template: `
    <app-reference-name [label]="!!invoiceId ? 'fatturato' : ''" redirectPath="/invoices/{{invoiceId}}/view">
      <div class="flex flex-col gap-0.5">
        <span class="text-sm font-bold"
              [ngClass]="{'font-red': (getPaymentPercentage <= 20 && !paid && !invoiceId),
                            'font-orange': (getPaymentPercentage >= 21 && getPaymentPercentage <= 49 && !paid),
                            'font-taf-accent': (getPaymentPercentage >= 50 && getPaymentPercentage <= 99 && !paid),
                            'font-green': (paidAlready >= forfait || getPaymentPercentage > 99),
                            'font-color-gray-dark': !!invoiceId }">
            {{ !invoiceId ? getPaymentPercentage + "%" : '' }}
        </span>
      <div class="progress-container" [ngStyle]="isOnOrders ? {'width': '11rem'} : {}">
        <div class="forfait-standard-part" [ngClass]="{'checker': !!invoiceId}" #standardPart>
          <div class="forfait-progress forfait-standard-loader"
               #standard
               [ngClass]="{'background-red': (getPaymentPercentage <= 20 && !paid),
                          'background-orange': (getPaymentPercentage >= 21 && getPaymentPercentage <= 49 && !paid),
                          'background-taf-accent': (getPaymentPercentage >= 50 && getPaymentPercentage <= 99 && !paid),
                          'background-green': paidAlready >= forfait || getPaymentPercentage > 99 }"></div>
        </div>
        <div class="total-amount-part" #extraPart>
          <div class="forfait-progress total-amount-extra-loader"
               #extra
               [ngClass]="{'background-red': (getPaymentPercentage <= 20 && !paid),
                          'background-orange': (getPaymentPercentage >= 21 && getPaymentPercentage <= 49 && !paid),
                          'background-taf-accent': (getPaymentPercentage >= 50 && getPaymentPercentage <= 99 && !paid),
                          'background-green': paidAlready >= forfait || getPaymentPercentage > 99 }"></div>
          </div>
        </div>
      </div>
    </app-reference-name>
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
      border-radius: 1rem 0.2rem 0.2rem 1rem;
      background: #F2F2F2;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.16) inset;
      width: 60%;
      padding: 2px;
    }

    .total-amount-part {
      border-radius: 0.2rem 1rem 1rem 0.2rem;
      background: #F2F2F2;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.16) inset;
      width: 40%;
      padding: 2px;
    }

    .forfait-standard-loader {
      border-radius: 1rem 0.2rem 0.2rem 1rem;
    }

    .total-amount-extra-loader {
      border-radius: 0.2rem 1rem 1rem 0.2rem;
    }

    .font-taf-accent {
      color: rgb(var(--taf-accent)) !important;
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

    .font-color-gray-dark {
      color: #666666 !important;
    }

    .background-taf-accent {
      background-color: rgb(var(--taf-accent)) !important;
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

    .checker {
      background: conic-gradient(
        #DCDCDC 90deg,
        #FAFAFA 90deg 180deg, #DCDCDC 180deg 270deg,
        #FAFAFA 270deg
      );
      background-repeat: repeat;
      background-size: 8px 8px;
      background-position: top left;
    }
  `]
})
export class PaymentsProgressBarComponent implements AfterViewInit {
  @ViewChild("standard") standard: ElementRef | undefined;
  @ViewChild("standardPart") standardPart: ElementRef | undefined;
  @ViewChild("extra") extra: ElementRef | undefined;
  @ViewChild("extraPart") extraPart: ElementRef | undefined;

  @Input({ required: false }) isOnOrders: boolean | undefined;
  @Input({ required: true }) paid: boolean | undefined;
  @Input({ required: true }) totalAmount: number = 0;
  @Input({ required: true }) paidAlready: number = 0;
  @Input({ required: false }) invoiceId: string | undefined;
  @Input({ required: false }) forfait: number = 0;

  ngAfterViewInit() {
    this.setProgressBar()
  }

  get getPaymentPercentage() {
    if(this.paidAlready === 0 || !this.paidAlready) {
      return 0;
    }

    if(this.paidAlready > this.totalAmount) {
      return 100;
    }

    return Math.floor((+this.paidAlready.toFixed(2) / +this.totalAmount.toFixed(2)) * 100);
  }

  setProgressBar() {
    let paidAlready = Math.floor(this.paidAlready);
    let forfait = Math.floor(this.forfait);
    let totalAmount = Math.floor(this.totalAmount);
    this.setSections(forfait);

    if(this.standard) {
      if (paidAlready > forfait) {
        this.standard!.nativeElement.style.width = "100%";
        this.standard!.nativeElement.style.borderRadius = paidAlready > totalAmount ? '999px' : '1rem 0.2rem 0.2rem 1rem';
      } else {
        this.standard!.nativeElement.style.width = `${paidAlready * 100 / forfait}%`;
        this.standard!.nativeElement.style.borderRadius = '999px';
      }
    } else {
      console.log('Elemento con id "standard" non trovato.');
    }

    if (this.extra) {
      this.extra.nativeElement.style.width =
        (paidAlready < forfait)
          ?
          "0%"
          :
          `${(paidAlready - forfait) * 100 / (totalAmount - forfait)}%`;
    } else {
      console.log('extra id not found');
    }
  }

  setSections(forfait: number) {
    if (this.standardPart) {
      this.standardPart.nativeElement.style.width = (forfait === Math.floor(this.totalAmount!) || forfait < 100) ? `100%` : `${forfait}%`;
      if (forfait === 0 && this.totalAmount !== 0) {
        this.standardPart.nativeElement.style.width = '10%';
      }
    } else {
      console.log('standard id not found');
    }

    if (this.extraPart) {
      if(forfait < this.totalAmount!) {
        this.extraPart.nativeElement.style.width = `${Math.floor(this.totalAmount!) - forfait}%`;
      }
      if (forfait === Math.floor(this.totalAmount!)) {
        this.extraPart.nativeElement.style.display = "none";
        this.standardPart!.nativeElement.width = "100%"
        this.standardPart!.nativeElement.style.borderRadius = "999px";
        this.standard!.nativeElement.width = "100%"
        this.standard!.nativeElement.style.borderRadius = "999px";
      }
    } else {
      console.log('Elemento con id "extra" non trovato.');
    }
  }

}
