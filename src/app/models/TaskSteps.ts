import { Roles, User } from "./User";
import { Task } from "./Task";

export enum TaskStepStatus {
  PLANNED = "PLANNED",
  PENDING = "PENDING",
  WORKING = "WORKING",
  DONE = "DONE"
}

export enum TaskStepType {
  DESIGN = "DESIGN",
  PRINT = "PRINT",
  FINISH = "FINISH",
  ASSEMBLE = "ASSEMBLE",
}

export interface TaskStep {
  id?: number,
  type: TaskStepType,
  cardinal: number,
  startDate: string | Date,
  endDate: string | Date,
  feedback: string,
  attachments: string[],
  status: TaskStepStatus,
  userId?: number,
  user?: User,
  toBeDisconnected?: boolean,
  task?: Task
}

export type PartialTaskStep = Partial<TaskStep>

export interface TaskStepForm {
  id: number,
  title: string,
  description: string,
  taskSteps: TaskStep[]
}

export interface TaskStepFormOnCompletion {
  id: number,
  feedback: string,
  attachments: string[]
  endDate: string | Date,
}

export type TaskStepFilter = {
  users?: number[],
  includeNotAssigned?: boolean,
  status?: TaskStepStatus[],
  type?: TaskStepType[],
  dueDateFrom?: Date | string,
  dueDateTo?: Date | string,
}

export interface TaskStepTable {
  includeNotAssigned?: boolean,
  users?: number[],
  status?: TaskStepStatus[],
  type?: TaskStepType[],
  dueDateFrom?: Date | string,
  dueDateTo?: Date | string,
  pageIndex?: number,
  pageSize?: number
}

export const mapTaskStepType = [
  { value: TaskStepType.DESIGN, label: 'Progettazione', workerRole: Roles.WORKER_DESIGNER, cardinal: 0 },
  { value: TaskStepType.PRINT, label: 'Stampa', workerRole: Roles.WORKER_PRINTER, cardinal: 1 },
  { value: TaskStepType.FINISH, label: 'Finitura', workerRole: Roles.WORKER_FINISHER, cardinal: 2  },
  { value: TaskStepType.ASSEMBLE, label: 'Montaggio', workerRole: Roles.WORKER_ASSEMBLER, cardinal: 3  }
]

export const mapUserRoleToTaskStepType = [
  { role: Roles.WORKER_DESIGNER, taskStepType: TaskStepType.DESIGN},
  { role: Roles.WORKER_PRINTER, taskStepType: TaskStepType.PRINT},
  { role: Roles.WORKER_FINISHER, taskStepType: TaskStepType.FINISH},
  { role: Roles.WORKER_ASSEMBLER, taskStepType: TaskStepType.ASSEMBLE},
]

export function filteredTasksWithNames(task: Task): string[] {
  return (
    task.taskSteps?.filter(ts => !ts.toBeDisconnected)
      .slice().sort((a, b) => (a.cardinal ?? 0) - (b.cardinal ?? 0))
      ?.map((step) => mapTaskStepType.find((ts) => ts.value === step.type)?.label)
      .filter((name): name is string => !!name) || []
  );
}
