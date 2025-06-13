import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../app.config";
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { debounceTime } from "rxjs/operators";
import * as TaskStepsActions from "../../../store/actions/task-steps.actions";
import { AttachmentsComponent } from "../../../../../components/attachments/attachments.component";
import { TaskStepFormOnCompletion } from "../../../../../models/TaskSteps";

@Component({
  selector: 'app-complete-task-step-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AttachmentsComponent],
  template: `
    <div class="flex flex-col gap-2 pb-2" [formGroup]="taskStepCompletionForm">
      <div class="bg-light-gray px-2 py-3 flex flex-col rounded-md">
        <span>allegati*</span>
        <div class="overflow-x-auto default-shadow">
          <app-attachments
            [onlyImages]="false"
            [isSmallerUploader]="true"
            title="allegati"
            label="aggiungi allegato"
            [attachmentList]="getAttachmentsObjectList(getAttachments)"
            [currentAttachment]="getAttachments"
            (onUpload)="onUploadAttachmentFiles($event)"
            (onDeleteAttachment)="deleteAttachment($event)">
          </app-attachments>
        </div>
      </div>

      <div class="bg-light-gray px-2 py-3 flex flex-col rounded-md">
        <span>feedback</span>
        <textarea class="focus:outline-none p-3 rounded-md w-full shadow-md" formControlName="feedback" rows="5">

        </textarea>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class CompleteTaskStepModalComponent implements OnInit {
  @Input()taskStepId!: number;

  store: Store<AppState> = inject(Store);
  fb = inject(FormBuilder);
  subject = new Subject();

  taskStepCompletionForm = this.fb.group({
    id: [0],
    feedback: ["", Validators.required],
    attachments: this.fb.array([]),
    endDate: [new Date().toISOString(), Validators.required],
  })

  get f() {
    return this.taskStepCompletionForm.controls;
  }

  get attachments(): FormArray {
    return this.taskStepCompletionForm.get("attachments") as FormArray;
  }

  get getAttachments(): string[] {
    return this.f.attachments.value as string[] || [];
  }

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

  initializeAttachments(attachmentsArray: string[]): void {
    this.attachments.clear();

    attachmentsArray.forEach(() => this.attachments.push(
      this.fb.control("")
    ));
  }

  onUploadAttachmentFiles(images: string[]) {
    this.initializeAttachments(images);

    this.taskStepCompletionForm.patchValue({
      attachments: images
    });
  }

  deleteAttachment(i: number): void {
    this.attachments.removeAt(i);
  }

  ngOnInit() {
    this.f.id.patchValue(this.taskStepId);

    this.taskStepCompletionForm.valueChanges.pipe(
      debounceTime(200),
      takeUntil(this.subject),
    ).subscribe(form => {
      if(!form || this.taskStepCompletionForm.invalid) {
        this.store.dispatch(TaskStepsActions.clearTaskStepCompletionActiveChanges());
        return;
      }

      this.store.dispatch(TaskStepsActions.taskStepCompletionFormActiveChanges({ changes: form as TaskStepFormOnCompletion }));
    });
  }
}
