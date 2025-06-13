import { NativeDateAdapter } from '@angular/material/core';

export class CustomDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number {
      return 1;
  }
}

export const CUSTOM_DATE_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY', 
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};
