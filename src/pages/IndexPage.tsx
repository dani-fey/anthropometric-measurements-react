import { useEffect, useState } from 'react'
import { Box, Card, Grid, Sheet, Stack, Typography } from '@mui/joy'
import { useGlobalContext } from '../contexts/GlobalContext'
import { LoadingState } from '../models/Loadable'
import { ParentSize } from '@visx/responsive'
import { ThemeToggle } from '../components/ThemeToggle'
import { ScatterChart } from '../components/ScatterChart'
import { ColumnSelector } from '../components/ColumnSelector'
import { HeaderColumn } from '../models/DataTransferObject'
import { Axis } from '../models/Axis'

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

const ChartCard = () => {
  const { headers, data, axes } = useGlobalContext()

  const headersLoaded = headers.state === LoadingState.LOADED
  const dataLoaded = data.state === LoadingState.LOADED
  const axesDefined = axes.x !== undefined && axes.y !== undefined
  const dataLoadedForAxes = dataLoaded && axesDefined && (!data.value.data.length || ([axes.x!.id, axes.y!.id].every(column => Object.keys(data.value.data[0]).includes(column))))

  if (headersLoaded && dataLoadedForAxes) return <>
    <Card>
      <div style={{width: '100%', aspectRatio: 2}}>
        <ParentSize debounceTime={0}>
          {parent => <ScatterChart data={data.value} width={parent.width} height={parent.height} xAxis={axes.x!} yAxis={axes.y!} />}
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
        <ChartControls onSubmit={(x, y) => {
          setAxis(Axis.X, x)
          setAxis(Axis.Y, y)
          requestData(x, y)
        }} />
      </Card>
      <ChartCard />
    </Stack>
  </Box>
}