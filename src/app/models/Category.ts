import { isNaN, isNil, omitBy, overSome } from "lodash-es";

export interface Category {
  id: number,
  name: string,
  image?: string,
  parentCategoryId?: number
  createdAt: Date | string
  updatedAt: Date | string
  children?: Category[]
  parentCategory: Category
  deleted: boolean
}

export type PartialCategory = Partial<Category>;

export interface CategoryFilter {
  value?: string,
  isLeaf?: boolean,
  parentCategoryId?: number | null,
}

export function createCategoryPayload(category: any): Category {
  const categoryDTO = {
    name: category.name,
    image: category.image,
    parentCategoryId: category.parentCategoryId,
    children: category.children
  }

  return <Category>omitBy(categoryDTO, overSome([isNil, isNaN]));
}
