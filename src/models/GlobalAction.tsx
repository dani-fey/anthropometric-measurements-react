import { ColorTheme } from "./ColorTheme"
import { DataResponse, HeaderColumn } from "./DataTransferObject"
import { Loadable } from "./Loadable"

export enum GlobalActionType {
  SET_COLUMNS,
  SET_DATA,
  SET_THEME,
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

type SetThemeAction = {
  type: GlobalActionType.SET_THEME,
  value: ColorTheme
}
export const SetThemeAction = (value: ColorTheme): SetThemeAction => ({ type: GlobalActionType.SET_THEME, value })

export type GlobalAction = BaseAction & (SetColumnsAction | SetDataAction | SetThemeAction)
