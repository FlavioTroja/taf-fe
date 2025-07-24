import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  Output,
  Signal,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { concatMap, map, mergeMap, of, Subject, takeUntil } from "rxjs";
import { AppState } from "../../app.config";
import { getRouterData, selectCustomRouteParam } from "../../core/router/store/router.selectors";
import * as UIActions from "../../core/ui/store/ui.actions";
import { Activity } from "../../models/Activities";
import { Event } from "../../models/Event";
import { News } from "../../models/News";
import { NOTIFICATION_LISTENER_TYPE } from "../../models/Notification";
import { User } from "../../models/User";
import { ImageType } from "../image-list/image-list.component";
import { FileService } from "./services/file.service";
import { Municipal } from "../../models/Municipals";

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [ CommonModule, MatIconModule ],
  template: `
    <div class="flex items-start gap-2">
      <div *ngIf="images.length" class="columns-1 !max-h-[340px] gap-1 flex flex-col self-start column-container">
        <div class="w-1/12" *ngFor="let image of galleryImages, let i = index">
          <div [ngClass]="{'selected-image': image.selected}" (click)="showMainImage(image)"
               class="square justify-around bg-white p-2 border border-gray-200 rounded-lg text-center shadow cursor-pointer aspect-square h-full hover:bg-gray-100">
            <img class="aspect-square object-cover" src="{{ 'https://autismfriendly.overzoom.it/media/' + image.src}}"
                 alt="">
          </div>
        </div>
      </div>
      <div
        [ngClass]="{'disabled' : isNew, 'justify-around': !viewOnly(), 'justify-center': viewOnly()}"
        class="relative h-[340px] image-div flex flex-col bg-white p-2 border border-gray-200 rounded-lg text-center shadow cursor-pointer aspect-square hover:bg-gray-100 bg-cover bg-no-repeat bg-center"
        (click)="clickFileInput($event)"
        [style.background-image]="mainImage ? username ? 'url(' + 'https://eu.ui-avatars.com/api/?name=' + username + '&size=48' +')' : 'url('+ 'https://autismfriendly.overzoom.it/media/' + mainImage +')' : 'unset'">
        <div></div>
        <input type="file"
               #input
               [multiple]="multiple"
               [disabled]="isNew || viewOnly()"
               hidden
               (change)="openChooseFileDialog($event)"
               accept=".gif,.jpg,.jpeg,.png,.pdf">

        <div class="font-bold">
          <mat-icon *ngIf="!mainImage && !viewOnly()" class="material-symbols-rounded scale-[3.5]"
                    [ngClass]="{'invisible' : !!mainImage}">add
          </mat-icon>

          <div class="on-hover-images h-full flex items-center justify-center">
            <div *ngIf="mainImage"
                 [style.visibility]="isImageHover ? 'visible' : 'hidden'"
                 class="absolute top-0 left-0 w-full h-full flex flex-col gap-16 justify-center items-center bg-white-transparent">
              <mat-icon *ngIf="!username" (click)="viewMainImage($event, mainImage)"
                        class="material-symbols-rounded blue bigger-icon">
                visibility
              </mat-icon>
              <mat-icon *ngIf="images.length && !viewOnly()" [ngClass]="{'pointer-events-none': viewOnly()}"
                        (click)="deleteMainImage($event)"
                        class="material-symbols-rounded text-red-600 bigger-icon">
                delete
              </mat-icon>
              <mat-icon *ngIf="!images.length && !viewOnly()" [ngClass]="{'pointer-events-none': viewOnly()}"
                        (click)="clickFileInput($event)"
                        class="material-symbols-rounded text-red-600 bigger-icon">
                repeat
              </mat-icon>
            </div>
          </div>
        </div>
        <p *ngIf="!mainImage" [ngClass]="{ 'text-xl': viewOnly() }" class="font-normal drop-shadow">{{ label }}</p>
      </div>
    </div>

    <ng-template #showImagePreview let-data>
      <img class="w-160" [src]="data?.url" alt=""/>
    </ng-template>
  `,
  styles: [ `
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
export class FileUploadComponent implements OnChanges {
  cdr = inject(ChangeDetectorRef);

  @Input({ required: false }) mainImage: string | null = "";
  @Input({ required: true }) label: string = "";
  @Input({ required: false }) multiple: boolean = true;
  @Input({ required: false }) images: string[] = [];
  @Input({ required: false }) onlyImages: boolean = false;
  @Input({ required: false }) forImageService: string = '';
  @Input({ required: false }) username: string = '';

  @Output() onUpload = new EventEmitter<string[]>();
  @Output() onDeleteMainImage = new EventEmitter<string[]>();

  @ViewChild("showImagePreview") showImagePreview!: TemplateRef<any>;
  @ViewChild("input") input!: ElementRef<HTMLInputElement>;

  @HostListener('mouseenter')
  onMouseEnter() {
    this.isImageHover = true;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.isImageHover = false;
  }

  get isNew() {
    return this.id() === "new";
  }

  clickFileInput(event: any) {
    event.stopPropagation();
    if ( !this.viewOnly() ) {
      this.input.nativeElement.click()
    }
  }

  subject = new Subject();
  imageService = inject(FileService);
  dialog = inject(MatDialog);
  store: Store<AppState> = inject(Store);
  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));

  isImageHover: boolean = false;
  galleryImages: ImageType[] = [];

  ngOnChanges(changes: SimpleChanges) {

    if ( this.images.length > 0 ) {
      this.galleryImages = [ ...this.images.map(x => ({
        src: x,
        selected: false
      })) ];
    }
  }

  showMainImage(image: ImageType) {
    if ( image.selected ) {
      this.mainImage = null;
      this.galleryImages.forEach(img => img.selected = false);
    } else {
      this.mainImage = image.src;
      this.galleryImages.forEach(img => {
        img.selected = (img === image);
      });
    }
  }


  openChooseFileDialog(event: any) {
    const files: FileList = event.target.files;
    if ( files.length === 0 ) {
      return;
    }

    of(files).pipe(
      mergeMap(r => r),
      map(file => {
        const formData = new FormData();
        formData.append("file", file, file.name);
        return formData;
      }),
      concatMap(formData => {
        const ext = (formData.get("file") as any)?.name?.split(".");

        if ( ext[ext.length - 1] === "pdf" && this.onlyImages ) {
          this.store.dispatch(UIActions.setUiNotification({
            notification: {
              type: NOTIFICATION_LISTENER_TYPE.WARNING,
              message: "In questa sezione è possibile solo caricare immagini nei seguenti formati: .gif,.jpg,.jpeg,.png"
            }
          }));
          return of(undefined);
        }

        if ( this.onlyImages || ext[ext.length - 1] !== "pdf" ) {

          switch ( this.forImageService ) {
            case 'USER':
              return this.imageService.uploadUserImage(formData, this.id());
            case 'ACTIVITY_UPLOAD_GALLERY':
              return this.imageService.uploadActivityGalleryImages(formData, this.id());
            case 'ACTIVITY_UPLOAD_LOGO':
              return this.imageService.uploadActivityLogoImage(formData, this.id());
            case 'ACTIVITY_UPLOAD_COVER':
              return this.imageService.updateActivityCoverImage(formData, this.id());
            case 'NEWS_UPLOAD_GALLERY':
              return this.imageService.updateNewsGalleryImages(formData, this.id());
            case 'NEWS_UPLOAD_COVER':
              return this.imageService.updateNewsCoverImage(formData, this.id());
            case 'EVENTS_UPLOAD_GALLERY':
              return this.imageService.updateEventsGalleryImages(formData, this.id());
            case 'EVENTS_UPLOAD_COVER':
              return this.imageService.updateEventsCoverImage(formData, this.id());
            case 'MUNICIPAL_UPLOAD_LOGO':
              return this.imageService.uploadMunicipalsLogoImage(formData, this.id());
            case 'MUNICIPAL_UPLOAD_COVER':
              return this.imageService.uploadMunicipalsCoverImage(formData, this.id());
            case 'MUNICIPAL_UPLOAD_ICON':
              return this.imageService.uploadMunicipalsIconImage(formData, this.id());
          }
        }

        /*        if(ext[ext.length - 1] === "pdf") {
                  return this.imageService.uploadPdf(formData);
                }*/

        return of(undefined);
      }),
      takeUntil(this.subject)
    ).subscribe(res => {
      if ( !res ) {
        return;
      }

      switch ( this.forImageService ) {
        case 'USER':
          const photo = `${ (res as unknown as User).photo }?cb=${ Date.now() }`;
          this.onUpload.emit([ photo ]);
          break;
        case 'ACTIVITY_UPLOAD_GALLERY':
          this.onUpload.emit([ ...(res as unknown as Activity).photos ]);
          break;
        case 'ACTIVITY_UPLOAD_LOGO':
          this.onUpload.emit([ (res as unknown as Activity).logo ]);
          break;
        case 'ACTIVITY_UPLOAD_COVER':
          const activityCover = `${ (res as unknown as News).cover }?cb=${ Date.now() }`;
          this.onUpload.emit([ activityCover ]);
          break;
        case 'NEWS_UPLOAD_GALLERY':
          this.onUpload.emit([ ...(res as unknown as News).photos ]);
          break;
        case 'NEWS_UPLOAD_COVER':
          const newsCover = `${ (res as unknown as News).cover }?cb=${ Date.now() }`;
          this.onUpload.emit([ newsCover ]);
          break;
        case 'EVENTS_UPLOAD_GALLERY':
          this.onUpload.emit([ ...(res as unknown as Event).photos ]);
          break;
        case 'EVENTS_UPLOAD_COVER':
          const eventCover = `${ (res as unknown as Event).cover }?cb=${ Date.now() }`;
          this.onUpload.emit([ eventCover ]);
          break;
        case 'MUNICIPAL_UPLOAD_LOGO':
          this.onUpload.emit([ (res as unknown as Activity).logo ]);
          break;
        case 'MUNICIPAL_UPLOAD_COVER':
          const municipalCover = `${ (res as unknown as Municipal).cover }?cb=${ Date.now() }`;
          this.onUpload.emit([ municipalCover ]);
          break;
        case 'MUNICIPAL_UPLOAD_ICON':
          this.onUpload.emit([ (res as unknown as Municipal).icon ]);
          break;
      }

      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  viewMainImage(event: any, url: string | any) {
    event.stopPropagation();

    this.dialog.open(this.showImagePreview, {
      backdropClass: "blur-filter",
      data: <{ url: string }>{
        url: 'https://autismfriendly.overzoom.it/media/' + url
      }
    });
  }

  deleteMainImage(event: any) {
    event.stopPropagation();
    event.preventDefault();

    switch ( this.forImageService ) {
      case 'USER':
        break;
      case 'ACTIVITY_UPLOAD_GALLERY':
        this.imageService.deleteActivityGalleryImage(this.mainImage?.split('/')[2] ?? '', this.id())
          .subscribe(res => {
            this.mainImage = null;
            this.onDeleteMainImage.emit(res.photos);
          });
        break;
      case 'NEWS_UPLOAD_GALLERY':
        this.imageService.deleteNewsGalleryImage(this.mainImage?.split('/')[2] ?? '', this.id())
          .subscribe(res => {
            this.mainImage = null;
            this.onDeleteMainImage.emit(res.photos);
          });
        break;
      case 'EVENTS_UPLOAD_GALLERY':
        this.imageService.deleteEventGalleryImage(this.mainImage?.split('/')[2] ?? '', this.id())
          .subscribe(res => {
            this.mainImage = null;
            this.onDeleteMainImage.emit(res.photos);
          });
        break;
    }


  }
}
