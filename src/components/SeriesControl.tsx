import { Add, DeveloperBoard, Wc, Delete } from "@mui/icons-material"
import { Card, Typography, Stack, IconButton, Dropdown, MenuButton, Menu, MenuItem, Grid, FormControl, FormLabel, Input, Chip, Table, Select, Divider, Option } from "@mui/joy"
import { useState, useEffect } from "react"
import { useHeaderContext } from "../contexts/HeaderContext"
import { useSeriesColor } from "../hooks/useSeriesColor"
import { Comparator, Filter, SeriesDefinition } from "../models/Models"

export const SeriesControl = ({ onChange }: {onChange: (series: SeriesDefinition[]) => void}) => {
  const { getSeriesColor } = useSeriesColor()
  const { visibleHeaders, defaultColumn, getColumn } = useHeaderContext()

  const [ series, setSeries ] = useState<SeriesDefinition[]>([])

  useEffect(() => {
    onChange(series)
  }, [series])

  const handleSetMenVsWomen = () => {
    const genderColumn = getColumn('GENDER')
    setSeries([
      {
        ...SeriesDefinition('Men'),
        filters: [Filter(genderColumn, Comparator.EQUAL, 1)]
      },
      {
        ...SeriesDefinition('Women'),
        filters: [Filter(genderColumn, Comparator.EQUAL, 2)]
      }
    ])
  }

  const handleAddSeries = () => {
    setSeries(s => [...s, SeriesDefinition('New Series')])
  }

  const handleSetSeriesLabel = (id: string, label: string) => {
    setSeries(s => s.map(s2 => s2.id === id ? ({...s2, label}) : s2))
  }

  const handleRemoveSeries = (id: string) => {
    setSeries(s => s.filter(s2 => s2.id !== id))
  }

  const handleAddFilter = (id: string) => {
    setSeries(s => s.map(s2 => s2.id === id ? ({...s2, filters: [...s2.filters, Filter(defaultColumn, Comparator.EQUAL, 0)]}) : s2))
  }

  const handleRemoveFilter = (seriesId: string, filterId: string) => {
    setSeries(s => s.map(s2 => s2.id === seriesId ? ({...s2, filters: s2.filters.filter(f => f.id !== filterId)}) : s2))
  }

  const setFilterColumn = (seriesId: string, filterId: string, columnId: string) => {
    const column = getColumn(columnId)
    setSeries(s => s.map(s2 => s2.id === seriesId ? ({...s2, filters: s2.filters.map(f => f.id === filterId ? ({...f, column}) : f)}) : s2))
  }

  const setFilterComparator = (seriesId: string, filterId: string, comparator: Comparator) => {
    setSeries(s => s.map(s2 => s2.id === seriesId ? ({...s2, filters: s2.filters.map(f => f.id === filterId ? ({...f, comparator}) : f)}) : s2))
  }

  const setFilterValue = (seriesId: string, filterId: string, value: number) => {
    setSeries(s => s.map(s2 => s2.id === seriesId ? ({...s2, filters: s2.filters.map(f => f.id === filterId ? ({...f, value}) : f)}) : s2))
  }

  return <Card>
    <Typography level='title-lg'>
      Series
      <span style={{marginInlineStart: '0.5em', verticalAlign: 'sub'}}>
        <Stack sx={{display: 'inline-block'}} direction='row' spacing={1}>
          <IconButton size='sm' color='primary' onClick={handleAddSeries}>
            <Add />
          </IconButton>
          <Dropdown>
            <MenuButton slots={{ root: IconButton }} slotProps={{ root: { size: 'sm', color: 'primary' } }}>
              <DeveloperBoard />
            </MenuButton>
            <Menu>
              <MenuItem onClick={handleSetMenVsWomen}><Wc />Men vs. Women</MenuItem>
            </Menu>
          </Dropdown>
        </Stack>
      </span>
    </Typography>
    <Grid container spacing={1}>
      {series.map((s, i) => <Grid xs={12} md={6} key={s.id}>
        <Card variant='soft'>
          <FormControl>
            <FormLabel>Series Name</FormLabel>
            <Input defaultValue={s.label} startDecorator={<Chip size='sm' sx={{bgcolor: getSeriesColor(i)}} />} onChange={v => handleSetSeriesLabel(s.id, v.target.value)}></Input>
          </FormControl>
          <FormLabel>Filters</FormLabel>
          <Stack direction='column' spacing={1}>
            {s.filters.map(f => <Table key={f.id}>
              <tbody>
                <tr>
                  <td style={{width: '40%'}}>
                    <Select placeholder='Column' defaultValue={f.column.id} onChange={(_, v) => setFilterColumn(s.id, f.id, v as string)}>
                      {visibleHeaders.map(h => <Option key={h.id} value={h.id}>{h.label}</Option>)}
                    </Select>
                  </td>
                  <td style={{width: '30%'}}>
                    <Select placeholder='Column' defaultValue={f.comparator} onChange={(_, v) => setFilterComparator(s.id, f.id, v as Comparator)}>
                      {Object.values(Comparator).map(c => <Option key={c} value={c}>{c}</Option>)}
                    </Select>
                  </td>
                  <td style={{width: '30%'}}>
                    <Input defaultValue={f.value} endDecorator={f.column.unit} onChange={v => setFilterValue(s.id, f.id, parseInt(v.target.value))} />
                  </td>
                  <td style={{width: '10%'}}>
                    <IconButton color='danger' variant='soft' onClick={_ => handleRemoveFilter(s.id, f.id)}><Delete /></IconButton>
                  </td>
                </tr>
              </tbody>
            </Table>)}
            <IconButton color='primary' variant='soft' onClick={_ => handleAddFilter(s.id)}>
              <Add />
            </IconButton>
          </Stack>
          <Divider />
          <IconButton variant='soft' size='sm' color='danger' onClick={_ => handleRemoveSeries(s.id)}>
            <Delete />
          </IconButton>
        </Card>
      </Grid>)}
    </Grid>
  </Card>
}
