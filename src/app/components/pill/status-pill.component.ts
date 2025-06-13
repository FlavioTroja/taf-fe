import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

interface PillConfig {
  iconName: string;
  text: string;
  containerClass: string;
}

@Component({
  selector: 'app-status-pill',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="flex max-w-max px-2 py-1.5 gap-1 items-center break-keep cursor-default rounded-full shadow-md"
         [ngClass]="getContainerClass">
      <div class="pr-1 flex self-center">
        <mat-icon class="material-symbols-rounded">
          {{ getIconName }}
        </mat-icon>
      </div>
      <div class="whitespace-nowrap text-sm pr-0.5 text-ellipsis overflow-hidden" style="max-width: 19rem">
        {{ getText }}
      </div>
    </div>
  `,
  styles: [``]
})
export class StatusPillComponent {
  @Input({ required: false }) status: string = "";

  @Input({ required: false }) text?: string;
  @Input({ required: false }) iconName?: string;
  @Input({ required: false }) containerClass?: string;

  statusArray: { [key: string]: PillConfig } = {
    "ACCEPTED": { iconName: "check", text: "confermato", containerClass: "accent" },
    "PENDING": { iconName: "nest_clock_farsight_analog", text: "in attesa", containerClass: "warning" },
    "REJECTED": { iconName: "close", text: "rifiutato", containerClass: "error" },
    "DONE": { iconName: "check", text: "completato", containerClass: "green-buttons" },
    "DRAFT": { iconName: "edit_note", text: "Bozza", containerClass: "draft" },
    "QUOTE": { iconName: "sell", text: "Preventivo inviato", containerClass: "accent" },
    "SIMPLE": { iconName: "sentiment_calm", text: "semplice", containerClass: "bg-light-gray shadow-none" },
    "NORMAL": { iconName: "sentiment_neutral", text: "normale", containerClass: "bg-light-gray shadow-none" },
    "COMPLEX": { iconName: "sentiment_worried", text: "complesso", containerClass: "bg-light-gray shadow-none" },
    "SETUP": { iconName: "category_search", text: "Allestimento", containerClass: "bg-light-gray" },
    "SERVICE": { iconName: "design_services", text: "Servizi", containerClass: "bg-light-gray" },
    "CONFIRMED": { iconName: "check_circle", text: "Confermato", containerClass: "setup-confirmed-bg setup-confirmed-color" },
    "CANCELED": { iconName: "delete", text: "Annullato", containerClass: "error" },
  };

  get getIconName(): string {
    return this.iconName || this.statusArray[this.status]?.iconName  || "";
  }

  get getText(): string {
    return  this.text || this.statusArray[this.status]?.text || "";
  }

  get getContainerClass(): string {
    return this.containerClass || this.statusArray[this.status]?.containerClass || "";
  }
}
