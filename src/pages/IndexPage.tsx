import { useEffect, useState } from 'react'
import { Box, Card, Grid, Stack, Typography } from '@mui/joy'
import { ThemeToggle } from '../components/ThemeToggle'
import { ColumnSelector } from '../components/ColumnSelector'
import { useHeaderContext } from '../contexts/HeaderContext'
import { HeaderColumn } from '../models/DataTransferObject'
import { SeriesDefinition } from '../models/Chart'
import { SeriesControl } from '../components/SeriesControl'
import { ChartControl } from '../components/ChartControl'

const ChartControls = ({ onSubmit }: {onSubmit: (xAxis: string, yAxis: string) => void}) => {
  const [ xAxis, setXAxis ] = useState<string | undefined>(undefined)
  const [ yAxis, setYAxis ] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (xAxis === undefined || yAxis === undefined) return
    onSubmit(xAxis, yAxis)
  }, [xAxis, yAxis])
  
  return <>
    <Grid container spacing={2}>
      <Grid xs={12} md={6}>
        <ColumnSelector label='X-Axis' onChange={v => setXAxis(v)} />
      </Grid>
      <Grid xs={12} md={6}>
        <ColumnSelector label='Y-Axis' onChange={v => setYAxis(v)} />
      </Grid>
    </Grid>
  </>
}

const Title = () => {
  return <div>
    <Typography level='h1'>
      Anthropometric Measurements — an Intuitive Visualization
      <span style={{marginInlineStart: '0.25em'}}>
        <ThemeToggle />
      </span>
    </Typography>
    <Typography level='body-xs'>Maintained by Hannah Bast, Dani Fey</Typography>
  </div>
}

const ChartView = () => {
  const { getColumn } = useHeaderContext()

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
    <SeriesControl onChange={setSeries} />
    <ChartControl xAxis={xAxis} yAxis={yAxis} series={series} />
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