import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { AppState } from "../../app.config";
import { MatTooltipModule } from "@angular/material/tooltip";
import * as RouterActions from "../../core/router/store/router.actions";

@Component({
  selector: 'app-reference-name',
  standalone: true,
  imports: [ CommonModule, MatIconModule, MatTooltipModule ],
  template: `
    <div class="flex items-center gap-3">    
      <div class="flex flex-col main-hover" 
           [class]="!label ? 'pointer-events-none cursor-default' : 'cursor-pointer'" 
           (click)="goToPath()"
      >
        <div *ngIf="label" class="flex flex-row">
          <div class="hover-effect-div">
            {{ label }}
          </div>
          <div class="hover-effect-arrow self-center">
            <mat-icon class="material-symbols-rounded arrow-icon">arrow_right_alt</mat-icon>
          </div>
        </div>
        <ng-content/>
      </div>
    </div>
  `,
  styles: [`
    .hover-effect-arrow {
      display: flex;
      opacity: 0;
      transition: opacity 0.3s ease-out;
    }

    .hover-effect-div {
      display: flex;
      position: relative;


      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 2px;
        bottom: 3px;
        background-color: #000;
        opacity: 0;
        transition: opacity 0.3s ease-out;
      }
    }
    
    .main-hover:hover > div > .hover-effect-arrow, .main-hover:hover > div > .hover-effect-div::after {
      opacity: 1;
    }

    div > .arrow-icon {
      height: inherit !important;
      width: inherit !important;
      font-size: inherit !important;
    }
  `]
})
export class ReferenceNameComponent {
  @Input({ required: true }) label: string = "";
  @Input({ required: true }) redirectPath: string = "";

  store: Store<AppState> = inject(Store);

  goToPath() {
    this.store.dispatch(RouterActions.go({ path: [this.redirectPath] }));
  }
}
