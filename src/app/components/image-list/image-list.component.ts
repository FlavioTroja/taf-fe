import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-images-list',
  standalone: true,
  imports: [ CommonModule ],
  template: `
    <div class="flex flex-row h-full gap-1">

      <div class="columns-1 gap-1 flex flex-col column-container">
        <div class="w-1/12" *ngFor="let image of galleryImages, let i = index">
          <div [ngClass]="{'selected-image': image.selected}" (click)="showMainImage(image)"
               class="square justify-around bg-white p-2 border border-gray-200 rounded-lg text-center shadow cursor-pointer aspect-square h-full hover:bg-gray-100">
            <img class="aspect-square object-cover" src="{{image.src}}" alt="">
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
export class ImagesListComponent implements OnInit {

  @Input() mainImage: string = "";
  @Input() productName: string = "";
  @Input() gallery: string[] = [];

  @Output() setMainImage = new EventEmitter<string>();
  galleryImages: ImageType[] = [];

  ngOnInit() {

    if (this.gallery.length > 0) {
      this.galleryImages = [ ...this.gallery.map(x => ({ src: x, selected: false })) ];
    }

    this.galleryImages = [
      { src: this.getImage, selected: true },
      ...this.galleryImages
    ];

  }

  get getImage() {
    if (this.mainImage) {
      return this.mainImage;
    }

    return `https://eu.ui-avatars.com/api/?name=${ this.productName.replaceAll(" ", "") }&size=48`;
  }

  showMainImage(image: ImageType) {
    this.mainImage = image.src;
    image.selected = true;

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
