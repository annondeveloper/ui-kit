import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { Home } from './pages/Home.tsx'
import { AIPage } from './pages/AIPage.tsx'
import { MonitorPage } from './pages/MonitorPage.tsx'
import { DataPage } from './pages/DataPage.tsx'
import { InteractivePage } from './pages/InteractivePage.tsx'
import { CorePage } from './pages/CorePage.tsx'
import { FormsPage } from './pages/FormsPage.tsx'
import { LayoutPage } from './pages/LayoutPage.tsx'
import { Toaster } from '@ui/index'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/ui-kit">
      <Routes>
        <Route element={<App />}>
          <Route index element={<Home />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="monitor" element={<MonitorPage />} />
          <Route path="data" element={<DataPage />} />
          <Route path="interactive" element={<InteractivePage />} />
          <Route path="core" element={<CorePage />} />
          <Route path="forms" element={<FormsPage />} />
          <Route path="layout" element={<LayoutPage />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  </StrictMode>,
)
