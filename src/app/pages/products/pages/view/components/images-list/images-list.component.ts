import {Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-images-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-row h-full gap-1">

      <div class="columns-1 gap-1 flex flex-col column-container">
        <div class="w-1/12" *ngFor="let productImage of productImages, let i = index">
          <div [ngClass]="{'selected-image': productImage.selected}" (click)="showMainImage(productImage)" class="square justify-around bg-white p-2 border border-gray-200 rounded-lg text-center shadow cursor-pointer aspect-square h-full hover:bg-gray-100">
            <img class="aspect-square object-cover" src="{{productImage.src}}" alt="">
          </div>
        </div>
      </div>

      <div class="w-10/12">
        <div class="bg-white p-2 border border-gray-200 rounded-lg text-center shadow aspect-square h-full hover:bg-gray-100 max-height">
          <img class="aspect-square w-full h-full object-cover" [src]="getImage" alt="">
        </div>
      </div>

    </div>
  `,
  styles: [`
    .max-height {
      max-height: 350px;
    }
  `]
})
export class ImagesListComponent implements OnInit {

  @Input() mainImage: string = "";
  @Input() productName: string = "";
  @Input() gallery: string[] = [];

  productImages: ImageType[] = [];

  ngOnInit() {

    if (this.gallery.length > 0 ) {
      this.productImages = [ ...this.gallery.map(x => ({ src: x, selected: false })) ];
    }

    this.productImages = [
      { src: this.getImage, selected: true },
      ...this.productImages
    ];

  }

  get getImage() {
    if(this.mainImage) {
      return this.mainImage;
    }

    return `https://eu.ui-avatars.com/api/?name=${this.productName.replaceAll(" ", "")}&size=48`;
  }

  showMainImage(image: ImageType) {
    this.mainImage = image.src;
    image.selected = true;

    this.productImages.forEach(elem => {
      elem.selected = elem === image;
    })
  }
}
export  interface ImageType {
  src: string,
  selected: boolean
}
