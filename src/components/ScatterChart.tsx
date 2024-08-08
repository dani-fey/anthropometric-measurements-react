import { Card, useTheme } from "@mui/joy"
import { useRef, useMemo, useCallback } from "react"
import { AxisBottom, AxisLeft } from '@visx/axis'
import { localPoint } from '@visx/event'
import { GridRows, GridColumns } from '@visx/grid'
import { scaleLinear } from '@visx/scale'
import { useTooltip, TooltipWithBounds } from '@visx/tooltip'
import { voronoi } from '@visx/voronoi'
import { DataResponse, Point } from "../models/DataTransferObject"
import { Group } from "@visx/group"
import { Circle } from "@visx/shape"

type ScatterChart_Props = {
  data: DataResponse,
  width: number,
  height: number
}

export const ScatterChart = (props: ScatterChart_Props) => {
  const { width, height } = props
  const { data, xMin, xMax, yMin, yMax } = props.data

  const dx = xMax - xMin
  const dy = yMax - yMin

  const margin = 40
  const expandFactor = 0.1

  const theme = useTheme()
  
  const { showTooltip, hideTooltip, tooltipOpen, tooltipLeft, tooltipTop, tooltipData } = useTooltip<Point>({})

  const svgRef = useRef<SVGSVGElement>(null)

  const xScale = useMemo(() => {
    return scaleLinear({
      domain: [xMin - (dx * expandFactor / 2), xMax + (dx * expandFactor / 2)],
      range: [margin, width - margin],
      nice: true,
    })
  }, [xMin, xMax, width])

  const yScale = useMemo(() => {
    return scaleLinear({
      domain: [yMin - (dy * expandFactor / 2), yMax + (dy * expandFactor / 2)],
      range: [height - margin, margin],
      nice: true,
    })
  }, [yMin, yMax, height])

  const voronoiLayout = useMemo(() => {
    return voronoi<Point>({
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
        <GridRows scale={yScale} left={margin} width={width - 2 * margin} height={height - 2 * margin} stroke={theme.palette.background.level2} />
        <GridColumns scale={xScale} top={margin} width={width - 2 * margin} height={height - 2 * margin} stroke={theme.palette.background.level2} />
        <AxisBottom top={height - margin} scale={xScale} stroke={theme.palette.text.primary} tickStroke={theme.palette.text.primary} tickLabelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} labelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} />
        <AxisLeft left={margin} scale={yScale} stroke={theme.palette.text.primary} tickStroke={theme.palette.text.primary} tickLabelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} labelProps={{fill: theme.palette.text.primary, strokeWidth: 0, paintOrder: 'stroke'}} />
        {data.map((d, i) => {
          return <Circle
            key={`point-${i}`}
            className='point'
            cx={xScale(d.x)}
            cy={yScale(d.y)}
            r={tooltipData === d ? 5 : 2}
            fill={d.series === '0' ? theme.palette.primary[400] : theme.palette.danger[400]}
          />
        })}
      </Group>
    </svg>
    {tooltipOpen && <>
      <TooltipWithBounds
        key={Math.random()}
        left={tooltipLeft}
        top={tooltipTop}
        style={{position: 'absolute', pointerEvents: 'none'}}
      >
        <Card sx={{pointerEvents: 'none', transform: `translate(1em, 1em)`}}>
          {tooltipData?.x}
          <br />
          {tooltipData?.y}

        </Card>
      </TooltipWithBounds>
    </>}
  </>
}

