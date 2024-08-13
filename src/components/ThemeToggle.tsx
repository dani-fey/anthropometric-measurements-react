import { IconButton, useColorScheme } from "@mui/joy"
import { ColorTheme } from "../models/Models"
import { DarkMode, LightMode } from "@mui/icons-material"
import { useCallback } from "react"

export const ThemeToggle = () => {
  const { mode, setMode } = useColorScheme()

  const handleToggle = useCallback(() => {
    const targetMode = mode === ColorTheme.LIGHT ? ColorTheme.DARK : ColorTheme.LIGHT
    setMode(targetMode)
  }, [mode, setMode])

  return <IconButton variant='plain' color='primary' onClick={handleToggle}>
    {mode === ColorTheme.LIGHT && <LightMode />}
    {mode === ColorTheme.DARK && <DarkMode />}
  </IconButton>
}