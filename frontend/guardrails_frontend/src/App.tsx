import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages (will be created)
import Landing from './pages/Landing'
import Login from './pages/Login'
import Overview from './pages/Overview'
import PoliciesList from './pages/Policies'
import PolicyDetail from './pages/Policies/Detail'
import PolicyBuilder from './pages/Policies/Builder'
import Checks from './pages/Checks'
import EnforcementMap from './pages/EnforcementMap'
import Heatmaps from './pages/Heatmaps'
import Violations from './pages/Violations'
import Compliance from './pages/Compliance'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/landing" element={<Landing />} />

        {/* Auth routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>

        {/* Main app routes - Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="policies" element={<PoliciesList />} />
          <Route path="policies/:id" element={<PolicyDetail />} />
          <Route path="policies/new" element={<PolicyBuilder />} />
          <Route path="checks" element={<Checks />} />
          <Route path="enforcement-map" element={<EnforcementMap />} />
          <Route path="heatmaps" element={<Heatmaps />} />
          <Route path="violations" element={<Violations />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
