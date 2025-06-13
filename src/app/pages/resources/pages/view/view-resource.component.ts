import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { NgxBarcode6Module } from "ngx-barcode6";
import { MatDialogModule } from "@angular/material/dialog";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSelectModule } from "@angular/material/select";
import {Store} from "@ngrx/store";
import {AppState} from "../../../../app.config";
import {toSignal} from "@angular/core/rxjs-interop";
import {selectCustomRouteParam} from "../../../../core/router/store/router.selectors";
import {getCurrentResource} from "../../store/selectors/resources.selector";
import * as ResourceActions from "../../../resources/store/actions/resources.actions";
import {MatTooltipModule} from "@angular/material/tooltip";
import {ShowImageComponent} from "../../../../components/show-image/show-image.component";

@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    NgxBarcode6Module,
    MatDialogModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTooltipModule,
    ShowImageComponent
  ],
  template: `
    <div class="flex flex-col gap-2" *ngIf="active() as resource">
      <div class="bg-white default-shadow p-2 rounded-md">
        <div class="flex flex-row gap-2.5">
          <app-show-image classes="w-56 h-56" [imageUrl]="resource.image" [objectName]="resource.name"/>
          <div class="flex flex-col justify-start">
            <div class="text-4xl pt-6 pb-4 font-extrabold self-center"> {{ resource.name }} </div>
            <div *ngIf="resource.hourlyCost" class="bg-gray-100 rounded-full max-w-max py-1 px-2 flex justify-between items-center">
              <mat-icon class="material-symbols-rounded">
                <span>euro_symbol</span>
              </mat-icon>
              <span class="px-1">{{ resource.hourlyCost }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []

})
export default class ViewResourceComponent implements OnInit {
  store: Store<AppState> = inject(Store);
  active = this.store.selectSignal(getCurrentResource);
  id = toSignal(this.store.select(selectCustomRouteParam("id")));

  ngOnInit() {
    this.store.dispatch(
      ResourceActions.getResource({ id: this.id()})
    );
  }
}
