import { useCallback, useEffect, useMemo } from 'react'
import { createReducerContext } from '../models/createReducerContext'
import { initialState, reducer } from '../models/GlobalState'
import { useDataRequest } from '../hooks/useDataRequest'
import { Data, HeaderColumn } from '../models/DataTransferObject'
import { AddSeriesAction, RemoveSeriesAction, SetAxisAction, SetColumnsAction, SetDataAction, SetSeriesFilterAction, SetSeriesNameAction } from '../models/GlobalAction'
import { Loaded, Loading, LoadingState } from '../models/Loadable'
import { Axis } from '../models/Axis'
import { Filter } from '../models/Filter'

const { Provider, useProvider } = createReducerContext(reducer, initialState)

export const GlobalContextProvider = Provider

export const useGlobalContext = () => {
  const [ state, dispatch ] = useProvider()

  const { getHeaders, getData } = useDataRequest()

  const headers = useMemo(() => state.headers, [state])
  const data = useMemo(() => state.data, [state])
  const series = useMemo(() => state.series, [state])
  const axes: {[K in Axis]: HeaderColumn | undefined} = useMemo(() => {
    if (headers.state === LoadingState.LOADED) {
      return Object.entries(state.axes).reduce((o, [k, v]) => {
        return {...o, [k]: headers.value.find(c => c.id === v)}
      }, {}) as {[K in Axis]: HeaderColumn}
    }
    return Object.entries(state.axes).reduce((o, [k]) => ({...o, [k]: undefined}), {}) as {[K in Axis]: undefined}
  }, [state])

  useEffect(() => {
    requestHeaders()
  }, [])

  const setAxis = useCallback((axis: Axis, value: string | undefined) => {
    if (state.axes[axis] === value) return
    dispatch(SetAxisAction(axis, value))
  }, [state, dispatch, SetAxisAction])

  const requestHeaders = useCallback(() => {
    if (state.headers.state === LoadingState.LOADED || state.headers.state === LoadingState.LOADING) return
    dispatch(SetColumnsAction(Loading()))
    getHeaders()
      .then(headers => {
        const value = Object.values(headers.data)
        dispatch(SetColumnsAction(Loaded(value)))
      })
  }, [state, getHeaders, dispatch, SetColumnsAction])

  const requestData = useCallback((xCol: string, yCol: string) => {
    if (state.data.state === LoadingState.LOADING) return
    if (state.data.state === LoadingState.LOADED && state.axes.x === xCol && state.axes.y === yCol) return
    dispatch(SetDataAction(Loading()))
    getData([xCol, yCol])
      .then(r => {
        dispatch(SetDataAction(Loaded(Data(r))))
      })
  }, [state, getData, dispatch, SetDataAction])

  const addSeries = useCallback(() => {
    dispatch(AddSeriesAction())
  }, [dispatch, AddSeriesAction])

  const removeSeries = useCallback((id: string) => {
    dispatch(RemoveSeriesAction(id))
  }, [dispatch, RemoveSeriesAction])

  const setSeriesName = useCallback((id: string, name: string) => {
    dispatch(SetSeriesNameAction(id, name))
  }, [dispatch, SetSeriesNameAction])

  const setSeriesFilter = useCallback((id: string, filter: Filter | undefined) => {
    dispatch(SetSeriesFilterAction(id, filter))
  }, [dispatch, SetSeriesFilterAction])

  return {
    requestHeaders, headers,
    requestData, data,
    setAxis, axes,
    addSeries, removeSeries, setSeriesName, setSeriesFilter, series
  }
}