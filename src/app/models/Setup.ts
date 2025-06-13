import { Customer } from "./Customer";
import { Address } from "./Address";
import { Inspection, InspectionStatus } from "./Inspection";
import { difference } from "../../utils/utils";
import { Product } from "./Product";
import { Resource } from "./Resource";
import { Task } from "./Task";

export interface Setup {
  id: number,
  createdAt?: Date | string,
  updatedAt?: Date | string,
  complexity: number,
  dueDate: Date | string,
  quoteNumber: number,
  quoteYear: number,
  quoteCode: string,
  setupNumber?: number,
  setupYear?: number,
  setupCode?: string,
  setupStatus: SetupStatus,
  vat: number,
  totalTaxable: number,
  totalVat: number,
  totalAmount: number,
  isInspectionNeeded: boolean,
  title: string,
  description?: string,
  addressId: number,
  address?: Address,
  customerId: number,
  customer?: Customer,
  inspectionId?: number,
  inspection?: Inspection,
  participants: Participant[],
  attachments: string[],
  tasks: Task[],
  costs: Cost[]
}

export type PartialSetup = Partial<Setup>;

export enum SetupComplexity {
  SIMPLE = "SIMPLE",
  NORMAL = "NORMAL",
  COMPLEX = "COMPLEX"
}

export const mapSetupComplexity = [
  { rank: 0, complexity: SetupComplexity.SIMPLE, name: 'Semplice'},
  { rank: 50, complexity: SetupComplexity.NORMAL, name: 'Normale'},
  { rank: 100, complexity: SetupComplexity.COMPLEX, name: 'Complesso' }
]

export enum SetupStatus {
     DRAFT = "DRAFT",
     QUOTE = "QUOTE",
     CONFIRMED = "CONFIRMED",
     DONE = "DONE",
     CANCELED = "CANCELED",
     PLANNING = "PLANNING",
}

export interface SetupFilter {
  value?: string,
  customers?: number[],
  users?: number[],
  setupStatus?: SetupStatus[],
  inspectionsStatus?: InspectionStatus[],
  dueDateFrom?: Date | string,
  dueDateTo?: Date | string,
  createdFrom?: string | Date,
  createdTo?: string | Date
}

export interface SetupForm {
  id?: number,
  isInspectionNeeded?: boolean,
  customer?: Customer,
  customerId?: number,
  title: string,
  address?: Address,
  addressId?: number,
  date: string | Date,
  dueDate: string | Date,
  description: string,
  attachments?: string[],
  participants?: Participant[],
  tasks?: Task[],
}

export type PartialSetupForm = Partial<SetupForm>;

export interface PlanningSetupUpdate {
  id?: number,
  customer?: Customer,
  customerId?: number,
  title: string,
  address?: Address,
  addressId?: number,
  inspectionDate: string | Date,
  dueDate?: string | Date,
  description?: string,
  attachments?: string[],
  participants?: Participant[],
}

export type PartialPlanningSetupUpdate = Partial<PlanningSetupUpdate>;

export interface SetupCreate {
  isInspectionNeeded: boolean,
  description: string,
  customerId?: number,
  customer?: Customer,
  title: string,
  addressId?: number,
  address?: Address,
  dueDate?: Date | string,
  attachments?: string[],
  inspectionDate: string | Date,
  participants?: number[],
}

export interface Participant {
  id?: number,
  userId: number,
  toBeDisconnected?: boolean,
}

export interface SetupTable {
  search?: string,
  customers?: string,
  status?: SetupStatus[],
  dueDateFrom?: string | Date,
  dueDateTo?: string | Date,
  typeValues?: string,
  pageIndex?: number,
  pageSize?: number
}

export type Cost =  {
  id: number,
  productId?: number,
  product?: Product,
  resourceId?: number,
  resource?: Resource
  description?: string,
  quantity: number,
  price: number,
  unitOfMeasure: string,
  toBeDisconnected?: boolean
}

export interface SetupDraftForm {
  id?: number,
  customer: Customer,
  customerId: number,
  title: string,
  complexity: number,
  participants?: Participant[],
  dueDate: string | Date,
  description: string,
  attachments?: string[],
  totalTaxable: number,
  tasks: Task[],
  costs: Cost[]
}

