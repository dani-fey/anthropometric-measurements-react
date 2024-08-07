import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Card, Sheet, Typography } from '@mui/joy'
import { useGlobalContext } from '../contexts/GlobalContext'
import { LoadingState } from '../models/Loadable'
import { ParentSize } from '@visx/responsive'
import { AnimatedAxis, AnimatedGlyphSeries, AnimatedGrid, Axis, GlyphSeries, Grid, XYChart } from '@visx/xychart'
import { scaleLinear } from '@visx/scale'
import { DataResponse, Point } from '../models/DataTransferObject'
import { ParentSizeProvidedProps } from '@visx/responsive/lib/components/ParentSize'
import { Zoom } from '@visx/zoom'
import { Group } from '@visx/group'
import { Circle } from '@visx/shape'
import { Tooltip, TooltipWithBounds, useTooltip } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { voronoi } from '@visx/voronoi'

type Chart_Props = {
  data: DataResponse,
  width: number,
  height: number
}

const Chart = ({ data, width, height }: Chart_Props) => {
  const { xMin, xMax, yMin, yMax } = data

  const xScale = scaleLinear({
    range: [0, width],
    domain: [xMin, xMax],
    round: true,
  })

  const yScale = scaleLinear({
    range: [0, height],
    domain: [yMin, yMax],
    round: true,
  })

  return <>
    <XYChart width={width} height={height} xScale={{type: 'linear', nice: true}} yScale={{type: 'linear'}}>
      <Axis orientation='bottom' />
      <Grid columns={false} numTicks={4} />
      <GlyphSeries dataKey='Men' data={data.data.filter(v => v.series === '0')} xAccessor={d => d.x} yAccessor={d => d.y} />
      <GlyphSeries dataKey='Women' data={data.data.filter(v => v.series === '1')} xAccessor={d => d.x} yAccessor={d => d.y} />
    </XYChart>
  </>
}

const Chart2 = (props: Chart_Props) => {
  const { width, height } = props
  const { data, xMin, xMax, yMin, yMax } = props.data

  const { showTooltip, hideTooltip, tooltipOpen, tooltipLeft, tooltipTop, tooltipData } = useTooltip<Point>({})

  const svgRef = useRef<SVGSVGElement>(null)

  const xScale = useMemo(() => {
    return scaleLinear({
      domain: [xMin, xMax],
      range: [0, width],
      clamp: true,
    })
  }, [xMin, xMax, width])

  const yScale = useMemo(() => {
    return scaleLinear({
      domain: [yMin, yMax],
      range: [height, 0],
      clamp: true,
    })
  }, [yMin, yMax, height])

  const voronoiLayout = useMemo(() => {
    console.log('voronoi data', data)
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
        {data.map((d, i) => {
          return <Circle
            key={`point-${i}`}
            className='point'
            cx={xScale(d.x)}
            cy={yScale(d.y)}
            r={tooltipData === d ? 5 : 2}
            fill={d.series === '0' ? 'red' : 'blue'}
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

export const IndexPage = () => {
  const { headers, data } = useGlobalContext()

  return <Sheet sx={{p: 2}}>
    <Typography level='h1'>Anthropometric Measurements — an Intuitive Visualization</Typography>
    {headers.state === LoadingState.LOADED && data.state === LoadingState.LOADED && <Card>
      <div style={{width: '100%', aspectRatio: 2}}>
        <ParentSize debounceTime={0}>
          {parent => {
            return <Chart2 data={data.value} width={parent.width} height={parent.height} />}
          }
        </ParentSize>
      </div>
    </Card>}
  </Sheet>
}