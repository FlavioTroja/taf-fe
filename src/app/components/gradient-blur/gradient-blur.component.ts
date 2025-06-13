import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gradient-blur',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header-blur">
      <div style="position: relative; width: 100%; height: 100%; border-radius: 0px;">
        <div style="position: absolute; inset: 0px; z-index: 1; backdrop-filter: blur(0.0625px); -webkit-backdrop-filter: blur(0.0625px); -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0) 37.5%); border-radius: 0px; pointer-events: none;"></div>
        <div style="position: absolute; inset: 0px; z-index: 2; backdrop-filter: blur(0.125px); -webkit-backdrop-filter: blur(0.125px); -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 12.5%, rgb(0, 0, 0) 25%, rgb(0, 0, 0) 37.5%, rgba(0, 0, 0, 0) 50%); border-radius: 0px; pointer-events: none;"></div>
        <div style="position: absolute; inset: 0px; z-index: 3; backdrop-filter: blur(0.25px); -webkit-backdrop-filter: blur(0.25px); -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 25%, rgb(0, 0, 0) 37.5%, rgb(0, 0, 0) 50%, rgba(0, 0, 0, 0) 62.5%); border-radius: 0px; pointer-events: none;"></div>
        <div style="position: absolute; inset: 0px; z-index: 4; backdrop-filter: blur(0.5px); -webkit-backdrop-filter: blur(0.5px); -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 37.5%, rgb(0, 0, 0) 50%, rgb(0, 0, 0) 62.5%, rgba(0, 0, 0, 0) 75%); border-radius: 0px; pointer-events: none;"></div>
        <div style="position: absolute; inset: 0px; z-index: 5; backdrop-filter: blur(1px); -webkit-backdrop-filter: blur(1px); -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 50%, rgb(0, 0, 0) 62.5%, rgb(0, 0, 0) 75%, rgba(0, 0, 0, 0) 87.5%); border-radius: 0px; pointer-events: none;"></div>
        <div style="position: absolute; inset: 0px; z-index: 6; backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 62.5%, rgb(0, 0, 0) 75%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%); border-radius: 0px; pointer-events: none;"></div>
        <div style="position: absolute; inset: 0px; z-index: 7; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 75%, rgb(0, 0, 0) 87.5%, rgb(0, 0, 0) 100%); border-radius: 0px; pointer-events: none;"></div>
        <div style="position: absolute; inset: 0px; z-index: 8; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 87.5%, rgb(0, 0, 0) 100%); border-radius: 0px; pointer-events: none;"></div>
      </div>
    </div>
  `,
  styles: [`
    .header-blur {
      flex: none;
      height: 150%;
      left: calc(50.00000000000002% - 100% / 2);
      pointer-events: none;
      position: absolute;
      top: 0;
      width: 100%;
    }
  `]
})
export class GradientBlurComponent {

}
