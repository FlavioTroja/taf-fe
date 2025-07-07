import { CommonModule } from '@angular/common';
import { Component, inject, Input, Signal } from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";
import { FormArray, FormBuilder, FormControl, Validators } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { Store } from "@ngrx/store";
import { map } from "rxjs";
import { AppState } from "../../app.config";
import { getRouterData } from "../../core/router/store/router.selectors";
import { InputComponent } from "../input/input.component";

@Component({
  selector: 'app-add-tag-form-array',
  standalone: true,
  imports: [ CommonModule, InputComponent, MatIconModule ],
  template: `
    <div class="flex w-full flex-col gap-2">
      <div class="flex items-center justify-between w-1/2">
        <div>Tags:</div>
        <div>
          <button type="submit"
                  [disabled]="viewOnly()"
                  (click)="addTag()"
                  [ngClass]="{ 'disabled': viewOnly() }"
                  class="focus:outline-none p-2 rounded-full w-full border-input bg-foreground flex items-center"
          >
            <mat-icon class="align-to-center icon-size material-symbols-rounded">add</mat-icon>
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-2 w-1/2 p-1 overflow-y-scroll h-96">
        <div *ngFor="let a of form.controls; index as i" class="relative tag">
          <app-input
            type="text"
            id="tags"
            label=""
            [formControl]="a"
          />
          <button type="button" *ngIf="!viewOnly()" class="close-icon hidden absolute top-1/4 right-1"
                  (click)="removeTag(i)">
            <mat-icon class="align-to-center icon-size material-symbols-rounded">close</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [ `
    .tag:hover .close-icon {
      display: block !important;
    }
  ` ]
})
export class AddTagFormArrayComponent {
  store: Store<AppState> = inject(Store);
  fb = inject(FormBuilder);

  @Input() form!: FormArray<FormControl<string | null>>;

  addTag() {
    this.form.push(this.fb.control('', Validators.required) as FormControl);
  }

  removeTag(i: number) {
    this.form.removeAt(i);
  }

  viewOnly: Signal<boolean> = toSignal(this.store.select(getRouterData).pipe(
    map(data => data!["viewOnly"] ?? false)
  ));

}
