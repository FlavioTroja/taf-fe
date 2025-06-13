import {isNaN, isNil, omitBy, overSome} from "lodash-es";

export interface Resource {
  id: number;
  name: string;
  hourlyCost: number;
  image: string;
}

export type PartialResource = Partial<Resource>;

export type ResourceDTO = Resource & {
  relations: any[]
}

export function createResourcePayload(resource: any): ResourceDTO {
  const resourceDTO = {
    name: resource.name,
    hourlyCost: +resource.hourlyCost,
    image: resource.image,
  }
  return <ResourceDTO>omitBy(resourceDTO, overSome([isNil, isNaN]));
}

export interface ResourceFilter {
  value?: string,
  name?: string,
  hourlyCost?:  number,
}

export interface ResourceTable {
  search?: string,
  pageIndex?: number,
  pageSize?: number
}
