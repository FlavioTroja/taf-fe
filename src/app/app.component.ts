import { Component, effect, HostListener, inject, Renderer2, ViewEncapsulation } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { Store } from "@ngrx/store";
import { AppState } from "./app.config";
import * as RouterActions from "./core/router/store/router.actions";
import { NavbuttonService } from "./core/ui/services/navbutton.service";
import { ToastNotificationComponent } from "./components/toast-notification/toast-notification.component";
import { NavBarButtonDialog } from "./models/NavBar";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { ModalComponent, ModalDialogData } from "./components/modal/modal.component";
import { Subject } from "rxjs";
import { GradientBlurComponent } from "./components/gradient-blur/gradient-blur.component";
import { ModalButton } from "./models/Button";
import { MobileNavbarComponent } from "./components/sidebar/mobile-navbar.component";
import { uiSetSidebarCollapseState } from "./core/ui/store/ui.actions";
import { getDomainImages } from "./core/profile/store/profile.selectors";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    ToastNotificationComponent,
    MatDialogModule,
    GradientBlurComponent,
    MobileNavbarComponent
  ],
  template: `
    <div class="h-screen w-screen bg-main overflow-hidden relative">
      <div class="grid grid-cols-[min-content_auto] z-10">
        <div class="absolute w-screen h-[4.5rem] z-20">
          <app-gradient-blur/>
        </div>
        <div class="z-40">
          <app-sidebar *ngIf="isDesktop"/>
          <app-mobile-navbar *ngIf="!isDesktop"></app-mobile-navbar>
        </div>
        <div class="relative w-full overflow-x-auto">
          <div class="w-full absolute p-2.5 z-30">
            <app-navbar (onButtonClick)="handleNavbarButtonClick($event)" [isMobile]="!isDesktop"/>
          </div>
          <div class="px-3.5 pt-[4.75rem] overflow-y-scroll h-screen z-10 relative -m-1 p-1"
               [ngStyle]="{'padding-bottom': !isDesktop ? 'calc(66px + 12rem)' : ''}">
            <app-toast-notification/>
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>
      <div class="ball-bg absolute path1"></div>
      <div class="ball-bg absolute path2"></div>
    </div>
  `,
  styleUrls: [ "./app.component.scss" ],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  store: Store<AppState> = inject(Store);
  navButtonService = inject(NavbuttonService);
  dialog = inject(MatDialog);
  subject = new Subject();

  document = inject(DOCUMENT);
  renderer = inject(Renderer2);

  domainImages = this.store.selectSignal(getDomainImages);

  isDesktop: boolean = window.innerWidth >= 900;

  @HostListener('window:resize', [ '$event' ])
  onResize(event: Event) {
    if ( window.innerWidth >= 900 ) {
      this.isDesktop = true;
      return;
    }
    this.store.dispatch(uiSetSidebarCollapseState({ value: false }));
    this.isDesktop = false;
  }

  constructor() {

    effect(() => {

      const domainImages = this.domainImages();

      if ( !domainImages ) return;

      const link: HTMLLinkElement | null = this.document.querySelector("link[rel*='icon']");
      if ( link ) {
        this.renderer.setAttribute(link, 'href', 'https://autismfriendly.overzoom.it/media/' + domainImages.icon || '');
      } else {
        const newLink = this.renderer.createElement('link');
        this.renderer.setAttribute(newLink, 'rel', 'icon');
        this.renderer.setAttribute(newLink, 'href', 'https://autismfriendly.overzoom.it/media/' + domainImages.icon || '');
        this.renderer.appendChild(this.document.head, newLink);
      }

    });
  }

  handleNavbarButtonClick({ action, navigate, dialog }: {
    action: string,
    navigate?: string,
    dialog?: NavBarButtonDialog<any, any>
  }) {
    if ( navigate ) {
      return this.store.dispatch(RouterActions.go({ path: [ navigate ] }));
    }
    if ( dialog ) {
      return this.openDialog(dialog);
    }
    this.navButtonService.dispatchAction(action);
  }

  openDialog(modal: NavBarButtonDialog<any, any>) {

    this.store.select(modal.content)
      .subscribe(content => {

        const dialogRef: any = this.dialog.open(ModalComponent, {
          backdropClass: "blur-filter",
          data: <ModalDialogData>{
            title: modal.title,
            content: content,
            buttons: this.createModalButtons(modal.buttons || [], () => dialogRef)?.length ? this.createModalButtons(modal.buttons || [], () => dialogRef) : [
              { iconName: "delete", label: "Elimina", bgColor: "remove", onClick: () => dialogRef.close(true) },
              { iconName: "clear", label: "Annulla", onClick: () => dialogRef.close(false) }
            ]
          }
        });

        dialogRef.afterClosed().subscribe((result: any) => {
          if ( !result ) {
            return;
          }
          this.navButtonService.dispatchAction(modal.action);
        });
      }).unsubscribe();
  }

  /* Create modal buttons for custom route button */
  private createModalButtons(buttons: ModalButton<any, any>[], dialogRef: () => any) {
    return buttons?.map(b => ({
      ...b,
      onClick: () => dialogRef().close(!!b.valueToEmit)
    }));
  }

}
