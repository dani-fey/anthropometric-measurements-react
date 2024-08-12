import { useEffect, useMemo, useState } from 'react'
import { Box, Card, Chip, Grid, IconButton, Input, Option, Select, Stack, Table, Typography, useTheme } from '@mui/joy'
import { useGlobalContext } from '../contexts/GlobalContext'
import { ParentSize } from '@visx/responsive'
import { ThemeToggle } from '../components/ThemeToggle'
import { ScatterChart } from '../components/ScatterChart'
import { ColumnSelector } from '../components/ColumnSelector'
import { Add, Delete } from '@mui/icons-material'
import { useSeriesColor } from '../hooks/useSeriesColor'
import { useHeaderContext } from '../contexts/HeaderContext'
import { Datum, HeaderColumn } from '../models/DataTransferObject'
import { useDataRequest } from '../hooks/useDataRequest'
import { Comparator, compare, Filter, SeriesDefinition } from '../models/Chart'

const ChartControls = ({ onSubmit }: {onSubmit: (xAxis: string, yAxis: string) => void}) => {
  const [ xAxis, setXAxis ] = useState<string | undefined>(undefined)
  const [ yAxis, setYAxis ] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (xAxis === undefined || yAxis === undefined) return
    onSubmit(xAxis, yAxis)
  }, [xAxis, yAxis])
  
  return <>
    <Grid container spacing={2}>
      <Grid xs={6}>
        <ColumnSelector label='X-Axis' onChange={v => setXAxis(v)} />
      </Grid>
      <Grid xs={6}>
        <ColumnSelector label='Y-Axis' onChange={v => setYAxis(v)} />
      </Grid>
    </Grid>
  </>
}

const Title = () => {
  return <Typography level='h1'>
    Anthropometric Measurements — an Intuitive Visualization
    <span style={{marginInlineStart: '0.25em'}}>
      <ThemeToggle />
    </span>
  </Typography>
}

