import { Card, Typography } from "@mui/joy"
import { PointWithSeries } from "../models/Chart"
import { HeaderColumn } from "../models/DataTransferObject"

type TooltipCard_Props = {
  point: PointWithSeries,
  xAxis: HeaderColumn,
  yAxis: HeaderColumn,
}

export const TooltipCard = ({ point, xAxis, yAxis }: TooltipCard_Props) => {
  return <>
    <Card size='sm' sx={{pointerEvents: 'none', transform: `translate(1em, 1em)`}}>
      <Typography level='body-sm' sx={{fontWeight: 600}}>{point.label}</Typography>
      <Typography level='body-xs'>
        <Typography sx={{fontWeight: 600}}>{xAxis.label}: </Typography>
        <Typography>{point.x}</Typography>
        <Typography> {xAxis.unit}</Typography>
      </Typography>
      <Typography level='body-xs'>
        <Typography sx={{fontWeight: 600}}>{yAxis.label}: </Typography>
        <Typography>{point.y}</Typography>
        <Typography> {yAxis.unit}</Typography>
      </Typography>
    </Card>
  </>
}