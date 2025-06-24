import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, FormsModule ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <label [for]="id" class="text-md justify-left block px-3 py-0 font-medium"
           [ngClass]="formControl?.invalid && formControl?.dirty ? ('text-red-800') : ('text-gray-900')"
           [innerHTML]="label">
    </label>
    <div class="relative">
      <input class="focus:outline-none p-3 rounded-md w-full border-input"
             [ngClass]="{'border-input-error' : formControl?.invalid && formControl?.dirty, 'viewOnly' : disabled}"
             [id]="id" [value]="value"
             [type]="type"
             [(ngModel)]="value"
             [disabled]="disabled"
             [autocomplete]="autocomplete"
             [placeholder]="placeholder"
             (input)="customOnChange(value)"
             (blur)="onTouched()"/>
      <span *ngIf="unitMeasure" class="absolute right-1 top-3">{{ unitMeasure }}</span>
    </div>
    <div *ngIf="formControl?.invalid && formControl?.dirty && !customValidator" class="px-3 py-1 text-xs text-red-800">
      {{ errorText }}
    </div>
  `,
  styles: [ `` ]
})
export class InputComponent implements ControlValueAccessor {
  @Input({ required: false }) formControl?: FormControl;
  @Input({ required: false }) disabled!: boolean;
  @Input({ required: true }) label: string = "";
  @Input({ required: true }) id: string = "";
  @Input({ required: true }) type: string = "text";
  @Input({ required: false }) autocomplete: string = "on";
  @Input({ required: false }) placeholder: string = "";
  @Input({ required: false }) customValidator: boolean = false;
  @Input({ required: false }) unitMeasure: string = "";

  value: string = "";
  onChange: any = (value: any) => {
  };
  onTouched: any = () => {
  };
  errorText: string = "";

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  customOnChange(value: any) {

    this.onChange(value);

    let errors = this.formControl?.errors
    if (!errors) return;
    /** errors obj example:
     * ### IS NOT AN ARRAY!
     * errors = {
     max: {max: 0, actual: '22'},
     maxlength: {requiredLength: 0, actualLength: 2},
     min: {min: 300, actual: '22'},
     }
     */
    this.setErrorText(Object.keys(errors)[0], Object.values(Object.values(errors)[0])[0]);
  }

  setErrorText(errorType: string, errorInput: any) {
    try {
      this.errorText = errorsTexts[errorType](`${ errorInput }`);
    } catch (error) {
      if (error instanceof TypeError) throw new Error(`Check if ${ errorType } is defined in the custom error texts`);
    }
  }
}

/**
 * custom error texts
 * @key a string that is the name of the error got from formControl.errors
 * @value a function where you could get in input a value that is the limit of the Validator \n
 * (e.g.: Validator.max(100) => the value '100' will get injected into the function and you can use that value into the string due to it)
 */
const errorsTexts: { [keys: string]: (value: string) => string } = {
  "min": (value: string) => {
    return `Il campo non può essere inferiore a ${ value }`
  },
  "max": (value: string) => {
    return `Il campo non può essere superiore a ${ value }`
  },
  "maxlength": (value: string) => {
    return `Il campo non deve superare i ${ value } caratteri`
  },
  "minlength": (value: string) => {
    return `Il campo non deve essere inferiore a ${ value } caratteri`
  },
  "pattern": (value: string) => {
    return value.includes('([+]39)') ? `Il numero di telefono non è valido` : `Campo non valido`
  },
  "email": () => {
    return `L'email non è valida`
  },
  "required": () => {
    return `Il campo è obbligatorio`
  },
}
