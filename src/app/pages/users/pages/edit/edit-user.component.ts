import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, Signal, TemplateRef, ViewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { Store } from "@ngrx/store";
import { DateTime } from "luxon";
import { concatMap, map, mergeMap, of, pairwise, Subject, takeUntil } from "rxjs";
import { difference, hasRoles } from "../../../../../utils/utils";
import { AppState } from "../../../../app.config";
import { InputComponent } from "../../../../components/input/input.component";
import { FileUploadComponent } from "../../../../components/upload-image/file-upload.component";
import { FileService } from "../../../../components/upload-image/services/file.service";
import { getProfileUser } from "../../../../core/profile/store/profile.selectors";
import { getRouterData, selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { findRoleLabel, PartialUser, Roles, RolesArray } from "../../../../models/User";
import * as UserActions from "../../../users/store/actions/users.actions";
import { getCurrentUser, selectActiveUserRoles } from "../../store/selectors/users.selectors";

interface ChangePasswordForm {
  newPassword: FormControl,
  confirmNewPassword: FormControl
}

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [ CommonModule, InputComponent, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatSelectModule, FileUploadComponent, MatDialogModule, MatDatepickerModule, MatNativeDateModule ],
  template: `

    <form [formGroup]="userForm" autocomplete="off">
      <div class="grid gap-3">

        <div class="flex flex-row gap-4 p-2" [ngClass]="{ 'bg-white rounded-md default-shadow' : viewOnly() }">
          <div class="flex flex-col basis-1/6">
            <app-file-upload [ngClass]="{'pointer-events-none' : viewOnly() || userForm.getRawValue().photo }"
                             [mainImage]="f.photo.value!" [multiple]="false" label="Foto profilo"
                             (onUpload)="onUploadMainImage($event)" (onDeleteMainImage)="removeProfilePic()"
                             [onlyImages]="true"/>
          </div>

          <div *ngIf="!viewOnly() && userForm.getRawValue().photo" class="flex flex-col basis-1/6 gap-2">
            <div class="flex flex-row">
              <div class="flex items-center p-2 rounded-lg shadow-md default-shadow-hover accent cursor-pointer"
                   (click)="input.click()">
                <mat-icon class="icon-size material-symbols-rounded">repeat</mat-icon>
                <input type="file"
                       #input
                       hidden
                       (change)="openChooseFileDialog($event)"
                       accept=".gif,.jpg,.jpeg,.png">
                Sostituisci
              </div>
            </div>

            <div class="flex flex-row">
              <button class="flex items-center p-2 rounded-lg shadow-md default-shadow-hover error"
                      (click)="removeProfilePic()">
                <mat-icon class="icon-size material-symbols-rounded">delete</mat-icon>
                Rimuovi
              </button>

            </div>
          </div>

          <div *ngIf="viewOnly()">
            <div>
              <div class="text-4xl pt-6 pb-4 font-extrabold"> {{ userForm.getRawValue().name }}</div>
              <div class="text-2xl pb-2"> {{ userForm.getRawValue().surname }}</div>
              <div class="text-lg pb-2"> {{ userForm.getRawValue().birthDate }}</div>
            </div>
            <div class="flex gap-2">
              <div *ngFor="let role of roles$ | async"
                   class="whitespace-nowrap bg-gray-100 text-sm px-2 py-1 rounded">{{ role === Roles.ROLE_ADMIN ? 'ADMIN' : 'USER' }}
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="!viewOnly()" class="grid gap-3" [ngClass]="isNewUser ? ('grid-cols-2') : ('grid-cols-3')">
          <div class="flex flex-row relative">
            <app-input [formControl]="f.name" formControlName="name" label="Nome" id="user-name"
                       type="text" class="w-full" [style.box-shadow]=""/>
            <div *ngIf="!isNewUser" class="changePsswBtn">
              <!-- <div *ngIf="hasRoles(currentUser!, [{ role: Roles.ADMIN }]) || canChangePassword"
                    class="flex items-center justify-center rounded cursor-pointer h-12 w-12" (click)="editPassword()">
                 <mat-icon class="icon-size material-symbols-rounded cursor-pointer">key_vertical</mat-icon>
               </div>-->
            </div>
          </div>

          <!--          <div>-->
          <!--            <app-input [formControl]="f.username" formControlName="username" label="username" id="user-username"-->
          <!--                       type="text"/>-->
          <!--          </div>-->

          <div>
            <app-input [formControl]="f.surname" formControlName="surname" label="cognome" id="user-surname"
                       type="text"/>
          </div>
          <div class="flex flex-col basis-1/4 relative">
            <mat-label>Data di nascita</mat-label>
            <input matInput [matDatepicker]="datePicker"
                   formControlName="birthDate"
                   placeholder="gg/mm/yyyy"
                   class="focus:outline-none p-3 rounded-md w-full border-input">
            <mat-datepicker-toggle class="absolute end-0.5 top-6" matIconSuffix [for]="datePicker">
              <mat-icon class="material-symbols-rounded">event</mat-icon>
            </mat-datepicker-toggle>
            <mat-datepicker #datePicker></mat-datepicker>
          </div>

          <!--          <div class="flex flex-row gap-2 w-full">
                      <div *ngIf='isNewUser' class="relative flex flex-col w-full">
                        <app-input [type]="showPassword ? 'text' : 'password'" [formControl]="f.password"
                                   autocomplete="new-password" formControlName="password" label="password"
                                   id="user-generate-password" type="password"/>
                        <button (click)="togglePassword()" type="button"
                                class="absolute end-0.5 -bottom-1.5 rounded-lg text-sm px-4 py-3 items-center">
                          <mat-icon class="material-symbols-rounded">visibility{{ showPassword ? '_off' : '' }}</mat-icon>
                        </button>
                      </div>
                    </div>-->
        </div>
      </div>
    </form>

    <!--    <ng-template #changePasswordTemplate>
          <form [formGroup]="changePasswordForm">
            <div class="flex flex-row gap-1">
              Scegli una nuova password per l'utente
              <div class="font-bold">{{ f.name.value }}</div>
            </div>
            <div class="relative flex flex-col w-full p-2.5">
              <app-input [type]="showPassword ? 'text' : 'password'" [formControl]="passwordForm.newPassword"
                         label="nuova password" id="change-password"/>
              <button (click)="togglePassword()" type="button"
                      class="rounded-lg text-sm px-4 py-3 items-center end-0.5 showPsswBtnModal">
                <mat-icon class="material-symbols-rounded">visibility{{ showPassword ? '_off' : '' }}</mat-icon>
              </button>
            </div>
            <div class="relative flex flex-col w-full p-2.5">
              <app-input label="conferma password" id="confirm-change-password"
                         [type]="showConfirmPassword ? 'text' : 'password'"
                         [formControl]="passwordForm.confirmNewPassword"/>
              <button (click)="toggleConfirmPassword()" type="button"
                      class="rounded-lg text-sm px-4 py-3 items-center end-0.5 showPsswBtnModal">
                <mat-icon class="material-symbols-rounded">visibility{{ showConfirmPassword ? '_off' : '' }}</mat-icon>
              </button>
            </div>
          </form>
        </ng-template>-->
  `,
  styles: [ `
    ::ng-deep #user-username > div > input {
      padding-right: 3rem;
    }

    ::ng-deep #change-password > label {
      font-size: 0.875rem !important;
      line-height: 1.25rem !important;
      padding-bottom: 0.50rem !important;
    }

    ::ng-deep #confirm-change-password > label {
      font-size: 0.875rem !important;
      line-height: 1.25rem !important;
      padding-bottom: 0.50rem !important;
    }

    .changePsswBtn {
      position: absolute;
      bottom: calc(100% - 4.5rem);
      right: 0;
    }

    .showPsswBtnModal {
      position: absolute;
      bottom: calc(100% - 5.75rem);
    }
  ` ]
})
export default class EditUserComponent implements OnInit, OnDestroy {
  @ViewChild("changePasswordTemplate") changePasswordTemplate: TemplateRef<any> | undefined;

