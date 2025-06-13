import { Component, inject, OnDestroy, OnInit, Signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputComponent } from "../../../../components/input/input.component";
import { MatIconModule } from "@angular/material/icon";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.config";
import * as UserActions from "../../../users/store/actions/users.actions";
import { createUserPayload, findRoleLabel, PartialUser, Roles } from "../../../../models/User";
import { difference, hasRoles } from "../../../../../utils/utils";
import { getCurrentUser, getNewPassword } from "../../store/selectors/users.selectors";
import { getRouterData, selectCustomRouteParam } from "../../../../core/router/store/router.selectors";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FileService } from "../../../../components/upload-image/services/file.service";
import { concatMap, map, mergeMap, of, Subject, takeUntil, pairwise, Observable } from "rxjs";
import { FileUploadComponent } from "../../../../components/upload-image/file-upload.component";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { getRoleNames } from "../../store/selectors/roleNames.selectors";
import { getProfileUser } from "../../../../core/profile/store/profile.selectors";
import { ModalComponent, ModalDialogData } from "../../../../components/modal/modal.component";
import { changeUserPassword } from "../../store/actions/users.actions";

interface ChangePasswordForm {
  newPassword: FormControl,
  confirmNewPassword: FormControl
}

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, InputComponent, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatSelectModule, FileUploadComponent, MatDialogModule],
  template: `

    <form [formGroup]="userForm" autocomplete="off">
      <div class="grid gap-3">

        <div class="flex flex-row gap-4 p-2" [ngClass]="{ 'bg-white rounded-md default-shadow' : viewOnly() }">
          <div class="flex flex-col basis-1/6">
            <app-file-upload [ngClass]="{'pointer-events-none' : viewOnly() || userForm.getRawValue().avatarUrl }"
                             [mainImage]="f.avatarUrl.value!" [multiple]="false" label="Foto profilo"
                             (onUpload)="onUploadMainImage($event)" (onDeleteMainImage)="removeProfilePic()"
                             [onlyImages]="true"/>
          </div>

          <div *ngIf="!viewOnly() && userForm.getRawValue().avatarUrl" class="flex flex-col basis-1/6 gap-2">
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

          <div *ngIf="viewOnly() && (roleNames$ | async) as roleNames">
            <div>
              <div class="text-4xl pt-6 pb-4 font-extrabold"> {{ userForm.getRawValue().username }}</div>
              <div class="text-2xl pb-2"> {{ userForm.getRawValue().email }}</div>
            </div>
            <div class="flex gap-2">
              <div *ngFor="let role of userForm.getRawValue().roles"
                   class="whitespace-nowrap bg-gray-100 text-sm px-2 py-1 rounded">{{ findRoleLabel(roleNames, role) }}
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="!viewOnly()" class="grid gap-3" [ngClass]="isNewUser ? ('grid-cols-2') : ('grid-cols-3')">
          <div class="flex flex-row relative">
            <app-input [formControl]="f.username" formControlName="username" label="username" id="user-username" type="text" class="w-full" [style.box-shadow]=""/>
            <div *ngIf="!isNewUser" class="changePsswBtn">
              <div *ngIf="hasRoles(currentUser!, [{ role: Roles.ADMIN }]) || canChangePassword" class="flex items-center justify-center rounded cursor-pointer h-12 w-12" (click)="editPassword()">
                <mat-icon class="icon-size material-symbols-rounded cursor-pointer">key_vertical</mat-icon>
              </div>
            </div>
          </div>

<!--          <div>-->
<!--            <app-input [formControl]="f.username" formControlName="username" label="username" id="user-username"-->
<!--                       type="text"/>-->
<!--          </div>-->

          <div>
            <app-input [formControl]="f.email" formControlName="email" label="email" id="user-email" type="email"/>
          </div>

          <div class="flex flex-col">
            <label for="user-role" class="text-md justify-left block px-3 py-0 font-medium"
                   [ngClass]="f.roles.invalid && f.roles.dirty ? ('text-red-800') : ('text-gray-900')">
              ruoli
            </label>
            <div
              class="w-full flex shadow-md bg-foreground text-gray-900 text-sm rounded-lg border-input focus:outline-none p-3 font-bold"
              [ngClass]="{'viewOnly' : viewOnly()}">
              <mat-select id="user-role" [multiple]="true" [formControl]="f.roles" placeholder="seleziona">
                <mat-option *ngFor="let role of roleNames$ | async as roles" [value]="role.name">{{ role.label }}
                </mat-option>
              </mat-select>
            </div>
          </div>

          <div class="flex flex-row gap-2 w-full">
            <div *ngIf='isNewUser' class="relative flex flex-col w-full">
              <app-input [type]="showPassword ? 'text' : 'password'" [formControl]="f.password"
                         autocomplete="new-password" formControlName="password" label="password"
                         id="user-generate-password" type="password"/>
              <button (click)="togglePassword()" type="button"
                      class="absolute end-0.5 -bottom-1.5 rounded-lg text-sm px-4 py-3 items-center">
                <mat-icon class="material-symbols-rounded">visibility{{ showPassword ? '_off' : '' }}</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>

    <ng-template #changePasswordTemplate>
      <form [formGroup]="changePasswordForm">
        <div class="flex flex-row gap-1">
          Scegli una nuova password per l'utente
          <div class="font-bold">{{f.username.value}}</div>
        </div>
        <div class="relative flex flex-col w-full p-2.5">
          <app-input [type]="showPassword ? 'text' : 'password'" [formControl]="passwordForm.newPassword" label="nuova password" id="change-password"/>
          <button (click)="togglePassword()" type="button" class="rounded-lg text-sm px-4 py-3 items-center end-0.5 showPsswBtnModal">
            <mat-icon class="material-symbols-rounded">visibility{{showPassword ? '_off' : ''}}</mat-icon>
          </button>
        </div>
        <div class="relative flex flex-col w-full p-2.5">
          <app-input label="conferma password" id="confirm-change-password" [type]="showConfirmPassword ? 'text' : 'password'"  [formControl]="passwordForm.confirmNewPassword"/>
          <button (click)="toggleConfirmPassword()" type="button" class="rounded-lg text-sm px-4 py-3 items-center end-0.5 showPsswBtnModal">
            <mat-icon class="material-symbols-rounded">visibility{{showConfirmPassword ? '_off' : ''}}</mat-icon>
          </button>
        </div>
      </form>
    </ng-template>
  `,
  styles: [`
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
  `]
})
export default class EditUserComponent implements OnInit, OnDestroy {
  @ViewChild("changePasswordTemplate") changePasswordTemplate: TemplateRef<any> | undefined;

