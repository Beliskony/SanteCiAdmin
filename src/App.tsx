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
              
              {/* Page Forbidden */}
              <Route path="forbidden" element={<Forbidden />} />
            </Route>

            {/* Redirection pour toutes les autres URLs */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}