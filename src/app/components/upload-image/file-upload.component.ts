import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { concatMap, map, mergeMap, of, Subject, takeUntil } from "rxjs";
import { AppState } from "../../app.config";
import { selectCustomRouteParam } from "../../core/router/store/router.selectors";
import * as UIActions from "../../core/ui/store/ui.actions";
import { NOTIFICATION_LISTENER_TYPE } from "../../models/Notification";
import { FileService } from "./services/file.service";

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [ CommonModule, MatIconModule ],
  template: `
    <div
      class="relative image-div flex flex-col justify-around bg-white p-2 border border-gray-200 rounded-lg text-center shadow cursor-pointer aspect-square hover:bg-gray-100 bg-cover bg-no-repeat bg-center h-full"
      (click)="input.click()"
      [style.background-image]="currentMainImage ? 'url('+ currentMainImage +')' : 'unset'"
      (mouseenter)="isImageHover = true"
      (mouseleave)="isImageHover = false">
      <div></div>
      <input type="file"
             #input
             [multiple]="multiple"
             [disabled]="currentMainImage"
             hidden
             (change)="openChooseFileDialog($event)"
             accept=".gif,.jpg,.jpeg,.png,.pdf">

      <div class="font-bold">
        <mat-icon *ngIf="!currentMainImage" class="material-symbols-rounded scale-[3.5]"
                  [ngClass]="{'invisible' : !!currentMainImage}">add
        </mat-icon>

        <div class="on-hover-images h-full flex items-center justify-center">
          <div *ngIf="currentMainImage"
               class="absolute top-0 left-0 w-full h-full flex flex-col gap-16 justify-center items-center bg-white-trasparent">
            <mat-icon (click)="viewMainImage(currentMainImage)" class="material-symbols-rounded blue bigger-icon">
              visibility
            </mat-icon>
            <mat-icon (click)="deleteMainImage($event)" class="material-symbols-rounded text-red-600 bigger-icon">
              delete
            </mat-icon>
          </div>
        </div>
      </div>
      <p *ngIf="!currentMainImage" class="font-normal drop-shadow">{{ label }}</p>
    </div>

    <ng-template #showImagePreview let-data>
      <img class="w-160" [src]="data?.url" alt=""/>
    </ng-template>
  `,
  styles: [ `
    .image-div {
    }

    div.image-div .on-hover-images {
      visibility: hidden;
    }

    div.image-div:hover .on-hover-images {
      visibility: visible;
    }

    mat-icon.delete {
      font-size: 4em;
      width: auto;
      height: auto;
    }

    .bigger-icon {
      transform: scale(3);
    }

    .bg-white-trasparent {
      background-color: rgba(255, 255, 255, 0.5);
    }
  ` ]
})
export class FileUploadComponent {
  @Input({ required: false }) mainImage: string = "";
  @Input({ required: true }) label: string = "";
  @Input({ required: false }) multiple: boolean = true;
  @Input({ required: false }) images: string[] = [];
  @Input({ required: false }) onlyImages: boolean = false;
  @Input({ required: false }) forImageService: string = '';

  @Output() onUpload = new EventEmitter<string[]>();
  @Output() onDeleteMainImage = new EventEmitter();

  @ViewChild("showImagePreview") showImagePreview!: TemplateRef<any>;

  subject = new Subject();
  imageService = inject(FileService);
  dialog = inject(MatDialog);
  store: Store<AppState> = inject(Store);
  id = toSignal(this.store.select(selectCustomRouteParam("id")));

  isImageHover: boolean = false;

  get currentMainImage() {
    return this.mainImage && this.mainImage !== "" ? this.mainImage : null;
  }

  openChooseFileDialog(event: any) {
    const files: File[] = event.target.files;
    if (files.length === 0) {
      return;
    }

    of(files).pipe(
      mergeMap(r => r),
      map(file => {
        const formData = new FormData();
        formData.append("image", file, file.name);
        return formData;
      }),
      concatMap(formData => {
        const ext = (formData.get("image") as any)?.name?.split(".");

        if (ext[ext.length - 1] === "pdf" && this.onlyImages) {
          this.store.dispatch(UIActions.setUiNotification({
            notification: {
              type: NOTIFICATION_LISTENER_TYPE.WARNING,
              message: "In questa sezione è possibile solo caricare immagini nei seguenti formati: .gif,.jpg,.jpeg,.png"
            }
          }));
          return of(undefined);
        }

        if (this.onlyImages || ext[ext.length - 1] !== "pdf") {

          switch (this.forImageService) {
            case 'USER':
              return this.imageService.uploadUserImage(formData, this.id());
            case 'ACTIVITY_UPLOAD_GALLERY':
              return this.imageService.uploadGalleryImage(formData, this.id());
            case 'ACTIVITY_UPLOAD_LOGO':
              return this.imageService.uploadLogoImage(formData, this.id());
            case 'ACTIVITY_UPLOAD_COVER':
              return this.imageService.updateCoverImage(formData, this.id());
          }
        }

        /*        if(ext[ext.length - 1] === "pdf") {
                  return this.imageService.uploadPdf(formData);
                }*/

        return of(undefined);
      }),
      takeUntil(this.subject)
    ).subscribe(res => {
      if (!res) {
        return;
      }

      this.onUpload.emit([ ...this.images, res.url ]);
    });
  }

  viewMainImage(url: string | any) {
    this.dialog.open(this.showImagePreview, {
      backdropClass: "blur-filter",
      data: <{ url: string }>{
        url
      }
    });
  }

  deleteMainImage(event: any) {
    event.stopPropagation();
    event.preventDefault();

    this.onDeleteMainImage.emit();
  }
}
