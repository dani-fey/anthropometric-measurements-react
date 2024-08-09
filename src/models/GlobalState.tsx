import { Data, HeaderColumn } from "./DataTransferObject"
import { GlobalAction, GlobalActionType } from "./GlobalAction"
import { Loadable, NotLoaded } from "./Loadable"
import { Axis } from "./Axis"
import { Series } from "./Series"

export type GlobalState = {
  headers: Loadable<HeaderColumn[]>,
  data: Loadable<Data>,
  axes: {[K in Axis]: string | null},
  series: Series[],
}

export const initialState: GlobalState = {
  headers: NotLoaded(),
  data: NotLoaded(),
  axes: Object.values(Axis).reduce((o, a) => ({...o, [a]: null}), {}) as {[K in Axis]: string | null},
  series: [],
}

export const reducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  const { type } = action
  if (type === GlobalActionType.SET_COLUMNS) return {...state, headers: action.value}
  if (type === GlobalActionType.SET_DATA) return {...state, data: action.value}
  if (type === GlobalActionType.SET_AXIS) return {...state, axes: {...state.axes, [action.axis]: action.value}}
  if (type === GlobalActionType.ADD_SERIES) return {...state, series: [...state.series, Series('')]}
  if (type === GlobalActionType.REMOVE_SERIES) return {...state, series: state.series.filter(s => s.id !== action.id)}
  if (type === GlobalActionType.SET_SERIES_NAME) return {...state, series: state.series.map(s => s.id === action.id ? {...s, name: action.name} : s)}
  if (type === GlobalActionType.SET_SERIES_FILTER) return {...state, series: state.series.map(s => s.id === action.id ? {...s, filter: action.filter} : s)}
  return state
}
