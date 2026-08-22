// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layout/DashboardLayout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Forbidden from './pages/Forbidden';
import Admins from './pages/Admins';
import Reviews from './pages/Reviews';
import Patients from './pages/Patients';
import Hospitals from './pages/Hopitals';
import Doctors from './pages/Doctors';
import Payments from './pages/Payements';
import Subscriptions from './pages/Subscriptions';
import Settings from './pages/Setting';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Route Login (en dehors du dashboard) */}
            <Route path="/login" element={<Login />} />

            {/* Route Dashboard avec ses routes enfants */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* ✅ TOUTES les routes enfants doivent être ICI, entre les balises du parent */}

              {/* Page d'accueil du dashboard */}
              <Route index element={<Overview />} />

              {/* Admins (superadmin uniquement) */}
              <Route
                path="admins"
                element={
                  <ProtectedRoute superAdminOnly>
                    <Admins />
                  </ProtectedRoute>
                }
              />

              {/* Doctors */}
              <Route
                path="doctors"
                element={
                  <ProtectedRoute requiredPermission="moderate:doctors">
                    <Doctors />
                  </ProtectedRoute>
                }
              />

              {/* Hospitals */}
              <Route
                path="hospitals"
                element={
                  <ProtectedRoute requiredPermission="moderate:hospitals">
                    <Hospitals />
                  </ProtectedRoute>
                }
              />

              {/* Patients */}
              <Route
                path="patients"
                element={
                  <ProtectedRoute requiredPermission="moderate:patients">
                    <Patients />
                  </ProtectedRoute>
                }
              />

              {/* Reviews */}
              <Route
                path="reviews"
                element={
                  <ProtectedRoute requiredPermission="moderate:reviews">
                    <Reviews />
                  </ProtectedRoute>
                }
              />

              {/* Payments */}
              <Route
                path="payments"
                element={
                  <ProtectedRoute requiredPermission="manage:payments">
                    <Payments />
                  </ProtectedRoute>
                }
              />

              {/* Subscriptions */}
              <Route
                path="subscriptions"
                element={
                  <ProtectedRoute requiredPermission="manage:subscriptions">
                    <Subscriptions />
                  </ProtectedRoute>
                }
              />

              {/* Settings — accessible à tout admin connecté, pas de permission dédiée */}
              <Route path="settings" element={<Settings />} />

              {/* Page Forbidden */}
              <Route path="forbidden" element={<Forbidden />} />

              {/* Toute sous-route de /dashboard non reconnue retombe ici plutôt
                  que de sortir de la branche et d'atterrir sur le wildcard global */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Redirection pour toutes les autres URLs */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}