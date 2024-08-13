import { Card, Typography } from "@mui/joy"
import { ParentSize } from "@visx/responsive"
import { useState, useMemo, useEffect } from "react"
import { useHeaderContext } from "../contexts/HeaderContext"
import { useDataRequest } from "../hooks/useDataRequest"
import { SeriesDefinition, compare } from "../models/Chart"
import { HeaderColumn, Datum } from "../models/DataTransferObject"
import { ScatterChart } from "./ScatterChart"

export const ChartControl = ({ xAxis, yAxis, series }: {xAxis: HeaderColumn | undefined, yAxis: HeaderColumn | undefined, series: SeriesDefinition[]}) => {
  const { loaded: headersLoaded } = useHeaderContext()
  const { getData } = useDataRequest()

  const [ data, setData ] = useState<Datum[] | undefined>(undefined)

  const axesDefined = !!xAxis && !!yAxis
  const canLoadData = headersLoaded && axesDefined && series.length > 0
  const dataLoaded = data !== undefined

  const filterColumns = useMemo(() => {
    const asList = series.flatMap(s => s.filters.map(f => f.column.id))
    return new Set(asList)
  }, [series])

  const axisColumns = useMemo(() => {
    const asList = [xAxis, yAxis].filter(v => v !== undefined).map(v => v.id)
    return new Set(asList)
  }, [xAxis, yAxis])

  const allColumns = useMemo(() => {
    return new Set([...Array.from(filterColumns), ...Array.from(axisColumns)])
  }, [filterColumns, axisColumns])

  // reload data if any params change
  useEffect(() => {
    setData(undefined)
  }, [xAxis, yAxis, series])

  useEffect(() => {
    if (!canLoadData || dataLoaded) return
    getData(Array.from(allColumns))
      .then(v => setData(v.data))
  }, [canLoadData, dataLoaded, allColumns])

  const seriesData = useMemo(() => {
    if (data === undefined || xAxis === undefined || yAxis === undefined) return undefined
    return series.map(s => {
      const points = data
        .filter(d => {
          return s.filters.every(f => compare(f.comparator, f.value)(d[f.column.id]))
        })
        .map(d => ({x: d[xAxis.id], y: d[yAxis.id]}))
      return {label: s.label, points}
    })
  }, [data, xAxis, yAxis, series])

  if (headersLoaded && axesDefined && dataLoaded && !!seriesData) return <>
    <Card style={{containerType: 'inline-size'}}>
      <div style={{width: '100%', aspectRatio: 1, maxHeight: 540}}>
        <ParentSize debounceTime={0}>
          {parent => <ScatterChart series={seriesData} width={parent.width} height={parent.height} xAxis={xAxis} yAxis={yAxis} />}
        </ParentSize>
      </div>
    </Card>  
  </>
  
  return <Card color='danger'>
    <div style={{width: '100%', aspectRatio: 2, display: 'flex', placeContent: 'center', placeItems: 'center'}}>
      <Typography level='title-lg' color='danger'>No Data</Typography>
    </div>
  </Card>
}
