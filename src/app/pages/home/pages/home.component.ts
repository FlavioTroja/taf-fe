import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { SimpleCardComponent, SimpleCardItem } from "../../../components/simple-card/simple-card.component";

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="flex flex-col pt-5 pb-12 gap-5">
      <div class="text-center">
        <h2 class="text-2xl font-bold p-1">OPERAZIONI FREQUENTI</h2>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2">
        <div *ngFor="let frequentlyUsedElement of frequentlyUsedArray" class="w-full sm:w-auto">
          <app-simple-card [item]="frequentlyUsedElement"></app-simple-card>
        </div>
      </div>
    </div>
  `,
  styles: [ `
    .small {
      height: 30em;
      aspect-ratio: 1;
    }

    ;

    .large {
      height: 30em;
      aspect-ratio: 2.02;
    }
  ` ],
  imports: [ CommonModule, SimpleCardComponent ]
})
export default class HomeComponent {
  small: boolean = window.innerWidth < 900;
  frequentlyUsedArray: SimpleCardItem[] = [
    {
      iconName: 'location_city',
      path: '/municipals',
      label: "Comuni",
    },
    {
      iconName: 'overview',
      path: '/activities',
      label: "Attività",
    },
    {
      iconName: 'campaign',
      path: '/news',
      label: "News",
    }
  ];

  @HostListener('window:resize', [ '$event' ])
  onResize(event: Event) {
    this.small = window.innerWidth < 900;
  }

}
