import { Card, Typography, useTheme } from "@mui/joy"
import { useRef, useMemo, useCallback, useEffect } from "react"
import { AxisBottom, AxisLeft } from '@visx/axis'
import { localPoint } from '@visx/event'
import { GridRows, GridColumns } from '@visx/grid'
import { scaleLinear } from '@visx/scale'
import { useTooltip, TooltipWithBounds } from '@visx/tooltip'
import { voronoi } from '@visx/voronoi'
import { Data, HeaderColumn, Datum } from "../models/DataTransferObject"
import { Group } from "@visx/group"
import { Circle } from "@visx/shape"
import { useGlobalContext } from "../contexts/GlobalContext"
import { Series } from "../models/Series"
import { useSeriesColor } from "../hooks/useSeriesColor"
import { Filter } from "../models/Filter"
import { Tuple4 } from "../models/Tuple"

/*
type DatumWithSeries = {series: string, seriesIndex: number} & Datum

type TooltipCard_Props = {
  point: DatumWithSeries
}

const TooltipCard = ({ point }: TooltipCard_Props) => {
  const { axes } = useGlobalContext()

  const xLabel = useMemo(() => axes.x?.label || '', [axes])
  const xUnit = useMemo(() => axes.x?.unit || '', [axes])
  const yLabel = useMemo(() => axes.y?.label || '', [axes])
  const yUnit = useMemo(() => axes.y?.unit || '', [axes])

  return <>
    <Card size='sm' sx={{pointerEvents: 'none', transform: `translate(1em, 1em)`}}>
      <Typography level='body-sm' sx={{fontWeight: 600}}>{point.series}</Typography>
      <Typography level='body-xs'>
        <Typography sx={{fontWeight: 600}}>{xLabel}: </Typography>
        <Typography>{point.x}</Typography>
        <Typography> {xUnit}</Typography>
      </Typography>
      <Typography level='body-xs'>
        <Typography sx={{fontWeight: 600}}>{yLabel}: </Typography>
        <Typography>{point.y}</Typography>
        <Typography> {yUnit}</Typography>
      </Typography>
    </Card>
  </>
}
  */

type Point = {x: number, y: number}
type Series = {label: string, points: Point[]}
type PointWithSeries = Point & Omit<Series, 'points'>
type Axis = {label: string, unit: string}
type AxisStatistics = {xMin: number, xMax: number, dx: number, yMin: number, yMax: number, dy: number}
const AxisStatistics = (points: Point[]): AxisStatistics => {
  if (!points.length) return {xMin: 0, xMax: 0, dx: 0, yMin: 0, yMax: 0, dy: 0}
  const [first, ...rest] = points
  let [xMin, xMax, yMin, yMax] = [first.x, first.x, first.y, first.y]
  rest.forEach(p => {
    xMin = Math.min(p.x, xMin)
    xMax = Math.max(p.x, xMax)
    yMin = Math.min(p.y, yMin)
    yMax = Math.max(p.y, yMax)
  })
  const [dx, dy] = [xMax - xMin, yMax - yMin]
  return {xMin, xMax, dx, yMin, yMax, dy}
}
type ScatterChart_Props = {
  series: Series[],
  xAxis: Axis,
  yAxis: Axis,
  width: number,
  height: number
}

const margin = {
  top: 40,
  right: 40,
  left: 80,
  bottom: 60,
}
const expandFactor = 0.1

export const ScatterChart = (props: ScatterChart_Props) => {
  const { width, height, xAxis, yAxis, series } = props
  const allData: PointWithSeries[] = useMemo(() => {
    return series.flatMap(s => {
      const {points, ...seriesWithoutPoints} = s
      return points.map(p => ({...p, ...seriesWithoutPoints}))
    })
  }, [series])
  console.log('allData', allData)

  const statistics: AxisStatistics = useMemo(() => AxisStatistics(allData), [allData])
  console.log('statistics', statistics)


  const theme = useTheme()
  const { getSeriesColor } = useSeriesColor()
  
  const { showTooltip, hideTooltip, tooltipOpen, tooltipLeft, tooltipTop, tooltipData } = useTooltip<PointWithSeries>({})

  const svgRef = useRef<SVGSVGElement>(null)

  const xScale = useMemo(() => {
    const { xMin, dx, xMax } = statistics
    return scaleLinear({
      domain: [xMin - (dx * expandFactor / 2), xMax + (dx * expandFactor / 2)],
      range: [margin.left, width - margin.right],
      nice: true,
    })
  }, [statistics, width])

  const yScale = useMemo(() => {
    const { yMin, dy, yMax } = statistics
    return scaleLinear({
      domain: [yMin - (dy * expandFactor / 2), yMax + (dy * expandFactor / 2)],
      range: [height - margin.bottom, margin.top],
      nice: true,
    })
  }, [statistics, height])

  const voronoiLayout = useMemo(() => {
    return voronoi<Point>({
      x: d => xScale(d.x),
      y: d => yScale(d.y),
      width,
      height
    })(allData)
  }, [voronoi, width, height, xScale, yScale, allData])

  const handlePointerMove = useCallback((event: React.PointerEvent<SVGElement>) => {
    if (!svgRef.current) return
    const local = localPoint(svgRef.current, event)
    if (!local) return
    const radius = 100
    const closest = voronoiLayout.find(local.x, local.y, radius)
    if (!closest) hideTooltip()
    else showTooltip({
      tooltipLeft: xScale(closest.data.x),
      tooltipTop: yScale(closest.data.y),
      tooltipData: closest.data as PointWithSeries /* TODO kludge */,
    })
  }, [showTooltip, hideTooltip, svgRef, localPoint, voronoiLayout, xScale, yScale])

  return <>
    <svg width={width} height={height} onPointerMove={handlePointerMove} ref={svgRef} style={{cursor: tooltipOpen ? 'pointer' : 'default'}}>
      <Group pointerEvents={'none'}>
        <GridRows scale={yScale} left={margin.left} width={width - (margin.left + margin.right)} height={height - (margin.top + margin.bottom)} stroke={theme.palette.background.level2} />
        <GridColumns scale={xScale} top={margin.top} width={width - (margin.left + margin.right)} height={height - (margin.top + margin.bottom)} stroke={theme.palette.background.level2} />
        <AxisBottom label={`${xAxis.label} (${xAxis.unit})`} top={height - margin.bottom} scale={xScale} stroke={theme.palette.text.primary} tickStroke={theme.palette.text.primary} tickLabelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} labelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} />
        <AxisLeft label={`${yAxis.label} (${yAxis.unit})`} left={margin.left} scale={yScale} stroke={theme.palette.text.primary} tickStroke={theme.palette.text.primary} tickLabelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} labelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} />
        {allData.map((d, i) => {
          return <Circle
            key={`point-${i}`}
            className='point'
            cx={xScale(d.x)}
            cy={yScale(d.y)}
            r={(tooltipData === d) ? 5 : 2}
            fill={getSeriesColor(0) /* get series index */}
          />
        })}
      </Group>
    </svg>
    {tooltipOpen && !!tooltipData && <>
      <TooltipWithBounds
        key={Math.random()}
        left={tooltipLeft}
        top={tooltipTop}
        style={{position: 'absolute', pointerEvents: 'none'}}
      >
        {/* <TooltipCard point={tooltipData} /> */}
      </TooltipWithBounds>
    </>}
  </>
}

