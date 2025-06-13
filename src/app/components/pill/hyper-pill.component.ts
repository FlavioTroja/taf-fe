import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

/** components for a custom pill with icon and onClick event */
@Component({
  selector: 'app-hyper-pill',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div
      class="bg-foreground default-shadow rounded-full max-w-max px-2 py-1.5 flex gap-1 items-center break-keep cursor-pointer"
      (click)="handleOnClick()"
      [matTooltip]="tooltipText">
      <div class="pr-1 flex self-center">
        <mat-icon class="material-symbols-rounded">{{ iconName }}</mat-icon>
      </div>
      <div class="{{isTextBold && 'font-bold'}} whitespace-nowrap text-sm pr-0.5 text-ellipsis overflow-hidden">
        {{ ellipsis ? truncatePillText(text) : text }}
      </div>
    </div>
  `,
  styles: [``]
})
export class HyperPillComponent {
  /** identifier of the single components in case of onClick event */
  @Input({ required: false }) id: string = "";
  /** text to be visualized in the pill */
  @Input({ required: false }) text: string = "";
  /** text of tooltip */
   @Input({ required: false }) tooltipText: string = "";
  /** icon of the pill, uses mat-icons */
  @Input({ required: false }) iconName: string = "";
  /** turn the ellipsis on (max char 16) */
  @Input({ required: false }) ellipsis: boolean = false;
  /** turn text into bold if true */
  @Input({ required: false }) isTextBold: boolean = true;

  @Output() onClick = new EventEmitter<string>();

  /** truncate the text of the pill for not overflowing the pill */
  truncatePillText(row: string) {
    return row.length > 16 ? row.substring(0, 12) +'...' : row;
  }

  /** Will throw "onClick" event with the given ID */
  handleOnClick() {
    this.onClick.emit(this.id);
  }
}