export type PartialSetupDraftForm = Partial<SetupDraftForm>;

// export type SetUpDTO = SetUpCreate;

// export function createSetUpPayload(setUp: any): SetUpDTO {
//   const setUpDTO = {
//     id: setUp.id,
//     isInspectionNeeded: setUp.isInspectionNeeded,
//     description: setUp.description,
//     customer: setUp.customer,
//     customerId: setUp.customerId,
//     addressId: setUp.addressId,
//     address: setUp.address,
//     inspection: setUp.inspection,
//   }
//   return <SetUpDTO>omitBy(setUpDTO, overSome([isNil, isNaN]));
// }


function createParticipantsPayload(initParticipants: Participant[], newParticipants: number[]) {
  const participants = newParticipants.map(partId => ({
    id: initParticipants.find(p => p.userId === partId)?.id || -1,
    userId: partId
  })) || [];

  const deleted = initParticipants
    .filter(p => !participants.find(part => part.userId === p.userId))
    .map(p => ({ ...p, toBeDisconnected: true }));
  return [ ...participants, ...deleted ];
}

export function createSetupPayloadFromForm(formState: any, initialValue: PartialSetupForm): SetupForm {
  const partialSetupForm = difference(initialValue, formState);

  /* These IFs manage payload mapping for date and dueDate properties in order to not let inspectionStatus being changed to PENDING */
  if (formState.date instanceof Date && initialValue.date !== formState.date) {
    partialSetupForm.date = formState.date ? formState.date.toISOString() : undefined;
  }
  if (formState.dueDate instanceof Date && initialValue.dueDate !== formState.dueDate) {
    partialSetupForm.dueDate = formState.dueDate ? formState.dueDate.toISOString() : undefined;
  }

  /* These fields can be changed by INSPECTOR only, and the attachments assignment is crucial to add and keep all images
  (Needed to do a set instead a push, because of BE), and inspectionDescription is required BE side, so sending it even without changes
  those are moved to inspection
  partialSetupForm.inspectionAttachments = formState.inspectionAttachments;
  partialSetupForm.inspectionDescription = formState.inspectionDescription; */

  partialSetupForm.attachments = formState.attachments;
  partialSetupForm.participants = createParticipantsPayload(initialValue.participants ?? [], formState.participants ?? []);
  partialSetupForm.tasks = formState.tasks ?? [];

  return partialSetupForm as SetupForm;
}

export function getComplexityFromRank(rank: number) {
  return mapSetupComplexity.find((c) => c.rank === rank)?.complexity as SetupComplexity;
}

export function createDraftPayloadFromForm(formState: any, initialValue: SetupDraftForm): PartialSetupDraftForm {
  return {
    ...formState,
    dueDate: formState.dueDate ? formState.dueDate.toISOString() : undefined,
    totalTaxable: formState.totalTaxable ? +formState.totalTaxable : undefined,
    costs: createSetupCostsPayload(initialValue.costs ?? [], formState.costs ?? []),
    participants: createParticipantsPayload(initialValue.participants ?? [], formState.participants ?? []),
    tasks: createSetupTaskPayload(initialValue.tasks ?? [], formState.tasks ?? [])
  } as PartialSetupDraftForm
}

export function createSetupTaskPayload(initTask: Task[], newTask: Task[]) {
  const deleted = initTask
    .filter(c => !newTask.find(newTask => newTask.id === c.id))
    .map(t => ({ ...t, toBeDisconnected: true }));

  return [ ...newTask, ...deleted ].map(t => ({
    ...t,
    description: t.description,
    taskSteps: t.taskSteps,
  }));
}

export function createSetupCostsPayload(initCosts: Cost[], newCosts: Cost[]) {
  const deleted = initCosts
    .filter(c => !newCosts.find(newCost => newCost.id === c.id))
    .map(c => ({ ...c, toBeDisconnected: true }));
  console.log(initCosts)
  return [ ...newCosts, ...deleted ].map(c => ({
    ...c,
    price: +c.price,
    quantity: +c.quantity,
    productId: c.productId ?? undefined,
    resourceId: c.resourceId ?? undefined,
    unitOfMeasure: c.unitOfMeasure ?? undefined,
    description: c.description ?? undefined,
  }));
}
