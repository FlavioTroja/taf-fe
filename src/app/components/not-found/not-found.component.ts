import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full flex flex-col items-center justify-center text-5xl text-stone-400">
      <div>404</div>
      <div>Pagina non trovata</div>
    </div>
  `,
  styles: []
})
export default class NotFoundComponent {

}
