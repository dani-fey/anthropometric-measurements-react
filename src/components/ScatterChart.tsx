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

type TooltipCard_Props = {
  point: Datum
}

const TooltipCard = ({ point }: TooltipCard_Props) => {
  const { axes } = useGlobalContext()

  const xLabel = useMemo(() => axes.x?.label || '', [axes])
  const xUnit = useMemo(() => axes.x?.unit || '', [axes])
  const yLabel = useMemo(() => axes.y?.label || '', [axes])
  const yUnit = useMemo(() => axes.y?.unit || '', [axes])

  return <>
    <Card size='sm' sx={{pointerEvents: 'none', transform: `translate(1em, 1em)`}}>
      <Typography level='body-sm' sx={{fontWeight: 600}}>Series {point.series}</Typography>
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

type ScatterChart_Props = {
  data: Data,
  xAxis: HeaderColumn,
  yAxis: HeaderColumn,
  width: number,
  height: number
}

export const ScatterChart = (props: ScatterChart_Props) => {
  const { width, height, xAxis, yAxis } = props
  const data = props.data.data.map(v => ({x: v[xAxis.id], y: v[yAxis.id], series: 0}))

  const min = (axis: string) => props.data.statistics[axis].min
  const max = (axis: string) => props.data.statistics[axis].max
  const delta = (axis: string) => max(axis) - min(axis)
  const stats = (axis: string) => [min(axis), delta(axis), max(axis)]

  const [xMin, dx, xMax] = stats(xAxis.id)
  const [yMin, dy, yMax] = stats(yAxis.id)

  const margin = {
    top: 40,
    right: 40,
    left: 80,
    bottom: 60,
  }
  const expandFactor = 0.1

  const theme = useTheme()
  
  const { showTooltip, hideTooltip, tooltipOpen, tooltipLeft, tooltipTop, tooltipData } = useTooltip<Datum>({})

  const svgRef = useRef<SVGSVGElement>(null)

  const xScale = useMemo(() => {
    return scaleLinear({
      domain: [xMin - (dx * expandFactor / 2), xMax + (dx * expandFactor / 2)],
      range: [margin.left, width - margin.right],
      nice: true,
    })
  }, [xMin, xMax, width])

  const yScale = useMemo(() => {
    return scaleLinear({
      domain: [yMin - (dy * expandFactor / 2), yMax + (dy * expandFactor / 2)],
      range: [height - margin.bottom, margin.top],
      nice: true,
    })
  }, [yMin, yMax, height])

  const voronoiLayout = useMemo(() => {
    return voronoi<Datum>({
      x: d => xScale(d.x),
      y: d => yScale(d.y),
      width,
      height
    })(data)
  }, [voronoi, width, height, xScale, yScale, data])

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
      tooltipData: closest.data,
    })
  }, [showTooltip, hideTooltip, svgRef, localPoint, voronoiLayout, xScale, yScale])

  return <>
    <svg width={width} height={height} onPointerMove={handlePointerMove} ref={svgRef} style={{cursor: tooltipOpen ? 'pointer' : 'default'}}>
      <Group pointerEvents={'none'}>
        <GridRows scale={yScale} left={margin.left} width={width - (margin.left + margin.right)} height={height - (margin.top + margin.bottom)} stroke={theme.palette.background.level2} />
        <GridColumns scale={xScale} top={margin.top} width={width - (margin.left + margin.right)} height={height - (margin.top + margin.bottom)} stroke={theme.palette.background.level2} />
        <AxisBottom label={`${xAxis.label} (${xAxis.unit})`} top={height - margin.bottom} scale={xScale} stroke={theme.palette.text.primary} tickStroke={theme.palette.text.primary} tickLabelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} labelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} />
        <AxisLeft label={`${yAxis.label} (${yAxis.unit})`} left={margin.left} scale={yScale} stroke={theme.palette.text.primary} tickStroke={theme.palette.text.primary} tickLabelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} labelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} />
        {data.map((d, i) => {
          return <Circle
            key={`point-${i}`}
            className='point'
            cx={xScale(d.x)}
            cy={yScale(d.y)}
            r={tooltipData === d ? 5 : 2}
            fill={d.series === 0 ? theme.palette.danger[400] : theme.palette.primary[400]}
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
        <TooltipCard point={tooltipData} />
      </TooltipWithBounds>
    </>}
  </>
}

