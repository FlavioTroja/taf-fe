import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  inject,
  Input,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStepDetailsModalComponent } from "./task-step-details-modal.component";
import { ModalComponent, ModalDialogData } from "../../../../../components/modal/modal.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../app.config";
import { Subject } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { mapTaskStepType, TaskStep, TaskStepType } from "../../../../../models/TaskSteps";

@Component({
  selector: 'app-task-step-details-section',
  standalone: true,
  imports: [CommonModule, TaskStepDetailsModalComponent],
  template: `
    <ng-content></ng-content>

    <ng-template #viewTaskStepDetails>
      <app-task-step-details-modal [taskStepLabel]="getTaskStepLabel(taskStep.type)!"
                                   [username]="taskStep.user?.username!"
                                   [taskStep]="taskStep"></app-task-step-details-modal>
    </ng-template>
  `,
  styles: [
  ]
})
export class TaskStepDetailsSectionComponent implements AfterViewInit {

  @ViewChild("viewTaskStepDetails") viewTaskStepDetails: TemplateRef<any> | undefined;

  @ContentChild('taskStepCompletionModalClickableButtonOnDetails', { static: false }) taskStepCompletionModalClickableButton!: ElementRef;

  @Input({ required: true }) taskStep!: TaskStep;
  @Input({ required: true }) taskStepLabel: string = "";

  store: Store<AppState> = inject(Store);

  subject = new Subject();
  dialog = inject(MatDialog);

  ngAfterViewInit() {
    if (this.taskStepCompletionModalClickableButton) {
      this.taskStepCompletionModalClickableButton.nativeElement.addEventListener('click', () => {
        this.viewTaskStepDetailsDialog(this.taskStepLabel);
      });
    }
  }

  getTaskStepLabel(taskStepType: TaskStepType) {
    return mapTaskStepType.find(ts => ts.value === taskStepType)?.label;
  }

  viewTaskStepDetailsDialog(stepName: string) {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      width: "800px",
      data: <ModalDialogData> {
        title: `${stepName} - dettagli`,
        content: ``,
        templateContent: this.viewTaskStepDetails,
        buttons: [
          { iconName: "check", label: "Chiudi", bgColor: "confirm",  onClick: () => dialogRef.close(true) },
          // { iconName: "clear", label: "Annulla",  onClick: () => dialogRef.close(false) }
        ]
      }
    });
  }

}