  fb = inject(FormBuilder);
  store: Store<AppState> = inject(Store);
  imageService = inject(FileService);

  subject = new Subject();

  dialog = inject(MatDialog);

  active$ = this.store.select(getCurrentUser)
    .pipe(takeUntilDestroyed());

  roles$ = this.store.select(selectActiveUserRoles)

  // isFormValid$: Observable<boolean>;

  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));

  profileId: string = '';
  currentUser: PartialUser | undefined;

  userForm = this.fb.group({
    name: [ { value: "", disabled: this.viewOnly() }, Validators.required ],
    surname: [ { value: "", disabled: this.viewOnly() } ],
    // password: [ { value: "", disabled: this.viewOnly() } ],
    // email: [ { value: "", disabled: this.viewOnly() } ],
    birthDate: [ { value: new Date(), disabled: this.viewOnly() }, Validators.required ],
    photo: [ "" ]
  });

  // changePasswordForm: FormGroup<ChangePasswordForm>;

  initFormValue: PartialUser = {};
  showPassword = false;
  showConfirmPassword = false;

  constructor() {
    /*    this.changePasswordForm = this.fb.group({
          newPassword: [ { value: "" }, [ Validators.required, Validators.min(1) ] ],
          confirmNewPassword: [ { value: "" }, [ Validators.required ] ]
        }, {
          validators: this.passwordMatchValidator
        })

        this.isFormValid$ = this.changePasswordForm.statusChanges.pipe(
          map(() => this.changePasswordForm.valid),
          takeUntil(this.subject)
        );

        this.isFormValid$.subscribe((change) => {
            if (change) {
              this.store.dispatch(UserActions.editChangePasswordForm({ newPassword: this.passwordForm.newPassword.value }));
            } else {
              this.store.dispatch(UserActions.clearChangePasswordForm());
            }
          }
        );*/

    this.store.select(getProfileUser).pipe(
      takeUntil(this.subject)
    ).subscribe((profile) => {
      this.currentUser = profile;
      this.id() === profile.id ? this.profileId = this.id() : this.profileId = profile.id!;
    });
  }

  get f() {
    return this.userForm.controls;
  }

  get isNewUser() {
    return this.id() === "new";
  }

  get canChangePassword() {
    return (this.profileId === this.id());
  }

  /*  get passwordForm() {
      return this.changePasswordForm.controls;
    }*/

  ngOnInit() {

    if (!this.isNewUser) {
      this.store.dispatch(
        UserActions.getUser({ id: this.id() })
      );
    }

    this.active$
      .subscribe((value: PartialUser | any) => {
        if (!value) {
          return;
        }


        this.initFormValue = value as PartialUser;
        this.userForm.patchValue({
          ...value,
        });
      });

    this.editUserChanges();
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmNewPassword')?.value;

    return password === confirmPassword ? null : { notMatching: true };
  }

  editUserChanges() {
    this.userForm.valueChanges.pipe(
      pairwise(),
      map(([ _, newState ]) => {
        if (!Object.values(this.initFormValue).length && !this.isNewUser) {
          return {};
        }
        const diff = {
          ...difference(this.initFormValue, newState),
          birthDate: typeof newState.birthDate! === "string" ? newState.birthDate! : DateTime.fromJSDate(newState.birthDate!).toISODate(),
        };
        return diff;
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.userForm.invalid ? {
        ...changes,
        id: +this.id()
      } : {}),
      takeUntil(this.subject),
      // tap(changes => console.log(changes)),
    ).subscribe((changes) => {
      this.store.dispatch(UserActions.userActiveChanges({ changes }));
    });
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
      concatMap(formData => this.imageService.uploadImage(formData, this.id())),
      takeUntil(this.subject)
    ).subscribe(res => {
      this.userForm.patchValue({ photo: res.url });
    });

  }

  removeProfilePic() {
    this.userForm.patchValue({ photo: '' });
  }

  onUploadMainImage(images: string[]) {
    this.userForm.patchValue({ photo: images[0] });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  /*  editPassword() {
      this.changePasswordForm.reset();

      const dialogRef: any = this.dialog.open(ModalComponent, {
        backdropClass: "blur-filter",
        data: <ModalDialogData>{
          title: "Cambia Password",
          templateContent: this.changePasswordTemplate,
          buttons: [
            {
              iconName: "check",
              label: "Conferma",
              bgColor: "confirm",
              onClick: () => dialogRef.close(true),
              selectors: { disabled: getNewPassword }
            },
            { iconName: "clear", label: "Annulla", onClick: () => dialogRef.close(false) }
          ]
        }
      });*/

  /*    dialogRef.afterClosed().subscribe((result: any) => {
        if (!!result) {
          if (this.profileId === this.id()) {
            this.store.dispatch(changeUserPassword({ id: this.profileId }));
          } else {
            this.store.dispatch(changeUserPassword({ id: this.id() }));
          }
        }
        this.store.dispatch(UserActions.clearChangePasswordForm());
      });
    }*/

  ngOnDestroy(): void {
    this.userForm.reset();

    this.store.dispatch(UserActions.clearUserActive());
    this.store.dispatch(UserActions.clearUserHttpError());
  }

  protected readonly findRoleLabel = findRoleLabel;
  protected readonly hasRoles = hasRoles;
  protected readonly Roles = Roles;
  protected readonly ROLES_ARRAY = RolesArray;
}
