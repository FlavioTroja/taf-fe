import { Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { isUndefined } from "lodash-es";

@Injectable()
export class CustomValidators {
  static notEmpty(control: FormControl) {
    if (isUndefined(control.value?.length)) {
      return { "isEmpty": true };
    }

    return !control.value.length ? { "isEmpty": true } : null;
  }
}
