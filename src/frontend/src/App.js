import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthInterceptor from './components/AuthInterceptor';
import Home from './pages/client/Home';
import AppointmentPage from './pages/client/AppointmentPage';
import AdminLogin from './pages/admin/AdminLogin';
import ForgotPassword from './pages/admin/ForgotPassword';
import ForbiddenPage from './pages/errors/ForbiddenPage';
import ServerErrorPage from './pages/errors/ServerErrorPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import AdminLayout from './components/AdminLayout';
import SecretaryLayout from './components/SecretaryLayout';
import DoctorLayout from './components/DoctorLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/Dashboard';
import PatientsPage from './pages/admin/PatientsPage';
import DoctorsPage from './pages/admin/DoctorsPage';
import AppointmentsPage from './pages/admin/Appointments';
import PrescriptionsPage from './pages/admin/PrescriptionsPage';
import MedicinesPage from './pages/admin/MedecinesPage';
import BillingPage from './pages/admin/BillingPage';
import ActivityPage from './pages/admin/ActivityPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthInterceptor>
          <Routes>
            {/* Client Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/client" element={<Home />} />
            <Route path="/client/rendez-vous" element={<AppointmentPage />} />

            {/* Authentication Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />

            {/* Error Routes */}
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/500" element={<ServerErrorPage />} />

            {/* Admin Routes - Protected */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/patients"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <PatientsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/doctors"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <DoctorsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/appointments"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AppointmentsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/prescriptions"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <PrescriptionsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/medicines"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <MedicinesPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/billing"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <BillingPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/activity"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ActivityPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Secretary Routes - Protected */}
            <Route path="/secretary" element={<Navigate to="/secretary/dashboard" replace />} />

            <Route
              path="/secretary/dashboard"
              element={
                <ProtectedRoute>
                  <SecretaryLayout>
                    <AdminDashboard />
                  </SecretaryLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/secretary/patients"
              element={
                <ProtectedRoute>
                  <SecretaryLayout>
                    <PatientsPage />
                  </SecretaryLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/secretary/doctors"
              element={
                <ProtectedRoute>
                  <SecretaryLayout>
                    <DoctorsPage />
                  </SecretaryLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/secretary/appointments"
              element={
                <ProtectedRoute>
                  <SecretaryLayout>
                    <AppointmentsPage />
                  </SecretaryLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/secretary/prescriptions"
              element={
                <ProtectedRoute>
                  <SecretaryLayout>
                    <PrescriptionsPage />
                  </SecretaryLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/secretary/medicines"
              element={
                <ProtectedRoute>
                  <SecretaryLayout>
                    <MedicinesPage />
                  </SecretaryLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/secretary/billing"
              element={
                <ProtectedRoute>
                  <SecretaryLayout>
                    <BillingPage />
                  </SecretaryLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/secretary/activity"
              element={
                <ProtectedRoute>
                  <SecretaryLayout>
                    <ActivityPage />
                  </SecretaryLayout>
                </ProtectedRoute>
              }
            />

            {/* Doctor Routes - Protected */}
            <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />

            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute>
                  <DoctorLayout>
                    <AdminDashboard />
                  </DoctorLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/patients"
              element={
                <ProtectedRoute>
                  <DoctorLayout>
                    <PatientsPage />
                  </DoctorLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/doctors"
              element={
                <ProtectedRoute>
                  <DoctorLayout>
                    <DoctorsPage />
                  </DoctorLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/appointments"
              element={
                <ProtectedRoute>
                  <DoctorLayout>
                    <AppointmentsPage />
                  </DoctorLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/prescriptions"
              element={
                <ProtectedRoute>
                  <DoctorLayout>
                    <PrescriptionsPage />
                  </DoctorLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/medicines"
              element={
                <ProtectedRoute>
                  <DoctorLayout>
                    <MedicinesPage />
                  </DoctorLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/activity"
              element={
                <ProtectedRoute>
                  <DoctorLayout>
                    <ActivityPage />
                  </DoctorLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 - Route non trouvée */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthInterceptor>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
