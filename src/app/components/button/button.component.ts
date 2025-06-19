import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, TemplateRef } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MemoizedSelector, Store } from "@ngrx/store";
import { filter, map, Subject, takeUntil } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { TooltipOpts } from "../../../global";
import { AppState } from "../../app.config";

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [ CommonModule, MatIconModule, MatTooltipModule ],
  template: `
    <div
        *ngIf="!hidden"
         class="flex gap-1 items-center bg-foreground rounded-full px-4 py-2 default-shadow-hover cursor-pointer"
         (click)="click()"
         [ngClass]="{
         'opacity-50 pointer-events-none' : disabled,
         'bg-foreground': bgColor === '',
         'remove-element': bgColor === 'remove',
         'confirm-element': bgColor === 'confirm',
         'accent': bgColor === 'success'
         }"
         [matTooltip]="tooltipOpts?.text || ''"
         [matTooltipPosition]="tooltipOpts?.position || 'below'"
    >
      <mat-icon *ngIf="!isLoading" class="icon-size material-symbols-rounded cursor-pointer">{{ iconName }}
      </mat-icon>
      <mat-icon *ngIf="isLoading" class="icon-size material-symbols-rounded cursor-pointer animate-spin">
        progress_activity
      </mat-icon>
      <div *ngIf="label" class="font-bold">{{ label }}</div>
      <ng-container *ngIf="extraContent" [ngTemplateOutlet]="extraContent" />
    </div>
  `,
  styles: [`
    .remove-element {
      background-color: var(--modal-remove-element);
      color: #FFFFFFE5;
    }

    .confirm-element {
      background-color: rgb(var(--taf-accent));
      color: #FFFFFFE5;
    }
  `]
})
export class ButtonComponent implements OnChanges {
  @Input({ required: true }) iconName: string = "";
  @Input({ required: false }) selectors: {
    hidden?: MemoizedSelector<any, any>,
    disabled?: MemoizedSelector<any, any>,
    isLoading?: MemoizedSelector<any, any>
  } | undefined;
  @Input({ required: false }) label: string = "";
  @Input({ required: false }) bgColor: string = "";
  @Input({ required: false }) extraContent?: TemplateRef<any>;
  @Input({ required: false }) tooltipOpts?: TooltipOpts;

  @Output() onClick = new EventEmitter<string>();

  store: Store<AppState> = inject(Store);
  subject = new Subject();
  disabled: boolean = false;
  isLoading: boolean = false;
  hidden: boolean = false;

  ngOnChanges(): void {
    if(this.selectors?.disabled) {
      this.subscribeSelector(this.selectors.disabled, (res) => this.disabled = res);
    }

    if(this.selectors?.isLoading) {
      this.store.select(this.selectors.isLoading).pipe(
        debounceTime(150),
        takeUntil(this.subject)
      ).subscribe(res => {
        this.isLoading = res;
      });
    }

    if(this.selectors?.hidden) {
      this.subscribeSelector(this.selectors.hidden, (res) => this.hidden = res);
    }

  }

  click() {
    if(this.disabled) {
      return;
    }
    this.onClick.emit();
  }

  // Subscribe selector that return object
  subscribeSelector(selector: MemoizedSelector<any, any>, callback: (res: any) => void) {
    this.store.select(selector).pipe(
      debounceTime(150),
      filter(res => !!res),
      map(res => Object.keys(res).length === 0),
      takeUntil(this.subject)
    ).subscribe(res => {
      callback(res);
    });
  }


}
