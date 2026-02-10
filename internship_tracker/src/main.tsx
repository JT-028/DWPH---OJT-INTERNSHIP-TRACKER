import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './components/ui/theme-provider'
import { AuthProvider } from './context/AuthContext'
import { AppRouter } from './AppRouter'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="internship-tracker-theme">
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
