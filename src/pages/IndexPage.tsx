import { useEffect, useMemo, useState } from 'react'
import { Box, Card, Chip, Grid, IconButton, Input, Option, Select, Stack, Table, Typography, useTheme } from '@mui/joy'
import { useGlobalContext } from '../contexts/GlobalContext'
import { ParentSize } from '@visx/responsive'
import { ThemeToggle } from '../components/ThemeToggle'
import { ScatterChart } from '../components/ScatterChart'
import { ColumnSelector } from '../components/ColumnSelector'
import { Add, Delete } from '@mui/icons-material'
import { useSeriesColor } from '../hooks/useSeriesColor'
import { Filter } from '../models/Filter'
import { useHeaderContext } from '../contexts/HeaderContext'
import { Datum, HeaderColumn } from '../models/DataTransferObject'
import { useDataRequest } from '../hooks/useDataRequest'

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

/*
const SeriesCard = () => {
  const { series, addSeries, removeSeries, setSeriesName, setSeriesFilter } = useGlobalContext()

  const theme = useTheme()
  const { getSeriesColor } = useSeriesColor()

  return <Card>
    <Typography level='title-lg'>
      Series
      <span style={{marginInlineStart: '0.25em', verticalAlign: 'sub'}}>
        <IconButton size='sm' color='primary' onClick={_ => addSeries()}>
          <Add />
        </IconButton>
      </span>
    </Typography>
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Filters</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {series.map((s, i) => <tr key={s.id}>
          <td>
            <Stack direction='row'>
              <Input startDecorator={<Chip size='sm' sx={{bgcolor: getSeriesColor(i)}} />} onChange={v => setSeriesName(s.id, v.target.value)}></Input>
            </Stack>
          </td>
          <td>
            <Stack direction='row' sx={{alignItems: 'center'}}>
              <Select onChange={(_, v) => setSeriesFilter(s.id, v as Filter)} placeholder={<Typography color='neutral'>No filters</Typography>}>
                {Object.values(Filter).map(v => <Option key={v} value={v}>{v}</Option>)}
              </Select>
            </Stack>
          </td>
          <td style={{textAlign: 'right'}}>
            <IconButton size='sm' color='danger' onClick={_ => removeSeries(s.id)}>
              <Delete />
            </IconButton>
          </td>
        </tr>)}
      </tbody>
    </Table>
  </Card>
}
*/

const ChartCard = ({ xAxis, yAxis }: {xAxis: HeaderColumn | undefined, yAxis: HeaderColumn | undefined}) => {
  const { loaded: headersLoaded, headers } = useHeaderContext()
  const { getData } = useDataRequest()

  const [ data, setData ] = useState<Datum[] | undefined>(undefined)

  const axesDefined = !!xAxis && !!yAxis
  const canLoadData = headersLoaded && axesDefined
  const dataLoaded = data !== undefined

  useEffect(() => {
    if (!canLoadData || dataLoaded) return
    getData([xAxis.id, yAxis.id])
      .then(v => setData(v.data))    
  }, [canLoadData, dataLoaded])

  const defaultSeries = useMemo(() => {
    if (!dataLoaded) return undefined
    const points = data.map(d => ({x: d[xAxis!.id], y: d[yAxis!.id]}))
    return {label: 'Default', points}
  }, [dataLoaded])

  const series = [defaultSeries].filter(s => s !== undefined)

  if (headersLoaded && axesDefined && dataLoaded) return <>
    <Card>
      <div style={{width: '100%', aspectRatio: 2}}>
        <ParentSize debounceTime={0}>
          {parent => <ScatterChart series={series} width={parent.width} height={parent.height} xAxis={xAxis} yAxis={yAxis} />}
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

  const handleSubmitAxes = (x: string, y: string) => {
    setXAxis(getColumn(x))
    setYAxis(getColumn(y))
  }

  return <Stack direction='column' spacing={2}>
    <Card>
      <Typography level='title-lg'>Axes</Typography>
      <ChartControls onSubmit={handleSubmitAxes} />
    </Card>
    {/* <SeriesCard /> */}
    <ChartCard xAxis={xAxis} yAxis={yAxis} />
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