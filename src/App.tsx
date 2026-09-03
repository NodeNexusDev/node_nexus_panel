import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Spinner } from './components/ui/Spinner'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { AuthGuard } from './components/guards/AuthGuard'
import { MainLayout } from './layouts/MainLayout'
import { eventsClient } from './api/events'
import { DashboardSkeleton } from './pages/DashboardSkeleton'
import { NodesSkeleton } from './pages/NodesSkeleton'
import { NodeDetailSkeleton } from './pages/NodeDetailSkeleton'
import { CommandsSkeleton } from './pages/CommandsSkeleton'
import { CommandDetailSkeleton } from './pages/CommandDetailSkeleton'
import { ScriptsSkeleton } from './pages/ScriptsSkeleton'
import { ScriptDetailSkeleton } from './pages/ScriptDetailSkeleton'
import { DockerSkeleton } from './pages/DockerSkeleton'
import { AuditSkeleton } from './pages/AuditSkeleton'
import { SettingsSkeleton } from './pages/SettingsSkeleton'
import { FavoritesSkeleton } from './pages/FavoritesSkeleton'

const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Nodes = lazy(() => import('./pages/Nodes').then((m) => ({ default: m.Nodes })))
const NodeDetail = lazy(() => import('./pages/NodeDetail').then((m) => ({ default: m.NodeDetail })))
const Commands = lazy(() => import('./pages/Commands').then((m) => ({ default: m.Commands })))
const CommandDetail = lazy(() => import('./pages/CommandDetail').then((m) => ({ default: m.CommandDetail })))
const Scripts = lazy(() => import('./pages/Scripts').then((m) => ({ default: m.Scripts })))
const ScriptDetail = lazy(() => import('./pages/ScriptDetail').then((m) => ({ default: m.ScriptDetail })))
const Docker = lazy(() => import('./pages/Docker').then((m) => ({ default: m.Docker })))
const Audit = lazy(() => import('./pages/Audit').then((m) => ({ default: m.Audit })))
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))
const Favorites = lazy(() => import('./pages/Favorites').then((m) => ({ default: m.Favorites })))
const Templates = lazy(() => import('./pages/Templates').then((m) => ({ default: m.Templates })))

function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )
}

function App() {
  useEffect(() => {
    eventsClient.connect()
    return () => eventsClient.disconnect()
  }, [])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Suspense fallback={<Loading />}><Login /></Suspense>} />
          <Route element={<AuthGuard />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Suspense fallback={<DashboardSkeleton />}><Dashboard /></Suspense>} />
              <Route path="/nodes" element={<Suspense fallback={<NodesSkeleton />}><Nodes /></Suspense>} />
              <Route path="/nodes/:id" element={<Suspense fallback={<NodeDetailSkeleton />}><NodeDetail /></Suspense>} />
              <Route path="/commands" element={<Suspense fallback={<CommandsSkeleton />}><Commands /></Suspense>} />
              <Route path="/commands/:id" element={<Suspense fallback={<CommandDetailSkeleton />}><CommandDetail /></Suspense>} />
              <Route path="/scripts" element={<Suspense fallback={<ScriptsSkeleton />}><Scripts /></Suspense>} />
              <Route path="/scripts/:id" element={<Suspense fallback={<ScriptDetailSkeleton />}><ScriptDetail /></Suspense>} />
              <Route path="/docker" element={<Suspense fallback={<DockerSkeleton />}><Docker /></Suspense>} />
              <Route path="/audit" element={<Suspense fallback={<AuditSkeleton />}><Audit /></Suspense>} />
              <Route path="/settings" element={<Suspense fallback={<SettingsSkeleton />}><Settings /></Suspense>} />
              <Route path="/favorites" element={<Suspense fallback={<FavoritesSkeleton />}><Favorites /></Suspense>} />
              <Route path="/templates" element={<Suspense fallback={<Loading />}><Templates /></Suspense>} />
            </Route>
          </Route>
          <Route path="*" element={<Suspense fallback={<Loading />}><NotFound /></Suspense>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
