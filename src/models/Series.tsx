import { v4 } from 'uuid'
import { Filter } from './Filter'

export type Series = {
  id: string,
  name: string,
  filter: Filter | undefined,
}
export const Series = (name: string): Series => {
  return {id: v4(), name, filter: undefined}
}