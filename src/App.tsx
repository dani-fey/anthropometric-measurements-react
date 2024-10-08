import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { BasePage } from './pages/BasePage'
import { IndexPage } from './pages/IndexPage'
import { CssBaseline, CssVarsProvider } from '@mui/joy'
import { HeaderContextProvider } from './contexts/HeaderContext'

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
        <HeaderContextProvider>
          <RouterProvider router={router} />

        </HeaderContextProvider>
      {/* </GlobalContextProvider> */}
    </CssVarsProvider>
  </>
}