const SeriesCard = ({ onChange }: {onChange: (series: SeriesDefinition[]) => void}) => {
  const { getSeriesColor } = useSeriesColor()
  const { headers, getColumn } = useHeaderContext()

  const [ series, setSeries ] = useState<SeriesDefinition[]>([])

  useEffect(() => {
    console.log(series)
    onChange(series)
  }, [series])

  const handleAddSeries = () => {
    setSeries(s => [...s, SeriesDefinition('New Series')])
  }

  const handleSetSeriesLabel = (id: string, label: string) => {
    setSeries(s => s.map(s2 => s2.id === id ? ({...s2, label}) : s2))
  }

  const handleRemoveSeries = (id: string) => {
    setSeries(s => s.filter(s2 => s2.id !== id))
  }

  const handleAddFilter = (id: string) => {
    setSeries(s => s.map(s2 => s2.id === id ? ({...s2, filters: [...s2.filters, Filter(Object.values(headers)[0], Comparator.EQUAL, 0)]}) : s2))
  }

  const handleRemoveFilter = (seriesId: string, filterId: string) => {
    setSeries(s => s.map(s2 => s2.id === seriesId ? ({...s2, filters: s2.filters.filter(f => f.id !== filterId)}) : s2))
  }

  const setFilterColumn = (seriesId: string, filterId: string, columnId: string) => {
    const column = getColumn(columnId)
    setSeries(s => s.map(s2 => s2.id === seriesId ? ({...s2, filters: s2.filters.map(f => f.id === filterId ? ({...f, column}) : f)}) : s2))
  }

  const setFilterComparator = (seriesId: string, filterId: string, comparator: Comparator) => {
    setSeries(s => s.map(s2 => s2.id === seriesId ? ({...s2, filters: s2.filters.map(f => f.id === filterId ? ({...f, comparator}) : f)}) : s2))
  }

  const setFilterValue = (seriesId: string, filterId: string, value: number) => {
    setSeries(s => s.map(s2 => s2.id === seriesId ? ({...s2, filters: s2.filters.map(f => f.id === filterId ? ({...f, value}) : f)}) : s2))
  }

  return <Card>
    <Typography level='title-lg'>
      Series
      <span style={{marginInlineStart: '0.25em', verticalAlign: 'sub'}}>
        <IconButton size='sm' color='primary' onClick={handleAddSeries}>
          <Add />
        </IconButton>
      </span>
    </Typography>
    <Table>
      <thead>
        <tr>
          <th style={{width: '30%'}}>Name</th>
          <th style={{width: '60%'}}>Filters</th>
          <th style={{width: '10%'}}></th>
        </tr>
      </thead>
      <tbody>
        {series.map((s, i) => <tr key={s.id}>
          <td>
            <Stack direction='row'>
              <Input defaultValue={s.label} startDecorator={<Chip size='sm' sx={{bgcolor: getSeriesColor(i)}} />} onChange={v => handleSetSeriesLabel(s.id, v.target.value)}></Input>
            </Stack>
          </td>
          <td>
            <Stack direction='column' spacing={1}>
              {s.filters.map(f => <Table>
                <tbody>
                  <td style={{width: '40%'}}>
                    <Select placeholder='Column' defaultValue={f.column.id} onChange={(_, v) => setFilterColumn(s.id, f.id, v as string)}>
                      {Object.values(headers).map(h => <Option key={h.id} value={h.id}>{h.label}</Option>)}
                    </Select>
                  </td>
                  <td style={{width: '30%'}}>
                    <Select placeholder='Column' defaultValue={f.comparator} onChange={(_, v) => setFilterComparator(s.id, f.id, v as Comparator)}>
                      {Object.values(Comparator).map(c => <Option key={c} value={c}>{c}</Option>)}
                    </Select>
                  </td>
                  <td style={{width: '30%'}}>
                    <Input defaultValue={f.value} endDecorator={f.column.unit} onChange={v => setFilterValue(s.id, f.id, parseInt(v.target.value))} />
                  </td>
                  <td style={{width: '10%'}}>
                    <IconButton color='danger' variant='soft' onClick={_ => handleRemoveFilter(s.id, f.id)}><Delete /></IconButton>
                  </td>
                </tbody>
              </Table>)}
              <IconButton color='primary' variant='soft' onClick={_ => handleAddFilter(s.id)}>
                <Add />
              </IconButton>
            </Stack>
          </td>
          <td>
            <Stack direction='row-reverse'>
              <IconButton variant='soft' size='sm' color='danger' onClick={_ => handleRemoveSeries(s.id)}>
                <Delete />
              </IconButton>
            </Stack>
          </td>
        </tr>)}
      </tbody>
    </Table>
  </Card>
}

const ChartCard = ({ xAxis, yAxis, series }: {xAxis: HeaderColumn | undefined, yAxis: HeaderColumn | undefined, series: SeriesDefinition[]}) => {
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

  useEffect(() => {
    console.log('seriesData', seriesData)
  }, [seriesData])

  if (headersLoaded && axesDefined && dataLoaded && !!seriesData) return <>
    <Card>
      <div style={{width: '100%', aspectRatio: 2}}>
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

const ChartView = () => {
  const { headers, getColumn } = useHeaderContext()

  const [xAxis, setXAxis] = useState<HeaderColumn | undefined>(undefined)
  const [yAxis, setYAxis] = useState<HeaderColumn | undefined>(undefined)
  const [series, setSeries] = useState<SeriesDefinition[]>([])

  const handleSubmitAxes = (x: string, y: string) => {
    setXAxis(getColumn(x))
    setYAxis(getColumn(y))
  }

  return <Stack direction='column' spacing={2}>
    <Card>
      <Typography level='title-lg'>Axes</Typography>
      <ChartControls onSubmit={handleSubmitAxes} />
    </Card>
    <SeriesCard onChange={setSeries} />
    <ChartCard xAxis={xAxis} yAxis={yAxis} series={series} />
  </Stack>
}

export const IndexPage = () => {
  return <Box sx={{p: 2, maxWidth: 1200, mx: 'auto'}}>
    <Stack direction='column' spacing={2}>
      <Title />
      <ChartView />
    </Stack>
  </Box>
}