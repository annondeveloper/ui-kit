import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from '@ui/index'

// Code-split: each page loads only when navigated to
const Home = lazy(() => import('./pages/Home.tsx'))
const AIPage = lazy(() => import('./pages/AIPage.tsx'))
const MonitorPage = lazy(() => import('./pages/MonitorPage.tsx'))
const DataPage = lazy(() => import('./pages/DataPage.tsx'))
const InteractivePage = lazy(() => import('./pages/InteractivePage.tsx'))
const CorePage = lazy(() => import('./pages/CorePage.tsx'))
const FormsPage = lazy(() => import('./pages/FormsPage.tsx'))
const LayoutPage = lazy(() => import('./pages/LayoutPage.tsx'))
const OverlaysPage = lazy(() => import('./pages/OverlaysPage.tsx'))

function PageFallback() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-[hsl(var(--bg-elevated))]" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-52 rounded-xl bg-[hsl(var(--bg-elevated))]" />
        ))}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/ui-kit">
      <ToastProvider position="bottom-right">
        <Routes>
          <Route element={<App />}>
            <Route index element={<Suspense fallback={<PageFallback />}><Home /></Suspense>} />
            <Route path="ai" element={<Suspense fallback={<PageFallback />}><AIPage /></Suspense>} />
            <Route path="monitor" element={<Suspense fallback={<PageFallback />}><MonitorPage /></Suspense>} />
            <Route path="data" element={<Suspense fallback={<PageFallback />}><DataPage /></Suspense>} />
            <Route path="interactive" element={<Suspense fallback={<PageFallback />}><InteractivePage /></Suspense>} />
            <Route path="core" element={<Suspense fallback={<PageFallback />}><CorePage /></Suspense>} />
            <Route path="forms" element={<Suspense fallback={<PageFallback />}><FormsPage /></Suspense>} />
            <Route path="layout" element={<Suspense fallback={<PageFallback />}><LayoutPage /></Suspense>} />
            <Route path="overlays" element={<Suspense fallback={<PageFallback />}><OverlaysPage /></Suspense>} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
