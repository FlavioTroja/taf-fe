import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartialProduct } from "../../../../../../models/Product";
import { MatIconModule } from "@angular/material/icon";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: 'app-primary-info',
  standalone: true,
  imports: [CommonModule, MatIconModule, ClipboardModule, MatTooltipModule],
  template: `
    <div class="bg-foreground border-input rounded-md p-3 grow h-full">

      <div class="flex flex-row justify-between select-none">
        <div class="flex flex-col">
          <div class="font-bold text-2xl pb-2">{{active?.name}}</div>
          <div class="font-mono bg-gray-100 text-gray-800 me-2 px-2.5 py-0.5 rounded fit-content"
               [cdkCopyToClipboard]="active?.sku"
               matTooltip="Clicca per copiare il codice negli appunti">
            {{active?.sku}}
          </div>
        </div>

        <div class="flex flex-col text-end">
          <div class="flex mb-1 justify-end gap-2">
            <div class="bg-gray-100 flex items-center rounded p-2">
              <mat-icon class="mat-icon-price material-symbols-rounded text-xs">shopping_cart</mat-icon>
            </div>
            <div class="whitespace-nowrap bg-gray-100 font-bold rounded p-2">
              {{active?.buyingPrices[0]?.price | currency: 'EUR'}}
            </div>
            <div class="whitespace-nowrap bg-gray-100 font-medium rounded p-2">
              <span class="font-bold">+IVA: </span> {{active?.buyingPrices[0]?.vat}}%
            </div>
          </div>

          <div class="flex mb-1 items-center gap-2 justify-end">
            <div class="bg-gray-100 flex items-center rounded p-2">
              <mat-icon class="mat-icon-price material-symbols-rounded text-xs">sell</mat-icon>
            </div>
            <div class="whitespace-nowrap bg-gray-100 font-bold rounded p-2">
                {{active?.sellingPrice | currency: 'EUR'}}
            </div>
            <div class="whitespace-nowrap bg-gray-100 font-medium rounded p-2">
              <span class="font-bold">+IVA: </span> {{active?.vat}}%
            </div>
          </div>
        </div>
      </div>

      <div class="flex pb-1">
        <div class="flex flex-col select-none">
          <div class="text-sm font-bold uppercase pb-2">Categorie</div>
            <div [ngStyle]="{'max-width': '62.5em'}" class="flex gap-0.5 rounded flex-wrap">
                <span *ngFor="let category of active.categories" class="bg-gray-100 text-sm me-2 px-2 py-0.5 rounded font-bold">{{category.category.name}}</span>
            </div>
        </div>
      </div>

      <div class="flex flex-col select-none">
        <div class="text-sm font-bold uppercase py-2">Caratteristiche</div>

        <div class="flex mb-1 gap-2">
          <div *ngIf="active.um" class="flex gap-2">
            <div class="bg-gray-100 rounded text-center p-2">
              <span *ngIf="active.um.name === 'PZ' || active.um.name === 'Taglia(num)'">{{ active?.size?.integer}}</span>
              <span *ngIf="active.um.name === 'm' || active.um.name === 'm2' || active.um.name === 'm3'">{{ active?.size?.float}}</span>
              <span *ngIf="active.um.name === 'm2(assi)'">{{ active?.size?.width}} × {{ active?.size?.length}}</span>
              <span *ngIf="active.um.name === 'm3(assi)'">{{ active?.size?.width}} × {{ active?.size?.height}} × {{ active?.size?.length}}</span>
              <span *ngIf="active.um.name === 'Taglia(lett)'">{{ active?.size?.string.toUpperCase()}}</span>
              <span *ngIf="active.um.name === 'Kg' || active.um.name === 'g' || active.um.name === 'l'">{{ active?.size?.float}}</span>
            </div>

            <div class="bg-gray-100 flex items-center rounded p-2">
              <mat-icon class="mat-icon-price material-symbols-rounded">straighten</mat-icon>
              <div class="ps-2 font-extrabold text-sm">{{ active?.um?.name}}</div>
            </div>
          </div>

          <div class="bg-gray-100 flex items-center rounded h-10 p-2">
            <mat-icon class="mat-icon-price material-symbols-rounded">scale</mat-icon>
            <div class="ps-1 text-sm">{{ active?.weight}} <span class="font-extrabold ps-1">kg</span></div>
          </div>
        </div>
      </div>

      <div class="flex flex-row gap-1 select-none">
        <div class="flex flex-col max-w-4xl max-h-32" *ngIf="active?.description">
          <div class="text-sm font-bold uppercase py-2">Descrizione</div>
          <div *ngIf="!isTextShow" class="text-sm overflow-y-auto break-words overflow-hidden">
            {{active.description.length > 245 ? (active.description | slice:0:245) : (active.description)}}
            <span *ngIf="active.description.length > 245" class="cursor-pointer text-blue-600" (click)="toggleText()">...altro</span>
          </div>
          <div class="text-sm overflow-y-auto break-words overflow-hidden" *ngIf="isTextShow">
            {{active?.description}}
            <span *ngIf="active.description.length > 245" class="cursor-pointer text-blue-600" (click)="toggleText()">...meno</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PrimaryInfoComponent {
    @Input() active: PartialProduct | any;

    isTextShow: boolean = false;

    toggleText() {
      this.isTextShow = !this.isTextShow
    }
}
