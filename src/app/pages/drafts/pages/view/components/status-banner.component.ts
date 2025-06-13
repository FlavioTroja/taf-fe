import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-status-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex w-full rounded-md default-shadow p-2 warning border border-[--soko-warning]">
      <div *ngIf="isForNotOwnerUser" class="flex flex-col gap-3 w-full">
        <span class="font-extrabold text-lg">ATTENZIONE!</span>
        <span class="text-black">
          Non sei l’assegnatario di questo sopralluogo, puoi consultarlo ma non puoi applicare modifiche o completarlo
        </span>
      </div>
      <div *ngIf="isForCancelledDraft" class="flex flex-col gap-3 w-full">
        <span class="font-extrabold text-lg">ATTENZIONE!</span>
        <span class="text-black">Questo allestimento è in stato
              <span class="font-bold">ANNULLATO</span>, puoi
              <span class="font-bold">RIPRISTINARLO</span> o
              <span class="font-bold">ELIMINARLO</span> definitivamente</span>
        <div class="flex w-full justify-end gap-2 text-black select-none">
          <button class="px-2 py-1.5 flex gap-2 items-center red-buttons rounded-md shadow-md select-none cursor-pointer"
                  (click)="fromCanceledToDelete()">
            <mat-icon class="material-symbols-rounded">delete</mat-icon>
            Elimina
          </button>

          <button class="px-2 py-1.5 flex gap-2 items-center accent rounded-md shadow-md select-none cursor-pointer"
                  (click)="fromCanceledToDraft()">
            <mat-icon class="material-symbols-rounded">settings_backup_restore</mat-icon>
            Ripristina
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class StatusBannerComponent {
  @Input() isForCancelledDraft = false;
  @Input() isForNotOwnerUser = false;

  @Output() isDelete: EventEmitter<void> = new EventEmitter();
  @Output() isRestore: EventEmitter<void> = new EventEmitter();

  fromCanceledToDelete() {
    this.isDelete.emit();
  }

  fromCanceledToDraft() {
    this.isRestore.emit();
  }

}
