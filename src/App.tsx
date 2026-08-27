import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Spinner } from './components/ui/Spinner'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { AuthGuard } from './components/guards/AuthGuard'
import { MainLayout } from './layouts/MainLayout'
import { eventsClient } from './api/events'

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
  }, [])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<AuthGuard />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/nodes" element={<Nodes />} />
                <Route path="/nodes/:id" element={<NodeDetail />} />
                <Route path="/commands" element={<Commands />} />
                <Route path="/commands/:id" element={<CommandDetail />} />
                <Route path="/scripts" element={<Scripts />} />
                <Route path="/scripts/:id" element={<ScriptDetail />} />
                <Route path="/docker" element={<Docker />} />
                <Route path="/audit" element={<Audit />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/favorites" element={<Favorites />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
