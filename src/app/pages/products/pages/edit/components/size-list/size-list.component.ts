import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { UnitMeasure } from "../../../../../../models/UnitMeasure";

@Component({
  selector: 'app-size-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `

    <div class="flex flex-col grow" *ngIf="!um">
      <input class="opacity-80 pointer-events-none p-3 rounded-md w-full default-shadow"
             placeholder="facoltativo"
      />
    </div>

    <div *ngIf="um">
      <form [formGroup]="size">
        <div class="flex flex-row gap-2" *ngIf="(um!.options?.length) || (um!.options?.height) || (um!.options?.width)">
          <div class="flex flex-col grow" *ngIf="um!.options?.length">
            <input
              class="focus:outline-none p-3 rounded-md w-full"
              [ngClass]="size.get('length')?.invalid && size.get('length')?.dirty ? ('border-input-error') : ('border-input')"
              formControlName="length"
              placeholder="lunghezza"
              type="number"
              id="product-length"/>
          </div>

          <div class="flex flex-col grow" *ngIf="um!.options?.height">
            <input class="focus:outline-none p-3 rounded-md w-full"
                   [ngClass]="size.get('height')?.invalid && size.get('height')?.dirty ? ('border-input-error') : ('border-input')"
                   formControlName="height"
                   placeholder="altezza"
                   type="number"
                   id="product-height"/>

          </div>

          <div class="flex flex-col grow" *ngIf="um!.options?.width">
            <input class="focus:outline-none p-3 rounded-md w-full"
                   [ngClass]="size.get('width')?.invalid && size.get('width')?.dirty ? ('border-input-error') : ('border-input')"
                   formControlName="width"
                   placeholder="larghezza"
                   type="number"
                   id="product-width"/>
          </div>
        </div>

        <div class="flex flex-row gap-2" *ngIf="(um!.options?.string) || (um!.options?.integer) || (um!.options?.float)">
          <div class="flex flex-col grow" *ngIf="um!.options?.string">
            <input class="focus:outline-none p-3 rounded-md w-full"
                   [ngClass]="size.get('string')?.invalid && size.get('string')?.dirty ? ('border-input-error') : ('border-input')"
                   formControlName="string"
                   placeholder="inserisci un valore testuale"
                   type="text"
                   id="product-string"/>
          </div>

          <div class="flex flex-col grow" *ngIf="um!.options?.integer">
            <input class="focus:outline-none p-3 rounded-md w-full"
                   [ngClass]="size.get('integer')?.invalid && size.get('integer')?.dirty ? ('border-input-error') : ('border-input')"
                   formControlName="integer"
                   placeholder="inserisci un valore numerico intero"
                   type="number"
                   id="product-integer"/>
          </div>

          <div class="flex flex-col grow" *ngIf="um!.options?.float">
            <input class="focus:outline-none p-3 rounded-md w-full"
                   [ngClass]="size.get('float')?.invalid && size.get('float')?.dirty ? ('border-input-error') : ('border-input')"
                   formControlName="float"
                   placeholder="inserisci un valore numerico"
                   step="0.01"
                   type="number"
                   id="product-float"/>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class SizeListComponent {

  fb = inject(FormBuilder);

  @Input({ required: true }) size!: FormGroup;
  @Input({ required: true }) um!: UnitMeasure;

}
