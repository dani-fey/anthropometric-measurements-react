import { Data, HeaderColumn } from "./DataTransferObject"
import { GlobalAction, GlobalActionType } from "./GlobalAction"
import { Loadable, NotLoaded } from "./Loadable"
import { Axis } from "./Axis"

export type GlobalState = {
  headers: Loadable<HeaderColumn[]>,
  data: Loadable<Data>,
  axes: {[K in Axis]: string | null}
}

export const initialState: GlobalState = {
  headers: NotLoaded(),
  data: NotLoaded(),
  axes: Object.values(Axis).reduce((o, a) => ({...o, [a]: null}), {}) as {[K in Axis]: string | null}
}

export const reducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  const { type } = action
  if (type === GlobalActionType.SET_COLUMNS) return {...state, headers: action.value}
  if (type === GlobalActionType.SET_DATA) return {...state, data: action.value}
  if (type === GlobalActionType.SET_AXIS) return {...state, axes: {...state.axes, [action.axis]: action.value}}
  return state
}
