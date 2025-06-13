import { FormControl } from "@angular/forms";

export interface FilterOption {
  id: number,
  name: string,
  checked: boolean,
  dateInterval?: DateInterval 
}

export interface FilterElement {
  field: string,
  name: string,
  popUp: boolean,
  iconName: string,
  selectIds: number[],
  options: FilterOption[],
  searcher: boolean,
  datePicker?: boolean,
  dateIntervalPicker?: boolean,
  pickedDateInterval?: DateInterval,
  searchValue?: FormControl,
  onSelectedTab?: (elem: FilterElement) => void,
  onSelectOption?: (tabName: string, option: FilterOption) => void,
}

export interface DateInterval {
  from?: string,
  to?: string
}