import { useCallback, useEffect, useMemo } from 'react'
import { createReducerContext } from '../models/createReducerContext'
import { initialState, reducer } from '../models/GlobalState'
import { useDataRequest } from '../hooks/useDataRequest'
import { Data, HeaderColumn } from '../models/DataTransferObject'
import { AddSeriesAction, AddSeriesFilterAction, RemoveSeriesAction, RemoveSeriesFilterAction, SetAxisAction, SetColumnsAction, SetDataAction, SetSeriesNameAction } from '../models/GlobalAction'
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
  const columnIds = useMemo(() => {
    const axisColumns = Object.values(axes).filter(a => a !== undefined).map(a => a.id)
    const filterColumns = series.flatMap(s => s.filters.flatMap(f => f.column))
    return Array.from(new Set([...axisColumns, ...filterColumns]))
  }, [axes, series])

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

  const requestData = useCallback((columnIds: string[]) => {
    console.log(state.data.state)
    if (state.data.state === LoadingState.LOADING) return
    //if (state.data.state === LoadingState.LOADED && state.axes.x === xCol && state.axes.y === yCol) return
    dispatch(SetDataAction(Loading()))
    console.log(columnIds)
    getData(columnIds)
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

  const addSeriesFilter = useCallback((seriesId: string, filter: Filter) => {
    dispatch(AddSeriesFilterAction(seriesId, filter))
  }, [dispatch, AddSeriesFilterAction])

  const removeSeriesFilter = useCallback((seriesId: string, filterId: string) => {
    dispatch(RemoveSeriesFilterAction(seriesId, filterId))
  }, [dispatch, RemoveSeriesFilterAction])

  return {}
  return {
    requestHeaders, headers,
    requestData, data,
    setAxis, axes,
    addSeries, removeSeries, setSeriesName, addSeriesFilter, removeSeriesFilter, series,
    columnIds
  }
}