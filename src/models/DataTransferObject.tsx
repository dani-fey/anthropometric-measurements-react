export type HeaderColumnDTO = [number, string, string, number, string]
export type HeaderColumn = {
  id: number,
  include: boolean,
  label: string,
  unit: string,
  description: string
}
const HeaderColumn = (id: number, dto: HeaderColumnDTO) => ({
  id,
  include: dto[0] === 1,
  label: dto[1],
  unit: dto[2],
  description: dto[4]
})
export const HeaderColumns = (dto: HeaderColumnDTO[]) => dto.map((v, i) => HeaderColumn(i, v))

type PointDTO = [number, number]
export type Point = {x: number, y: number, series: string}
export const Point = (x: number, y: number, series: string): Point => ({x, y, series})

export type DataResponseDTO = {
  time: number,
  col_1: number,
  col_2: number,
  size_1: number,
  size_2: number,
  data_1: PointDTO[],
  data_2: PointDTO[],
}
export type DataResponse = {
  data: Point[],
  xCol: number,
  yCol: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
}
export const DataResponse = (dto: DataResponseDTO) => {
  const { col_1, col_2, data_1, data_2 } = dto
  let xMin: number | undefined
  let xMax: number | undefined
  let yMin: number | undefined
  let yMax: number | undefined
  const data = [data_1, data_2].flatMap((v, i) => {
    return v.map(p => {
      const series = i.toString()
      const [ x, y ] = p
      xMin = !!xMin ? Math.min(xMin, x) : x
      xMax = !!xMax ? Math.max(xMax, x) : x
      yMin = !!yMin ? Math.min(yMin, y) : y
      yMax = !!yMax ? Math.max(yMax, y) : y
      return Point(x, y, series)
    })
  })
  return {data, xMin, xMax, yMin, yMax, xCol: col_1 - 1, yCol: col_2 - 1} as DataResponse
}