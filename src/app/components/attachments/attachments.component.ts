import { Component, EventEmitter, inject, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from "../upload-image/file-upload.component";
import { HorizontalScrollDirective } from "../../shared/directives/horizontal-scroll.directive";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";

@Component({
  selector: 'app-attachments',
  standalone: true,
  imports: [ CommonModule, FileUploadComponent, HorizontalScrollDirective, MatIconModule, MatDialogModule ],
  template: `
    <div class="bg-foreground rounded-md p-2 flex gap-2 h-60 default-shadow" [ngClass]="{ '!h-44': isSmallerUploader }">
      <div *ngIf="!attachmentList.length && viewOnly" class="flex w-full justify-center font-extrabold text-lg">
        <div class="flex flex-col justify-center">
          Nessun allegato disponibile
        </div>
      </div>

      <div *ngIf="!viewOnly" class="flex flex-col justify-around bg-white rounded-lg text-center cursor-pointer aspect-square h-full hover:bg-gray-100" [ngClass]="{ '!h-40': isSmallerUploader }">
        <app-file-upload [images]="currentAttachment" label="{{label}}" (onUpload)="onUpload.emit($event)" [onlyImages]="onlyImages" />
      </div>

      <div appHorizontalScroll class="flex gap-2 lg:overflow-x-auto" [ngClass]="{ '!h-40': isSmallerUploader, 'w-full': !viewOnly }">
        <div *ngIf="!attachmentList.length && !viewOnly" class="flex w-full justify-center font-extrabold text-lg">
          <div class="flex flex-col justify-center">
            Nessun allegato caricato
          </div>
        </div>
        <div *ngFor="let attach of attachmentList, index as i"
             class="attachment-box flex flex-col justify-around bg-white border border-gray-200 rounded-lg text-center shadow cursor-pointer aspect-square">
          <div *ngIf="attach.type !== 'pdf'" class="h-full w-min">
            <div [style.background-image]="'url('+ attach.value +')'" class="rounded-lg h-full aspect-square bg-center bg-cover">
              <div class="layer hidden flex-col justify-center items-center gap-16 h-full bg-white-trasparent">
                <div (click)="viewAttachment(attach.value)">
                  <mat-icon class="material-symbols-rounded h-full w-full blue bigger-icon">visibility</mat-icon>
                </div>
                <div *ngIf="!viewOnly" (click)="onDeleteAttachment.emit(i)">
                  <mat-icon class="material-symbols-rounded h-full w-full red bigger-icon">delete</mat-icon>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="attach.type === 'pdf'" class="flex flex-col justify-center items-center pt-7 relative">
            <div>
              <mat-icon class="opacity-100 material-symbols-rounded delete scale-[2.5]">note</mat-icon>
              <div class="px-2 max-w-36 text-ellipsis overflow-hidden pt-10" style="max-width: 9rem;">{{ getPathName(attach.name) }}</div>
            </div>
            <div class="layer hidden absolute flex-col gap-16 top-0 left-0 h-full w-full bg-white-trasparent">
              <a [href]="attach.value" target="_blank" class="m-auto">
                <mat-icon class="material-symbols-rounded h-full w-full blue bigger-icon">visibility</mat-icon>
              </a>
              <div *ngIf="!viewOnly" (click)="onDeleteAttachment.emit(i)">
                <mat-icon class="material-symbols-rounded h-full w-full red bigger-icon">delete</mat-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #showImagePreview let-data>
      <img class="w-160" [src]="data?.url" alt=""/>
    </ng-template>
  `,
  styles: [`
    .attachment-box:hover .layer {
      display: flex;
    }

    .bigger-icon {
      transform: scale(3);
    }

    .bg-white-trasparent {
      background-color: rgba(255, 255, 255, 0.5);
    }
  `]
})
export class AttachmentsComponent {
  @Input({ required: true }) onlyImages: boolean = false;
  @Input({ required: true }) label: string = "";
  @Input({ required: true }) attachmentList: any = [];
  @Input({ required: false }) currentAttachment: any;
  @Input({ required: false }) viewOnly: boolean = false;
  @Input({ required: false }) isSmallerUploader: boolean = false;

  @Output() onUpload = new EventEmitter<string[]>();
  @Output() onDeleteAttachment = new EventEmitter<number>();



  dialog = inject(MatDialog);
  @ViewChild("showImagePreview") showImagePreview!: TemplateRef<any>;

  viewAttachment(url: string | any) {
    this.dialog.open(this.showImagePreview, {
      backdropClass: "blur-filter",
      data: <{ url: string }> {
        url
      }
    });
  }

  getPathName(url: any) {
    return url.substring(url.lastIndexOf("/") + 1);
  }

}
