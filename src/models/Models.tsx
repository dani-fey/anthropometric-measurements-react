import { v4 } from "uuid"

// Theme Types

export enum ColorTheme {
  LIGHT = 'light',
  DARK = 'dark',
}

// Chart Types

export type Point = {x: number, y: number}

export type Series = {label: string, points: Point[]}

export type PointWithSeries = Point & Omit<Series, 'points'>

export type AxisStatistics = {xMin: number, xMax: number, dx: number, yMin: number, yMax: number, dy: number}
export const AxisStatistics = (points: Point[]): AxisStatistics => {
  if (!points.length) return {xMin: 0, xMax: 0, dx: 0, yMin: 0, yMax: 0, dy: 0}
  const [first, ...rest] = points
  let [xMin, xMax, yMin, yMax] = [first.x, first.x, first.y, first.y]
  rest.forEach(p => {
    xMin = Math.min(p.x, xMin)
    xMax = Math.max(p.x, xMax)
    yMin = Math.min(p.y, yMin)
    yMax = Math.max(p.y, yMax)
  })
  const [dx, dy] = [xMax - xMin, yMax - yMin]
  return {xMin, xMax, dx, yMin, yMax, dy}
}

export type SeriesDefinition = {
  id: string,
  label: string,
  filters: Filter[],
}
export const SeriesDefinition = (label: string) => ({
  id: v4(),
  label,
  filters: []
})

export enum Comparator {
  EQUAL = 'Equals',
  NOT_EQUAL = 'Does Not Equal',
  GREATER_THAN = 'Greater Than',
  LESSER_THAN = 'Lesser Than',
}

export type Filter = {
  id: string,
  column: HeaderColumn,
  comparator: Comparator,
  value: number,
}
export const Filter = (column: HeaderColumn, comparator: Comparator, value: number): Filter => ({ id: v4(), column, comparator, value })

export const compare = (comparator: Comparator, compareValue: number) => (dataValue: number) => {
  if (comparator === Comparator.EQUAL) return dataValue === compareValue
  else if (comparator === Comparator.NOT_EQUAL) return dataValue !== compareValue
  else if (comparator === Comparator.GREATER_THAN) return dataValue > compareValue
  else if (comparator === Comparator.LESSER_THAN) return dataValue < compareValue
  return false
}

export type LinearRegression = {
  a: number,
  b: number,
  epsilon: number,
}
export const LinearRegression = (points: Point[]): LinearRegression => {
  let [ sumX, sumY, sumXSq, sumYSq, sumXY ] = [0, 0, 0, 0, 0]
  points.forEach(p => {
    const {x, y} = p
    sumX += x
    sumY += y
    sumXSq += x * x
    sumYSq += y * y
    sumXY += x * y
  })
  const n = points.length
  const [tX, tY] = [n * sumXSq - sumX * sumX, n * sumYSq - sumY * sumY]
  const [a, b] = [(n * sumXY - sumX * sumY) / tX, (sumY * sumXSq - sumX * sumXY) / tX]
  const epsilon = Math.sqrt(tY - a * a * tX) / n
  return {a, b, epsilon}
}

// Data Transfer Types

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

export type DataResponse = {
  time: number,
  data: Datum[],
}