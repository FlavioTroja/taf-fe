import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [style.background-image]="'url('+ getImage +')'" class="aspect-square object-contain rounded-md bg-cover" [ngClass]="classes"></div>
  `,
  styles: [
  ]
})
export class ShowImageComponent {
  @Input({ required: false }) imageUrl: string = "";
  @Input({ required: false }) objectName: string = "";
  @Input({ required: false }) classes: string = "";

  get getImage() {
    if(this.imageUrl) {
      return this.imageUrl;
    }
    return `https://eu.ui-avatars.com/api/?name=${this.objectName?.slice(0, 2)}&size=48`;
  }

}
