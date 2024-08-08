import { DataResponse, HeaderColumn } from "./DataTransferObject"
import { GlobalAction, GlobalActionType } from "./GlobalAction"
import { Loadable, NotLoaded } from "./Loadable"
import { ColorTheme } from "./ColorTheme"

export type GlobalState = {
  theme: ColorTheme,
  headers: Loadable<HeaderColumn[]>,
  data: Loadable<DataResponse>
}

export const initialState: GlobalState = {
  theme: ColorTheme.LIGHT,
  headers: NotLoaded(),
  data: NotLoaded()
}

export const reducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  const { type } = action
  if (type === GlobalActionType.SET_THEME) return {...state, theme: action.value}
  if (type === GlobalActionType.SET_COLUMNS) return {...state, headers: action.value}
  if (type === GlobalActionType.SET_DATA) return {...state, data: action.value}
  return state
}
