import { useCallback, useEffect } from 'react'
import { createReducerContext } from '../models/createReducerContext'
import { initialState, reducer } from '../models/GlobalState'
import { useDataRequest } from '../hooks/useDataRequest'
import { DataResponse, HeaderColumns } from '../models/DataTransferObject'
import { SetColumnsAction, SetDataAction, SetThemeAction } from '../models/GlobalAction'
import { Loaded, Loading, LoadingState } from '../models/Loadable'
import { ColorTheme } from '../models/ColorTheme'

const { Provider, useProvider } = createReducerContext(reducer, initialState)

export const GlobalContextProvider = Provider

export const useGlobalContext = () => {
  const [ state, dispatch ] = useProvider()

  const { getHeaders, getData } = useDataRequest()
  const { headers, data, theme } = state

  useEffect(() => {
    requestHeaders()
  }, [])

  const requestHeaders = useCallback(() => {
    if (state.headers.state === LoadingState.LOADED || state.headers.state === LoadingState.LOADING) return
    dispatch(SetColumnsAction(Loading()))
    getHeaders()
      .then(r => {
        const columns = HeaderColumns(r.headers)
        dispatch(SetColumnsAction(Loaded(columns)))
      })
  }, [state, getHeaders, HeaderColumns, dispatch, SetColumnsAction])

  const requestData = useCallback((xCol: number, yCol: number) => {
    if (state.data.state === LoadingState.LOADING) return
    if (state.data.state === LoadingState.LOADED && state.data.value.xCol === xCol && state.data.value.yCol === yCol) return
    dispatch(SetDataAction(Loading()))
    getData(xCol, yCol)
      .then(r => {
        dispatch(SetDataAction(Loaded(DataResponse(r))))
      })
  }, [state, getData, dispatch, SetDataAction])

  const setTheme = useCallback((theme: ColorTheme) => {
    dispatch(SetThemeAction(theme))
  }, [dispatch, SetThemeAction])

  return {
    requestHeaders, headers,
    requestData, data,
    setTheme, theme
  }
}