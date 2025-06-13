import { Setup } from "./Setup";
import { TaskStep, TaskStepStatus, TaskStepType } from "./TaskSteps";

export interface Task {
  id: number,
  title: string,
  description: string,
  taskSteps?: TaskStep[],
  isCardOpen?: boolean,
  currentStepId?: number,
  toBeDisconnected?: boolean,
  setupId?: number,
  setup?: Setup,
}


export type TaskFilter = {
  currentStepType?: TaskStepType[],
  customers?: number[],
  taskStatus?: TaskStepStatus[],
  dueDateFrom?: Date | string,
  dueDateTo?: Date | string,
}
