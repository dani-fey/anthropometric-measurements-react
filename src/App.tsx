import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { BasePage } from './pages/BasePage'
import { IndexPage } from './pages/IndexPage'
import { GlobalContextProvider } from './contexts/GlobalContext'
import { CssBaseline, CssVarsProvider } from '@mui/joy'
import { ColumnContextProvider } from './contexts/ColumnContext'

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
    <CssVarsProvider defaultMode='system'>
      {/* <GlobalContextProvider> */}
        <ColumnContextProvider>
          <RouterProvider router={router} />

        </ColumnContextProvider>
      {/* </GlobalContextProvider> */}
    </CssVarsProvider>
  </>
}