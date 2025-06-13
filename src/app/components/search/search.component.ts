import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="relative w-full">
      <input type="text" class="shadow-md bg-foreground text-gray-900 text-sm rounded-lg focus:outline-none block w-full p-2.5"
             #searchInput
             [formControl]="search"
             placeholder="Cerca">

      <button type="button" class="absolute inset-y-0 end-0 flex items-center pe-3">
        <mat-icon class="material-symbols-rounded">search</mat-icon>
      </button>
    </div>
  `,
  styles: [
  ]
})
export class SearchComponent {
  @Input({ required: true }) search!: FormControl;

  @ViewChild('searchInput') searchInput!: ElementRef;

}
