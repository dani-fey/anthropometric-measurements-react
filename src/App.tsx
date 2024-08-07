import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { BasePage } from './pages/BasePage'
import { IndexPage } from './pages/IndexPage'
import { GlobalContextProvider } from './contexts/GlobalContext'
import { CssBaseline, CssVarsProvider } from '@mui/joy'

const router = createBrowserRouter([
  {
    path: '/',
    element: <BasePage />,
    children: [
      {
        path: '',
        element: <IndexPage />
      }
    ]
  }
])

export const App = () => {
  return <>
    <CssBaseline />
    <CssVarsProvider>
      <GlobalContextProvider>
        <RouterProvider router={router} />
      </GlobalContextProvider>
    </CssVarsProvider>
  </>
}