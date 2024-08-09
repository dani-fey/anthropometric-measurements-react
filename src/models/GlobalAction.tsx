import { Axis } from "./Axis"
import { Data, HeaderColumn } from "./DataTransferObject"
import { Loadable } from "./Loadable"

export enum GlobalActionType {
  SET_COLUMNS,
  SET_DATA,
  SET_AXIS
}

type BaseAction = {
  type: GlobalActionType
}

type SetColumnsAction = {
  type: GlobalActionType.SET_COLUMNS,
  value: Loadable<HeaderColumn[]>,
}
export const SetColumnsAction = (value: Loadable<HeaderColumn[]>): SetColumnsAction => ({ type: GlobalActionType.SET_COLUMNS, value })

type SetDataAction = {
  type: GlobalActionType.SET_DATA,
  value: Loadable<Data>
}
export const SetDataAction = (value: Loadable<Data>): SetDataAction => ({ type: GlobalActionType.SET_DATA, value })

type SetAxisAction = {
  type: GlobalActionType.SET_AXIS,
  axis: Axis,
  value: string | undefined,
}
export const SetAxisAction = (axis: Axis, value: string | undefined): SetAxisAction => ({ type: GlobalActionType.SET_AXIS, axis, value })

export type GlobalAction = BaseAction & (SetColumnsAction | SetDataAction | SetAxisAction)