export enum LoadingState {
  NOT_LOADED = 'Not Loaded',
  LOADING = 'Loading',
  LOADED = 'Loaded',
  ERROR = 'Error'
}

type NotLoaded = {
  state: LoadingState.NOT_LOADED
}
export const NotLoaded = (): NotLoaded => {
  return {state: LoadingState.NOT_LOADED}
}

type Loading = {
  state: LoadingState.LOADING
}
export const Loading = (): Loading => {
  return {state: LoadingState.LOADING}
}

type Loaded<T> = {
  state: LoadingState.LOADED,
  value: T
}
export const Loaded = <T,>(value: T): Loaded<T> => {
  return {state: LoadingState.LOADED, value}
}

type Error = {
  state: LoadingState.ERROR
}
export const Error = (): Error => {
  return {state: LoadingState.ERROR}
}

export type Loadable<T> = NotLoaded | Loading | Loaded<T> | Error