import { Typography, FormControl, FormLabel, Option, Select, Stack } from "@mui/joy"
import { useState, useMemo } from "react"
import { useGlobalContext } from "../contexts/GlobalContext"
import { LoadingState } from "../models/Loadable"

export const ColumnSelector = ({ label, onChange }: {label: string, onChange: (column: number) => void}) => {
  const { headers } = useGlobalContext()

  const [ value, setValue ] = useState<number | undefined>(undefined)

  const optionValues = useMemo(() => headers.state === LoadingState.LOADED ? headers.value.filter(h => !!h.include) : [], [headers])
  const optionComponents = useMemo(() => optionValues.map(o => <Option sx={{maxWidth: 'min(640px, 100vw)'}} key={o.id} value={o.id} label={<>{o.label}&nbsp;<Typography color='neutral'>({o.unit})</Typography></>}>
    <Stack direction='column'>
      <Typography>{o.label} <Typography color='neutral'>({o.unit})</Typography></Typography>
      <Typography level='body-xs' color='neutral'>{o.description}</Typography>
    </Stack>
  </Option>), [optionValues])

  const handleChange = (next: number) => {
    setValue(next)
    onChange(next)
  }

  return <>
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Select onChange={(_, v) => handleChange(v as number)}>
        {optionComponents}
      </Select>
      {value !== undefined && headers.state === LoadingState.LOADED && <Typography sx={{mt: 1}} color='neutral' level='body-xs'>{headers.value.find(h => h.id === value)?.description}</Typography>}
    </FormControl>
  </>
}
