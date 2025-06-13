import { Setup } from "./Setup";
import { User } from "./User";
import { difference } from "../../utils/utils";

export interface Inspection {
  id: number;
  date: Date | string,
  inspectionStatus: InspectionStatus,
  rejectionReason?: string,
  description?: string,
  attachments?: string[],
  setupId: number,
  setup?: Setup,
  userId?: number,
  user?: User,
}

export type PartialInspection = Partial<Inspection>

export enum InspectionStatus {
  PENDING='PENDING',
  REJECTED='REJECTED',
  ACCEPTED='ACCEPTED',
  DONE='DONE'
}

export const mapInspectionStatus = [
  { value: InspectionStatus.PENDING, legendLabel: "in attesa", label: "in attesa" },
  { value: InspectionStatus.REJECTED, legendLabel: "rifiutati", label: "rifiutato" },
  { value: InspectionStatus.ACCEPTED, legendLabel: "confermati", label: "confermato" },
  { value: InspectionStatus.DONE, legendLabel: "completati", label: "completato" }
]

export interface InspectionFilter {
  value?: string,
  customers?: number[],
  users?: number[],
  inspectionStatus?: InspectionStatus[],
  dateFrom?: string | Date,
  dateTo?: string | Date,
  dueDateFrom?: string | Date,
  dueDateTo?: string | Date,
}

export interface InspectionTable {
  search?: string,
  dateFrom?: string,
  dateTo?: string,
  selectedDay?: number,
  typeValues?: string,
  pageIndex?: number,
  pageSize?: number,
  inspectionStatus?: InspectionStatus[],
}

export interface InspectionForm {
  description: string,
  attachments?: string[],
}

export interface InspectionStatusDTO {
  newStatus: InspectionStatus;
  rejectionReason?: string,
}

export interface InspectionStatusDetail {
  inspectionStatus: InspectionStatus;
  rejectionReason?: string,
  user?: User,
  userId?: number,
}

export interface InspectionDetails {
  description?: string,
  attachments?: string[],
}

export type PartialInspectionDetails = Partial<InspectionDetails>

export function createInspectionPayloadFromForm(formState: any, initialValue: Partial<InspectionForm>): InspectionForm {
  const partialInspectionForm = difference(initialValue, formState);

  partialInspectionForm.inspectionAttachments = formState.inspectionAttachments;
  partialInspectionForm.inspectionDescription = formState.inspectionDescription;

  return partialInspectionForm as InspectionForm;
}
