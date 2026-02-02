import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AdminLayout from './components/AdminLayout';
import Home from './pages/client/Home';
import AppointmentPage from './pages/client/AppointmentPage';
import AdminLogin from './pages/admin/AdminLogin';
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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/client" element={<Home />} />
          <Route path="/client/rendez-vous" element={<AppointmentPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/patients" element={<AdminLayout><PatientsPage /></AdminLayout>} />
          <Route path="/admin/doctors" element={<AdminLayout><DoctorsPage /></AdminLayout>} />
          <Route path="/admin/appointments" element={<AdminLayout><AppointmentsPage /></AdminLayout>} />
          <Route path="/admin/prescriptions" element={<AdminLayout><PrescriptionsPage /></AdminLayout>} />
          <Route path="/admin/medicines" element={<AdminLayout><MedicinesPage /></AdminLayout>} />
          <Route path="/admin/billing" element={<AdminLayout><BillingPage /></AdminLayout>} />
          <Route path="/admin/activity" element={<AdminLayout><ActivityPage /></AdminLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;