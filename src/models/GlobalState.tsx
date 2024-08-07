import { DataResponse, HeaderColumn } from "./DataTransferObject"
import { GlobalAction, GlobalActionType } from "./GlobalAction"
import { Loadable, NotLoaded } from "./Loadable"

export type GlobalState = {
  headers: Loadable<HeaderColumn[]>,
  data: Loadable<DataResponse>
}

export const initialState: GlobalState = {
  headers: NotLoaded(),
  data: NotLoaded()
}

export const reducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  const { type } = action
  if (type === GlobalActionType.SET_COLUMNS) return {...state, headers: action.value}
  else if (type === GlobalActionType.SET_DATA) return {...state, data: action.value}
  return state
}
