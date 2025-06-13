import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HyperPillComponent } from "../../../../../components/pill/hyper-pill.component";
import { MatIconModule } from "@angular/material/icon";
import { AttachmentsComponent } from "../../../../../components/attachments/attachments.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TaskStep } from "../../../../../models/TaskSteps";

@Component({
  selector: 'app-task-step-details-modal',
  standalone: true,
  imports: [CommonModule, HyperPillComponent, MatIconModule, AttachmentsComponent, FormsModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-2 pb-2">
      <div class="flex gap-1">
        Dettagli della fase svolta <span class="font-extrabold">{{ taskStepLabel }}</span> del lavoro per <span class="font-extrabold">{{ username }}</span>
      </div>
      <div class="p-2 bg-[#F5F5F5] flex flex-col gap-1">
        <span class="font-extrabold">INFORMAZIONI</span>
        <app-hyper-pill iconName="person_apron" [text]="username" />
        <div class="flex flex-col gap-1">
          <div class="flex gap-1">
            <mat-icon class="material-symbols-rounded">circle</mat-icon>
            <span class="text-sm">presa in carico</span>
            <span class="font-extrabold">{{ taskStep.startDate | date: 'dd/mm/yyy' }}</span>
            <span *ngIf="taskStep.startDate">- {{ taskStep.startDate | date: 'hh:mm' }}</span>
          </div>

          <div class="flex gap-1 ">
            <mat-icon class="material-symbols-rounded">check</mat-icon>
            <span class="text-sm">completamento</span>
            <span class="font-extrabold">{{ taskStep.endDate | date: 'dd/mm/yyy' }}</span>
            <span *ngIf="taskStep.endDate">- {{ taskStep.endDate | date: 'hh:mm' }}</span>
          </div>
        </div>
      </div>

      <div class="p-2 bg-[#F5F5F5] flex flex-col gap-1">
        <span class="font-extrabold">ALLEGATI</span>
        <div class="overflow-x-auto default-shadow">
          <app-attachments
            [onlyImages]="false"
            [isSmallerUploader]="true"
            title="allegati"
            label="aggiungi allegato"
            [attachmentList]="getAttachmentsObjectList(taskStep.attachments)"
            [currentAttachment]="taskStep.attachments"
            [viewOnly]="true">
          </app-attachments>
        </div>
      </div>

      <div class="bg-[#F5F5F5] px-2 py-3 flex flex-col rounded-md">
        <span class="font-extrabold">COMMENTO</span>
        <div class="bg-foreground rounded-md w-full shadow-md h-40 p-2">
            {{ taskStep.feedback }}
        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class TaskStepDetailsModalComponent {
  @Input({ required: true }) taskStep!: TaskStep;
  @Input({ required: true }) username: string = "";
  @Input({ required: true }) taskStepLabel: string = "";

  getAttachmentsObjectList(attachments: string[]) {
    return attachments.map(url => {
      const arr = (url as string).split(".");
      return {
        value: url,
        type: arr[arr.length - 1],
        name: arr[arr.length - 2] + arr[arr.length - 1]
      };
    });
  }
}
