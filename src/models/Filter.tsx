import { v4 } from "uuid"

export enum Comparator {
  EQUAL = 'Equals',
  NOT_EQUAL = 'Does Not Equal',
  GREATER_THAN = 'Greater Than',
  LESSER_THAN = 'Lesser Than',
}

export type Filter = {
  id: string,
  column: string,
  comparator: Comparator,
  value: number,
}

export const Filter = (column: string, comparator: Comparator, value: number): Filter => ({ id: v4(), column, comparator, value })