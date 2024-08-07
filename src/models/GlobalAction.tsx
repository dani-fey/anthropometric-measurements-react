import { DataResponse, HeaderColumn } from "./DataTransferObject"
import { Loadable } from "./Loadable"

export enum GlobalActionType {
  SET_COLUMNS,
  SET_DATA
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
  value: Loadable<DataResponse>
}
export const SetDataAction = (value: Loadable<DataResponse>): SetDataAction => ({ type: GlobalActionType.SET_DATA, value })

export type GlobalAction = BaseAction & (SetColumnsAction | SetDataAction)
