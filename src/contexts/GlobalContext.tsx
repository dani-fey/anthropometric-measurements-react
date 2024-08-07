import { useCallback, useEffect } from 'react'
import { createReducerContext } from '../models/createReducerContext'
import { initialState, reducer } from '../models/GlobalState'
import { useDataRequest } from '../hooks/useDataRequest'
import { DataResponse, HeaderColumn } from '../models/DataTransferObject'
import { SetColumnsAction, SetDataAction } from '../models/GlobalAction'
import { Loaded, Loading, LoadingState } from '../models/Loadable'

const { Provider, useProvider } = createReducerContext(reducer, initialState)

export const GlobalContextProvider = Provider

export const useGlobalContext = () => {
  const [ state, dispatch ] = useProvider()

  const { getHeaders, getData } = useDataRequest()
  const { headers, data } = state

  useEffect(() => {
    requestHeaders()
  }, [])

  useEffect(() => {
    if (headers.state === LoadingState.LOADED) requestData()
  }, [headers])

  const requestHeaders = useCallback(() => {
    if (state.headers.state === LoadingState.LOADED || state.headers.state === LoadingState.LOADING) return
    dispatch(SetColumnsAction(Loading()))
    getHeaders()
      .then(r => {
        const columns = r.headers.map(c => HeaderColumn(c))
        dispatch(SetColumnsAction(Loaded(columns)))
      })
  }, [state, getHeaders, HeaderColumn, dispatch, SetColumnsAction])

  const requestData = useCallback(() => {
    if (state.data.state === LoadingState.LOADED || state.data.state === LoadingState.LOADING) return
    dispatch(SetDataAction(Loading()))
    getData()
      .then(r => {
        
        dispatch(SetDataAction(Loaded(DataResponse(r))))
      })
  }, [state, getData, dispatch, SetDataAction])

  return {
    requestHeaders, headers,
    requestData, data
  }
}