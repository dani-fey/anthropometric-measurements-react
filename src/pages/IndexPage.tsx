import { useEffect, useState } from 'react'
import { Box, Card, Chip, Grid, IconButton, Input, Option, Select, Stack, Table, Typography, useTheme } from '@mui/joy'
import { useGlobalContext } from '../contexts/GlobalContext'
import { LoadingState } from '../models/Loadable'
import { ParentSize } from '@visx/responsive'
import { ThemeToggle } from '../components/ThemeToggle'
import { ScatterChart } from '../components/ScatterChart'
import { ColumnSelector } from '../components/ColumnSelector'
import { HeaderColumn } from '../models/DataTransferObject'
import { Axis } from '../models/Axis'
import { Add, Delete } from '@mui/icons-material'
import { useSeriesColor } from '../hooks/useSeriesColor'
import { Filter } from '../models/Filter'

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

const ChartCard = () => {
  const { headers, data, axes, series } = useGlobalContext()

  const headersLoaded = headers.state === LoadingState.LOADED
  const dataLoaded = data.state === LoadingState.LOADED
  const axesDefined = axes.x !== undefined && axes.y !== undefined
  const dataLoadedForAxes = dataLoaded && axesDefined && (!data.value.data.length || ([axes.x!.id, axes.y!.id].every(column => Object.keys(data.value.data[0]).includes(column))))

  if (headersLoaded && dataLoadedForAxes) return <>
    <Card>
      <div style={{width: '100%', aspectRatio: 2}}>
        <ParentSize debounceTime={0}>
          {parent => <ScatterChart data={data.value} width={parent.width} height={parent.height} xAxis={axes.x!} yAxis={axes.y!} series={series} />}
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

export const IndexPage = () => {
  const { requestData, setAxis } = useGlobalContext()

  return <Box sx={{p: 2, maxWidth: 1200, mx: 'auto'}}>
    <Stack direction='column' spacing={2}>
      <Title />
      <Card>
        <Typography level='title-lg'>Axes</Typography>
        <ChartControls onSubmit={(x, y) => {
          setAxis(Axis.X, x)
          setAxis(Axis.Y, y)
          requestData(x, y)
        }} />
      </Card>
      <SeriesCard />
      <ChartCard />
    </Stack>
  </Box>
}