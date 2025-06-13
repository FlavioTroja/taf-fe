import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-actions-button',
  standalone: true,
  imports: [CommonModule],
  template: `
      <div [style.background-color]="'#53abde'" class="aspect-square cursor-pointer justify-around p-1 border border-gray-200 rounded-md text-center shadow h-full">
          <div class=" flex justify-center grow font-bold h-full">
              <ng-content/>
          </div>
      </div>
  `,
  styles: [
  ]
})
export class ActionsButtonComponent {

}
