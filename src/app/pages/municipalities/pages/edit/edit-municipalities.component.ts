import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-edit-municipalities',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule ],
  template: `
    <form [formGroup]="municipalityForm" autocomplete="off">
      <div class="flex flex-col"></div>
    </form>
  `
})
export default class EditMunicipalitiesComponent {
  fb = inject(FormBuilder);

  municipalityForm: FormGroup = this.fb.group({});
}
