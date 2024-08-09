import { Axis } from "./Axis"
import { Data, HeaderColumn } from "./DataTransferObject"
import { Filter } from "./Filter"
import { Loadable } from "./Loadable"

export enum GlobalActionType {
  SET_COLUMNS,
  SET_DATA,
  SET_AXIS,
  ADD_SERIES,
  REMOVE_SERIES,
  SET_SERIES_NAME,
  SET_SERIES_FILTER,
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

type AddSeriesAction = {
  type: GlobalActionType.ADD_SERIES,
}
export const AddSeriesAction = (): AddSeriesAction => ({ type: GlobalActionType.ADD_SERIES })

type RemoveSeriesAction = {
  type: GlobalActionType.REMOVE_SERIES,
  id: string,
}
export const RemoveSeriesAction = (id: string): RemoveSeriesAction => ({ type: GlobalActionType.REMOVE_SERIES, id })

type SetSeriesNameAction = {
  type: GlobalActionType.SET_SERIES_NAME,
  id: string,
  name: string,
}
export const SetSeriesNameAction = (id: string, name: string): SetSeriesNameAction => ({ type: GlobalActionType.SET_SERIES_NAME, id, name })

type SetSeriesFilterAction = {
  type: GlobalActionType.SET_SERIES_FILTER,
  id: string,
  filter: Filter | undefined,
}
export const SetSeriesFilterAction = (id: string, filter: Filter | undefined): SetSeriesFilterAction => ({ type: GlobalActionType.SET_SERIES_FILTER, id, filter })

export type GlobalAction = BaseAction & (SetColumnsAction | SetDataAction | SetAxisAction | AddSeriesAction | RemoveSeriesAction | SetSeriesNameAction | SetSeriesFilterAction)