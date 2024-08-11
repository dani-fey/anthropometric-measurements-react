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
