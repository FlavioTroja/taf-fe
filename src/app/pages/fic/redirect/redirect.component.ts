import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FicService } from "../services/fic.service";

@Component({
  selector: 'app-fic-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
      <div class="flex justify-center">
        <div class="flex flex-col justify-center">
          <div class="text-lg self-center">
            Attendi
          </div>
          <div id="loading"
               class="self-center loader"
          >
          </div>
        </div>
      </div>
  `,
  styles: [`
  .loader {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 3px solid transparent;
    border-radius: 50%; border-top-color: rgb(var(--taf-accent));
    animation: spin 1s ease-in-out infinite;
    -webkit-animation: spin 1s ease-in-out infinite;
  }
  `]
})
export default class RedirectComponent implements OnInit{
  ficService = inject(FicService);

  ngOnInit() {
    this.ficService.verifyResponseUrl(document.location.href).subscribe(res => {
      console.log(res);
    });
  }
}
