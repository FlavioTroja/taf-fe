import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatIconModule } from "@angular/material/icon";
import { MatOptionModule } from "@angular/material/core";
import { animate, style, transition, trigger } from "@angular/animations";
import { ButtonSquareComponent } from "../../../../../../components/button-square/button-square.component";

@Component({
  selector: 'app-move-action',
  standalone: true,
  imports: [CommonModule, FormsModule, MatAutocompleteModule, MatIconModule, MatOptionModule, ReactiveFormsModule, ButtonSquareComponent],
  template: `
      <div class="flex flex-row gap-2 items-end basis-1 w-full">
        <div *ngIf="!renderMovButton" class="flex flex-col basis-1/3 grow">
            <app-button-square iconName="open_with" label="Muovi" bgColor="#E6F3FA" color="#53ABDE" [disabled]="disabled" (onClick)="startMovimentation()"></app-button-square>
        </div>
        <div *ngIf="movement" @slideAnimation style="background-color: #E6F3FA" class="main-shadow flex items-center aspect-square p-3 rounded-md cursor-pointer">
            <mat-icon style="color: #53ABDE" class="icon-size material-symbols-rounded-filled" (click)="cancelMovimentation()">close</mat-icon>
        </div>
        <div *ngIf="renderMovimentationButtons" @appearDisappear class="flex flex-col basis-1/2 grow">
            <ng-content/>
        </div>
        <div (click)="move.emit(true)" *ngIf="renderMovimentationButtons" @appearDisappear style="background-color: #E6F3FA" class="main-shadow flex items-center aspect-square p-3 rounded-md cursor-pointer" [ngClass]="{'opacity-50 pointer-events-none' : !arrowDisabled }">
            <mat-icon style="color: #53ABDE" class="icon-size material-symbols-rounded-filled">east</mat-icon>
        </div>
      </div>
  `,
  styles: [
  ],
  animations: [
    trigger('appearDisappear', [
      transition('void => *', [
        style({opacity: 0}),
        animate('70ms', style({opacity: 1}))
      ]),
      transition('* => void', [
        animate('70ms', style({opacity: 0}))
      ])
    ]),

    trigger('slideAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(1380%)' }),
        animate('250ms ease-in', style({ transform: 'translateX(0)'})),
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)' }),
        animate('300ms ease-out', style({ transform: 'translateX(1380%)'})),
      ]),
    ]),

  ]
})
export class MoveActionComponent {
  @Input() renderChooseButtons: boolean = false;
  @Input() disabled: boolean = false;
  @Input() arrowDisabled: boolean = false;
  @Output() updateRenderChooseButtons = new EventEmitter<boolean>();
  @Output() move = new EventEmitter<boolean>();
  @Output() exitToMove = new EventEmitter<void>();
  movement: boolean = false;
  renderMovimentationButtons: boolean = false;
  renderMovButton: boolean = false;

  render(value: boolean) {
    if(!value) {
      setTimeout(() => this.updateRenderChooseButtons.emit(value), 550);
    } else {
      setTimeout(() => this.updateRenderChooseButtons.emit(value), 0);
    }
  }
  startMovimentation() {
    this.movement = !this.movement
    this.renderMovButton = ! this.renderMovButton;
    this.render(true)
    setTimeout(() => this.renderMovimentationButtons = !this.renderMovimentationButtons, 251)
  }

  cancelMovimentation() {
    setTimeout(() => this.movement = !this.movement, 100)
    this.render(false)
    setTimeout(() => this.renderMovButton = !this.renderMovButton, 550)
    setTimeout(() => this.renderMovimentationButtons = !this.renderMovimentationButtons, 110)
    this.exitToMove.emit();
  }

}
