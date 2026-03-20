import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from '@ui/domain/toast'
import App from './App'
import './index.css'

const Home = lazy(() => import('./pages/Home'))
const CorePage = lazy(() => import('./pages/CorePage'))
const FormsPage = lazy(() => import('./pages/FormsPage'))
const OverlaysPage = lazy(() => import('./pages/OverlaysPage'))
const DataPage = lazy(() => import('./pages/DataPage'))
const MonitorPage = lazy(() => import('./pages/MonitorPage'))
const AIPage = lazy(() => import('./pages/AIPage'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/ui-kit">
      <ToastProvider position="bottom-right">
        <Routes>
          <Route element={<App />}>
            <Route index element={<Suspense><Home /></Suspense>} />
            <Route path="core" element={<Suspense><CorePage /></Suspense>} />
            <Route path="forms" element={<Suspense><FormsPage /></Suspense>} />
            <Route path="overlays" element={<Suspense><OverlaysPage /></Suspense>} />
            <Route path="data" element={<Suspense><DataPage /></Suspense>} />
            <Route path="monitor" element={<Suspense><MonitorPage /></Suspense>} />
            <Route path="ai" element={<Suspense><AIPage /></Suspense>} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
)
