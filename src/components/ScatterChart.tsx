import { useTheme } from "@mui/joy"
import { useRef, useMemo, useCallback } from "react"
import { AxisBottom, AxisLeft } from '@visx/axis'
import { localPoint } from '@visx/event'
import { GridRows, GridColumns } from '@visx/grid'
import { scaleLinear } from '@visx/scale'
import { useTooltip, TooltipWithBounds } from '@visx/tooltip'
import { voronoi } from '@visx/voronoi'
import { Group } from "@visx/group"
import { Area, Circle } from "@visx/shape"
import { useSeriesColor } from "../hooks/useSeriesColor"
import { PointWithSeries, AxisStatistics, Point, Series, LinearRegression, HeaderColumn } from "../models/Models"
import { TooltipCard } from "./TooltipCard"
import { RectClipPath } from "@visx/clip-path"

type ScatterChart_Props = {
  series: Series[],
  xAxis: HeaderColumn,
  yAxis: HeaderColumn,
  width: number,
  height: number
}

const expandFactor = 0

export const ScatterChart = (props: ScatterChart_Props) => {
  const { width, height, xAxis, yAxis, series } = props
  const allData: PointWithSeries[] = useMemo(() => {
    return series.flatMap(s => {
      const {points, ...seriesWithoutPoints} = s
      return points.map(p => ({...p, ...seriesWithoutPoints}))
    })
  }, [series])

  const statistics: AxisStatistics = useMemo(() => AxisStatistics(allData), [allData])

  const regressions: LinearRegression[] = useMemo(() => series.map(s => LinearRegression(s.points)), [series])

  const theme = useTheme()
  const { getSeriesColor } = useSeriesColor()
  
  const { showTooltip, hideTooltip, tooltipOpen, tooltipLeft, tooltipTop, tooltipData } = useTooltip<PointWithSeries>({})

  const svgRef = useRef<SVGSVGElement>(null)

  const margin = useMemo(() => {
    return {
      top: 40,
      right: width * (1 / 24),
      left: width * (1 / 12),
      bottom: 60,
    }
  }, [width])

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
        <AxisLeft labelOffset={Math.min(width * 0.05, 40)} label={`${yAxis.label} (${yAxis.unit})`} left={margin.left} scale={yScale} stroke={theme.palette.text.primary} tickStroke={theme.palette.text.primary} tickLabelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} labelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} />
        <RectClipPath id='regression-clip' x={margin.left} y={margin.top} width={width - (margin.left + margin.right)} height={height - (margin.top + margin.bottom)} />
        <Group clipPath='url(#regression-clip)'>
          {regressions.map((r, i) => {
            return <Area
              key={`regression-${i}`}
              stroke={getSeriesColor(i)}
              fill={getSeriesColor(i)}
              opacity={0.2}
              data={
                [xScale.domain()[0], xScale.domain()[1]]
                  .map(x => ({x, y0: x * r.a + r.b - r.epsilon, y1: x * r.a + r.b + r.epsilon}))
              }
              x={d => xScale(d.x)}
              y0={d => yScale(d.y0)}
              y1={d => yScale(d.y1)}
            />
          })}
        </Group>
        {series.flatMap((s, si) => s.points.map((d, pi) => {
          return <Circle
            key={`point-${si}-${pi}`}
            className='point'
            cx={xScale(d.x)}
            cy={yScale(d.y)}
            r={(tooltipData === d) ? 5 : 2}
            fill={getSeriesColor(si)}
          />
        }))}
      </Group>
    </svg>
    {tooltipOpen && !!tooltipData && <>
      <TooltipWithBounds
        key={Math.random()}
        left={tooltipLeft}
        top={tooltipTop}
        style={{position: 'absolute', pointerEvents: 'none'}}
      >
        <TooltipCard point={tooltipData} xAxis={xAxis} yAxis={yAxis} />
      </TooltipWithBounds>
    </>}
  </>
}