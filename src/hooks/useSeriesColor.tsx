import { useTheme } from "@mui/joy"
import { useCallback } from "react"

export const useSeriesColor = () => {
  const theme = useTheme()

  const getSeriesColor = useCallback((index: number) => {
    const colors = [theme.palette.danger[400], theme.palette.primary[400], theme.palette.warning[400], theme.palette.success[400]]
    return colors[index % colors.length]
  }, [theme])

  return { getSeriesColor }
}