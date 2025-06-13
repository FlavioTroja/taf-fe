import {Component, inject, OnInit, Signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogModule } from "@angular/material/dialog";
import {Store} from "@ngrx/store";
import {AppState} from "../../../../app.config";
import {concatMap, mergeMap, of, Subject} from "rxjs";
import {takeUntilDestroyed, toSignal} from "@angular/core/rxjs-interop";
import {getRouterData, selectCustomRouteParam} from "../../../../core/router/store/router.selectors";
import {map, pairwise, takeUntil} from "rxjs/operators";
import * as ResourceActions from "../../../resources/store/actions/resources.actions";
import {difference} from "../../../../../utils/utils";
import {getCurrentResource} from "../../store/selectors/resources.selector";
import {createResourcePayload, PartialResource} from "../../../../models/Resource";
import {InputComponent} from "../../../../components/input/input.component";
import {FileUploadComponent} from "../../../../components/upload-image/file-upload.component";
import {FileService} from "../../../../components/upload-image/services/file.service";

@Component({
  selector: 'app-resource-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatSelectModule, MatDialogModule, InputComponent, FileUploadComponent],
  templateUrl: `edit-resource.component.html`,
  styles: [``]
})
export default class EditResourceComponent implements OnInit {
  store: Store<AppState> = inject(Store);
  imageService = inject(FileService);
  subject = new Subject();

  fb = inject(FormBuilder);

  active$ = this.store.select(getCurrentResource)
    .pipe(takeUntilDestroyed());

  id = toSignal(this.store.select(selectCustomRouteParam("id")));
  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));

  resourceForm = this.fb.group({
    name: [{ value: "", disabled: this.viewOnly() }, [Validators.required, Validators.maxLength(256)]],
    hourlyCost: [{ value: "", disabled: this.viewOnly() }, [Validators.required]],
    image: [""]
  });

  initFormValue: PartialResource = {};

  get f() {
    return this.resourceForm.controls;
  }

  get isNewResource() {
    return this.id() === "new";
  }

  ngOnInit() {
    if (!this.isNewResource) {
      this.store.dispatch(
        ResourceActions.getResource({ id: this.id() })
      );
    }

    this.active$
      .subscribe((value: PartialResource | any) => {
        if(!value) {
          return;
        }

        this.resourceForm.patchValue(value);

        this.initFormValue = this.resourceForm.value as PartialResource;
      });

    this.editResourceChanges();

  }

  editResourceChanges() {
    this.resourceForm.valueChanges.pipe(
      pairwise(),
      map(([_, newState]) => {
        if(!Object.values(this.initFormValue).length && !this.isNewResource) {
          return {};
        }

        const diff = {
          ...difference(this.initFormValue, newState),
        };

        return createResourcePayload(diff);
      }),
      map((changes: any) => Object.keys(changes).length !== 0 && !this.resourceForm.invalid ? { ...changes, id: +this.id() } : {}),
      takeUntil(this.subject),
      // tap(changes => console.log(changes)),
    ).subscribe((changes: any) => this.store.dispatch(ResourceActions.resourceActiveChanges({ changes })));
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
      this.resourceForm.patchValue({ image: res.url });
    });

  }

  removeProfilePic() {
    this.resourceForm.patchValue({ image: '' });
  }

  onUploadMainImage(images: string[]) {
    this.resourceForm.patchValue({ image: images[0] });
  }
}
