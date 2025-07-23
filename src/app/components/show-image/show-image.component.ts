import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-show-image',
  standalone: true,
  imports: [ CommonModule ],
  template: `
    <div [style.background-image]="'url('+ getImage + '?cd=' + date +')'"
         class="aspect-square object-contain rounded-md bg-cover"
         [ngClass]="classes"></div>
  `,
  styles: []
})
export class ShowImageComponent {
  @Input({ required: false }) imageUrl: string = "";
  @Input({ required: false }) objectName: string = "";
  @Input({ required: false }) objectName2: string = "";
  @Input({ required: false }) classes: string = "";

  date = Date.now();

  get getImage() {
    if ( this.imageUrl ) {
      const date = Date.now()
      return 'https://autismfriendly.overzoom.it/media/' + this.imageUrl;
    }
    if ( this.objectName ) {
      return `https://eu.ui-avatars.com/api/?name=${ this.objectName?.slice(0, 2) }&size=48`;
    } else {
      return `https://eu.ui-avatars.com/api/?name=${ this.objectName2.trim() || 'Image' }&size=48`;
    }
  }

}
