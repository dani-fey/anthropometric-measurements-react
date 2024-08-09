export type HeaderColumnMap = {[id: string]: HeaderColumn}
export type HeaderColumn = {
  id: string,
  index: string,
  include: boolean,
  label: string,
  unit: string,
  scale: number,
  description: string
}

export type Datum = {[id: string]: number}
export type MinMax = {min: number, max: number}

export type DataResponse = {
  time: number,
  data: Datum[],
}
export type Data = {
  data: Datum[],
  statistics: {[id: string]: MinMax}
}
export const Data = (dto: DataResponse) => {
  const { data } = dto
  let response: Data = {
    data,
    statistics: {}
  }
  data.forEach(d => {
    Object.entries(d).forEach(([column, value]) => {
      const last = response.statistics[column]
      if (last === undefined) response.statistics[column] = {min: value, max: value}
      else {
        if (value > last.max) response.statistics[column].max = value
        if (value < last.min) response.statistics[column].min = value
      }
    })
  })
  return response
}