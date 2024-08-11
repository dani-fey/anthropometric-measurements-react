import { Typography, FormControl, FormLabel, Option, Select, Stack } from "@mui/joy"
import { useState, useMemo } from "react"
import { useHeaderContext } from "../contexts/HeaderContext"

export const ColumnSelector = ({ label, onChange }: {label: string, onChange: (column: string) => void}) => {
  const { headers, getColumn } = useHeaderContext()

  const [ value, setValue ] = useState<string | undefined>(undefined)

  const optionValues = useMemo(() => Object.values(headers).filter(h => !!h.include), [headers])
  const optionComponents = useMemo(() => optionValues.map(o => <Option sx={{maxWidth: 'min(640px, 100vw)'}} key={o.id} value={o.id} label={<>{o.label}&nbsp;<Typography color='neutral'>({o.unit})</Typography></>}>
    <Stack direction='column'>
      <Typography>{o.label} <Typography color='neutral'>({o.unit})</Typography></Typography>
      <Typography level='body-xs' color='neutral'>{o.description}</Typography>
    </Stack>
  </Option>), [optionValues])

  const description = useMemo(() => !!value ? getColumn(value).description : undefined, [value])

  const handleChange = (next: string) => {
    setValue(next)
    onChange(next)
  }

  return <>
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Select onChange={(_, v) => handleChange(v as string)}>
        {optionComponents}
      </Select>
      {description !== undefined && <Typography sx={{mt: 1}} color='neutral' level='body-xs'>{description}</Typography>}
    </FormControl>
  </>
}
