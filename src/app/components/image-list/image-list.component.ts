import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-images-list',
  standalone: true,
  imports: [ CommonModule, MatIconModule ],
  template: `
    <div class="flex flex-row h-full gap-1">
      <div class="columns-1 gap-1 flex flex-col column-container">
        <div class="w-1/12">
          <div (click)="showMainImage(null)"
               class="square justify-around bg-light-gray p-2 border border-gray-200 flex justify-center items-center rounded-lg text-center shadow cursor-pointer aspect-square h-full hover:bg-gray-100">
            <div class="font-bold">
              <mat-icon class="material-symbols-rounded opacity-80 scale-[2]">add</mat-icon>
            </div>
          </div>
        </div>

        <div class="w-1/12" *ngFor="let image of galleryImages; let i = index">
          <div [ngClass]="{'selected-image': image.selected}" (click)="showMainImage(image)">
            <!-- ✅ usa una proprietà TS (baseUrl) nel binding -->
            <img class="aspect-square object-cover" [src]="baseUrl + '/media/' + image.src" alt="">
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .max-height { max-height: 350px; }
  `]
})
export class ImagesListComponent implements OnChanges {
  @Input() mainImage: string | null = "";
  @Input() productName: string = "";
  @Input() gallery: string[] = [];
  @Output() setMainImage = new EventEmitter<string | null>();

  galleryImages: ImageType[] = [];

  // ✅ esposta al template
  baseUrl = environment.BASE_URL;

  ngOnChanges(changes: SimpleChanges) {
    if (this.gallery?.length > 0) {
      this.galleryImages = this.gallery.map(x => ({
        src: x,
        selected: x === this.mainImage
      }));
    }
  }

  showMainImage(image: ImageType | null) {
    this.mainImage = image ? image.src : null;
    this.galleryImages.forEach(elem => elem.selected = (elem === image));
    this.setMainImage.emit(this.mainImage);
  }
}

export interface ImageType {
  src: string;
  selected: boolean;
}
