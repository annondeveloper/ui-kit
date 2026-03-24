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
const DocsPage = lazy(() => import('./pages/DocsPage'))
const AnimationsPage = lazy(() => import('./pages/AnimationsPage'))
const IconsPage = lazy(() => import('./pages/IconsPage'))
const ThemePage = lazy(() => import('./pages/ThemePage'))
const ButtonPage = lazy(() => import('./pages/components/ButtonPage'))
const SelectPage = lazy(() => import('./pages/components/SelectPage'))
const DialogPage = lazy(() => import('./pages/components/DialogPage'))
const DataTablePage = lazy(() => import('./pages/components/DataTablePage'))
const MetricCardPage = lazy(() => import('./pages/components/MetricCardPage'))
const CardPage = lazy(() => import('./pages/components/CardPage'))
const BadgePage = lazy(() => import('./pages/components/BadgePage'))
const UpstreamDashboardPage = lazy(() => import('./pages/components/UpstreamDashboardPage'))
const TabsPage = lazy(() => import('./pages/components/TabsPage'))
const AccordionPage = lazy(() => import('./pages/components/AccordionPage'))
const AlertPage = lazy(() => import('./pages/components/AlertPage'))
const DrawerPage = lazy(() => import('./pages/components/DrawerPage'))
const TooltipPage = lazy(() => import('./pages/components/TooltipPage'))
const ProgressPage = lazy(() => import('./pages/components/ProgressPage'))
const CheckboxPage = lazy(() => import('./pages/components/CheckboxPage'))
const ToggleSwitchPage = lazy(() => import('./pages/components/ToggleSwitchPage'))

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
            <Route path="animations" element={<Suspense><AnimationsPage /></Suspense>} />
            <Route path="icons" element={<Suspense><IconsPage /></Suspense>} />
            <Route path="themes" element={<Suspense><ThemePage /></Suspense>} />
            <Route path="components/button" element={<Suspense><ButtonPage /></Suspense>} />
            <Route path="components/select" element={<Suspense><SelectPage /></Suspense>} />
            <Route path="components/dialog" element={<Suspense><DialogPage /></Suspense>} />
            <Route path="components/data-table" element={<Suspense><DataTablePage /></Suspense>} />
            <Route path="components/metric-card" element={<Suspense><MetricCardPage /></Suspense>} />
            <Route path="components/card" element={<Suspense><CardPage /></Suspense>} />
            <Route path="components/badge" element={<Suspense><BadgePage /></Suspense>} />
            <Route path="components/upstream-dashboard" element={<Suspense><UpstreamDashboardPage /></Suspense>} />
            <Route path="components/tabs" element={<Suspense><TabsPage /></Suspense>} />
            <Route path="components/accordion" element={<Suspense><AccordionPage /></Suspense>} />
            <Route path="components/alert" element={<Suspense><AlertPage /></Suspense>} />
            <Route path="components/drawer" element={<Suspense><DrawerPage /></Suspense>} />
            <Route path="components/tooltip" element={<Suspense><TooltipPage /></Suspense>} />
            <Route path="components/progress" element={<Suspense><ProgressPage /></Suspense>} />
            <Route path="components/checkbox" element={<Suspense><CheckboxPage /></Suspense>} />
            <Route path="components/toggle-switch" element={<Suspense><ToggleSwitchPage /></Suspense>} />
            <Route path="docs" element={<Suspense><DocsPage /></Suspense>} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
)
