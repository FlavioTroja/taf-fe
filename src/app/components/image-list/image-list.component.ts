import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";

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
        <div class="w-1/12" *ngFor="let image of galleryImages, let i = index">
          <div [ngClass]="{'selected-image': image.selected}" (click)="showMainImage(image)"
               class="square justify-around bg-white p-2 border border-gray-200 rounded-lg text-center shadow cursor-pointer aspect-square h-full hover:bg-gray-100">
            <img class="aspect-square object-cover" src="{{ 'https://autismfriendly.overzoom.it/media/' + image.src}}"
                 alt="">
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [ `
    .max-height {
      max-height: 350px;
    }
  ` ]
})
export class ImagesListComponent implements OnChanges {

  @Input() mainImage: string | null = "";
  @Input() productName: string = "";
  @Input() gallery: string[] = [];

  @Output() setMainImage = new EventEmitter<string | null>();
  galleryImages: ImageType[] = [];

  ngOnChanges(changes: SimpleChanges) {

    if (this.gallery.length > 0) {
      this.galleryImages = [ ...this.gallery.map(x => ({
        src: x,
        selected: false
      })) ];
    }
  }

  showMainImage(image: ImageType | null) {

    if (image) {
      this.mainImage = image.src;
      image.selected = true;
    } else {
      this.mainImage = null;
    }

    this.galleryImages.forEach(elem => {
      elem.selected = elem === image;
    })

    this.setMainImage.emit(this.mainImage);
  }
}

export interface ImageType {
  src: string,
  selected: boolean
}
