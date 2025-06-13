import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  inject, Input,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompleteTaskStepModalComponent } from "./complete-task-step-modal.component";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../../app.config";
import { Subject } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { ModalComponent, ModalDialogData } from "../../../../../components/modal/modal.component";
import { concatLatestFrom } from "@ngrx/effects";
import { takeUntil } from "rxjs/operators";
import * as TaskStepsActions from "../../../store/actions/task-steps.actions";
import { getTaskStepCompletionFormActiveChanges } from "../../../store/selectors/task-steps.selectors";
import { TaskStep, TaskStepFormOnCompletion } from "../../../../../models/TaskSteps";

@Component({
  selector: 'app-complete-task-step-section',
  standalone: true,
  imports: [CommonModule, CompleteTaskStepModalComponent],
  template: `
    <!-- What is passed inside here will trigger handleTaskStepCompletion -->
    <ng-content></ng-content>

    <ng-template #completeTaskStepModalSection>
      <app-complete-task-step-modal [taskStepId]="taskStep.id!"/>
    </ng-template>
  `,
  styles: [
  ]
})
export class CompleteTaskStepSectionComponent implements AfterViewInit {
  /** READ HERE: In order to use this component you'll have to bind the
   *  ElementRef (#taskStepCompletionModalClickableButton) in one of the tags
   *  inside where this component is used */

  @ViewChild("completeTaskStepModalSection") completeTaskStepModalSection: TemplateRef<any> | undefined;

  @ContentChild('taskStepCompletionModalClickableButton', { static: false }) taskStepCompletionModalClickableButton!: ElementRef;

  @Input({ required: true }) taskStep!: TaskStep;

  ngAfterViewInit() {
    if (this.taskStepCompletionModalClickableButton) {
      this.taskStepCompletionModalClickableButton.nativeElement.addEventListener('click', () => {
        this.handleTaskStepCompletion();
      });
    }
  }

  store: Store<AppState> = inject(Store);

  subject = new Subject();
  dialog = inject(MatDialog);

  handleTaskStepCompletion() {
    const dialogRef: any = this.dialog.open(ModalComponent, {
      backdropClass: "blur-filter",
      width: "800px",
      data: <ModalDialogData> {
        title: "Completa mansione",
        content: ``,
        templateContent: this.completeTaskStepModalSection,
        buttons: [
          { iconName: "check", label: "Completa", bgColor: "confirm",  onClick: () => dialogRef.close(true), selectors: { disabled: getTaskStepCompletionFormActiveChanges } },
          { iconName: "clear", label: "Annulla",  onClick: () => dialogRef.close(false) }
        ]
      }
    });

    dialogRef.afterClosed().pipe(
      concatLatestFrom(() => [ this.store.select(getTaskStepCompletionFormActiveChanges) ]),
      takeUntil(this.subject)
    ).subscribe(([ result, current ]: any) => {
      if(!result) {
        this.store.dispatch(TaskStepsActions.clearTaskStepCompletionActiveChanges());

        return;
      }
      this.store.dispatch(TaskStepsActions.completeTaskStep({ taskStepForm: current as TaskStepFormOnCompletion}));

      this.store.dispatch(TaskStepsActions.clearTaskStepCompletionActiveChanges());
    });
  }
}