  fb = inject(FormBuilder);
  store: Store<AppState> = inject(Store);
  imageService = inject(FileService);
  roleNames$ = this.store.select(getRoleNames);

  subject = new Subject();

  dialog = inject(MatDialog);

  active$ = this.store.select(getCurrentUser)
    .pipe(takeUntilDestroyed());

  isFormValid$: Observable<boolean>;

  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));

  profileId: number = 0;
  currentUser: PartialUser | undefined;

  userForm = this.fb.group({
    username: [{ value: "", disabled: this.viewOnly() }, Validators.required],
    password: [{ value: "", disabled: this.viewOnly() }],
    email: [{ value: "", disabled: this.viewOnly() }, Validators.required],
    roles: [[""], Validators.required],
    avatarUrl: [""]
  });

  changePasswordForm: FormGroup<ChangePasswordForm>;

  initFormValue: PartialUser = {};
  showPassword = false;
  showConfirmPassword = false;

  constructor() {
    this.changePasswordForm = this.fb.group({
      newPassword: [{ value: "" }, [Validators.required, Validators.min(1)]],
      confirmNewPassword: [{ value: "" }, [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    })

    this.isFormValid$ = this.changePasswordForm.statusChanges.pipe(
      map(() => this.changePasswordForm.valid),
      takeUntil(this.subject)
    );

    this.isFormValid$.subscribe((change) => {
        if(change){
          this.store.dispatch(UserActions.editChangePasswordForm({ newPassword: this.passwordForm.newPassword.value }));
        } else {
          this.store.dispatch(UserActions.clearChangePasswordForm());
        }
      }
    );

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
    return (this.profileId === +this.id());
  }

  get passwordForm() {
    return this.changePasswordForm.controls;
  }

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
          roles: ((value as PartialUser).roles ?? []).map((r) => r.roleName)
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
      map(([_, newState]) => {
        if(!Object.values(this.initFormValue).length && !this.isNewUser) {
          return {};
        }
        const diff = {
          ...difference(this.initFormValue, newState),

          // Array data
          roles: newState.roles
        };

        return createUserPayload(diff, this.initFormValue.roles ?? []);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.userForm.invalid ? { ...changes, id: +this.id() } : {}),
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
      concatMap(formData => this.imageService.uploadImage(formData)),
      takeUntil(this.subject)
    ).subscribe(res => {
        this.userForm.patchValue({ avatarUrl: res.url });
    });

  }

  removeProfilePic() {
    this.userForm.patchValue({ avatarUrl: '' });
  }

  onUploadMainImage(images: string[]) {
    this.userForm.patchValue({ avatarUrl: images[0] });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  editPassword() {
    this.changePasswordForm.reset();

    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      data: <ModalDialogData> {
        title: "Cambia Password",
        templateContent: this.changePasswordTemplate,
        buttons: [
          { iconName: "check", label: "Conferma", bgColor: "confirm",  onClick: () => dialogRef.close(true), selectors: { disabled: getNewPassword } },
          { iconName: "clear", label: "Annulla",  onClick: () => dialogRef.close(false) }
        ]
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if(!!result) {
        if(this.profileId === +this.id()) {
          this.store.dispatch(changeUserPassword({ id: this.profileId }));
        } else {
          this.store.dispatch(changeUserPassword({ id: +this.id() }));
        }
      }
      this.store.dispatch(UserActions.clearChangePasswordForm());
    });
  }

  ngOnDestroy(): void {
    this.userForm.reset();

    this.store.dispatch(UserActions.clearUserActive());
    this.store.dispatch(UserActions.clearUserHttpError());
  }

  protected readonly findRoleLabel = findRoleLabel;
  protected readonly hasRoles = hasRoles;
  protected readonly Roles = Roles;
}
