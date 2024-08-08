import { useEffect, useState } from 'react'
import { Card, Grid, Sheet, Stack, Typography } from '@mui/joy'
import { useGlobalContext } from '../contexts/GlobalContext'
import { LoadingState } from '../models/Loadable'
import { ParentSize } from '@visx/responsive'
import { ThemeToggle } from '../components/ThemeToggle'
import { ScatterChart } from '../components/ScatterChart'
import { ColumnSelector } from '../components/ColumnSelector'

const ChartControls = ({ onSubmit }: {onSubmit: (xAxis: number, yAxis: number) => void}) => {
  const [ xAxis, setXAxis ] = useState<number | undefined>(undefined)
  const [ yAxis, setYAxis ] = useState<number | undefined>(undefined)

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
  const { headers, data } = useGlobalContext()

  if (headers.state === LoadingState.LOADED && data.state === LoadingState.LOADED) return <>
    <Card>
      <div style={{width: '100%', aspectRatio: 2}}>
        <ParentSize debounceTime={0}>
          {parent => <ScatterChart data={data.value} width={parent.width} height={parent.height} />}
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
  const { requestData } = useGlobalContext()

  return <Sheet sx={{p: 2}}>
    <Stack direction='column' spacing={2}>
      <Title />
      <Card>
        <ChartControls onSubmit={(x, y) => requestData(x, y)} />
      </Card>
      <ChartCard />
    </Stack>
  </Sheet>
}