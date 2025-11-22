import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, Pill, Activity, TrendingUp, Clock, AlertCircle, Download, Search, UserCheck } from 'lucide-react';

// URLs des microservices
const API_URLS = {
  patient: 'http://localhost:5002/api',
  appointment: 'http://localhost:5003/api',
  prescription: 'http://localhost:5004/api',
  medicine: 'http://localhost:5005/api',
  doctor: 'http://localhost:5006/api'
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    malePatients: 0,
    femalePatients: 0,
    newThisMonth: 0,
    appointmentsToday: 0,
    appointmentsThisWeek: 0,
    totalPrescriptions: 0,
    activePrescriptions: 0,
    totalMedicines: 0,
    lowStockMedicines: 0,
    totalDoctors: 0,
    activeDoctors: 0
  });
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'patients') {
      fetchPatients();
    } else if (activeTab === 'appointments') {
      fetchAppointments();
    } else if (activeTab === 'prescriptions') {
      fetchPrescriptions();
    } else if (activeTab === 'medicines') {
      fetchMedicines();
    } else if (activeTab === 'doctors') {
      fetchDoctors();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [patientsStatsRes, appointmentsStatsRes, prescriptionsStatsRes, medicinesStatsRes, doctorsStatsRes, patientsListRes] = 
        await Promise.all([
          fetch(`${API_URLS.patient}/patients/stats`).catch(() => ({ ok: false })),
          fetch(`${API_URLS.appointment}/appointments/stats`).catch(() => ({ ok: false })),
          fetch(`${API_URLS.prescription}/prescriptions/stats`).catch(() => ({ ok: false })),
          fetch(`${API_URLS.medicine}/medicines/stats`).catch(() => ({ ok: false })),
          fetch(`${API_URLS.doctor}/doctors/stats`).catch(() => ({ ok: false })),
          fetch(`${API_URLS.patient}/patients?per_page=5`).catch(() => ({ ok: false }))
        ]);

      if (patientsStatsRes.ok) {
        const patientsStats = await patientsStatsRes.json();
        if (patientsStats.success) {
          setStats(prev => ({
            ...prev,
            totalPatients: patientsStats.stats.total,
            malePatients: patientsStats.stats.male,
            femalePatients: patientsStats.stats.female,
            newThisMonth: patientsStats.stats.new_this_month
          }));
        }
      }

      if (appointmentsStatsRes.ok) {
        const appointmentsStats = await appointmentsStatsRes.json();
        if (appointmentsStats.success) {
          setStats(prev => ({
            ...prev,
            appointmentsToday: appointmentsStats.stats.today || 0,
            appointmentsThisWeek: appointmentsStats.stats.this_week || 0
          }));
        }
      }

      if (prescriptionsStatsRes.ok) {
        const prescriptionsStats = await prescriptionsStatsRes.json();
        if (prescriptionsStats.success) {
          setStats(prev => ({
            ...prev,
            totalPrescriptions: prescriptionsStats.stats.total,
            activePrescriptions: prescriptionsStats.stats.active
          }));
        }
      }

      if (medicinesStatsRes.ok) {
        const medicinesStats = await medicinesStatsRes.json();
        if (medicinesStats.success) {
          setStats(prev => ({
            ...prev,
            totalMedicines: medicinesStats.stats.total_medicines,
            lowStockMedicines: medicinesStats.stats.low_stock
          }));
        }
      }

      if (doctorsStatsRes.ok) {
        const doctorsStats = await doctorsStatsRes.json();
        if (doctorsStats.success) {
          setStats(prev => ({
            ...prev,
            totalDoctors: doctorsStats.stats.total || 0,
            activeDoctors: doctorsStats.stats.active || 0
          }));
        }
      }

      if (patientsListRes.ok) {
        const patientsList = await patientsListRes.json();
        if (patientsList.success) {
          setPatients(patientsList.patients);
        }
      }

      await fetchRecentActivities();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URLS.patient}/patients?per_page=50`);
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URLS.appointment}/appointments?per_page=50`);
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URLS.prescription}/prescriptions?per_page=50`);
      const data = await res.json();
      if (data.success) {
        setPrescriptions(data.prescriptions);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URLS.medicine}/medicines?per_page=50`);
      const data = await res.json();
      if (data.success) {
        setMedicines(data.medicines);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URLS.doctor}/doctors?per_page=50`);
      const data = await res.json();
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    const activities = [];
    try {
      const patientsRes = await fetch(`${API_URLS.patient}/patients?per_page=1`);
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        if (patientsData.success && patientsData.patients.length > 0) {
          activities.push({
            icon: Users,
            text: `Nouveau patient: ${patientsData.patients[0].first_name} ${patientsData.patients[0].last_name}`,
            time: getTimeAgo(patientsData.patients[0].created_at),
            color: 'text-blue-600'
          });
        }
      }

      const appointmentsRes = await fetch(`${API_URLS.appointment}/appointments?per_page=1`);
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        if (appointmentsData.success && appointmentsData.appointments.length > 0) {
          const apt = appointmentsData.appointments[0];
          activities.push({
            icon: Calendar,
            text: `RDV confirmé avec ${apt.doctor_name}`,
            time: getTimeAgo(apt.created_at),
            color: 'text-green-600'
          });
        }
      }

      const prescriptionsRes = await fetch(`${API_URLS.prescription}/prescriptions?per_page=1`);
      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        if (prescriptionsData.success && prescriptionsData.prescriptions.length > 0) {
          const pres = prescriptionsData.prescriptions[0];
          activities.push({
            icon: FileText,
            text: `Ordonnance créée par ${pres.doctor_name}`,
            time: getTimeAgo(pres.created_at),
            color: 'text-purple-600'
          });
        }
      }

      const lowStockRes = await fetch(`${API_URLS.medicine}/medicines/low-stock`);
      if (lowStockRes.ok) {
        const lowStockData = await lowStockRes.json();
        if (lowStockData.success && lowStockData.count > 0) {
          activities.push({
            icon: AlertCircle,
            text: `${lowStockData.count} médicament(s) en stock faible`,
            time: 'Maintenant',
            color: 'text-red-600'
          });
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    setRecentActivities(activities.slice(0, 4));
  };

  const getTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'À l\'instant';
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      return `Il y a ${diffDays}j`;
    } catch {
      return 'Récemment';
    }
  };

  const downloadPrescriptionPDF = (prescription) => {
    const content = `ORDONNANCE MÉDICALE
===================

Date: ${new Date(prescription.prescription_date).toLocaleDateString('fr-FR')}
Valide jusqu'au: ${prescription.valid_until ? new Date(prescription.valid_until).toLocaleDateString('fr-FR') : 'N/A'}

Patient: ${prescription.patient?.name || 'N/A'}
Médecin: ${prescription.doctor_name}
Diagnostic: ${prescription.diagnosis}

MÉDICAMENTS PRESCRITS:
${prescription.medications?.map((med, i) => `
${i + 1}. ${med.medicine_name}
   - Dosage: ${med.dosage}
   - Fréquence: ${med.frequency}
   - Durée: ${med.duration}
   - Quantité: ${med.quantity}
   - Instructions: ${med.instructions || 'Aucune'}
`).join('\n') || 'Aucun médicament'}

Notes: ${prescription.notes || 'Aucune note'}

Signature: ${prescription.doctor_name}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordonnance_${prescription.id}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold mt-2" style={{ color }}>{value}</h3>
        </div>
        <div className="rounded-full p-4" style={{ backgroundColor: bgColor }}>
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const filteredPatients = patients.filter(p => 
    p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAppointments = appointments.filter(a =>
    a.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrescriptions = prescriptions.filter(p =>
    p.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMedicines = medicines.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDoctors = doctors.filter(d =>
    d.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPatientsPage = () => (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Patients</h2>
        <button
          onClick={() => exportToCSV(patients, 'patients')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Genre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groupe Sanguin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map(patient => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {patient.first_name[0]}{patient.last_name[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{patient.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{patient.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      patient.gender === 'Homme' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                    }`}>
                      {patient.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{patient.blood_group || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(patient.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAppointmentsPage = () => (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Rendez-vous</h2>
        <button
          onClick={() => exportToCSV(appointments, 'rendez-vous')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un rendez-vous..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médecin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Heure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map(apt => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {apt.patient?.name || `Patient #${apt.patient_id}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{apt.doctor_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(apt.appointment_date).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{apt.reason || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {apt.status === 'scheduled' ? 'Planifié' : apt.status === 'completed' ? 'Terminé' : apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPrescriptionsPage = () => (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Ordonnances</h2>
        <button
          onClick={() => exportToCSV(prescriptions, 'ordonnances')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une ordonnance..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrescriptions.map(pres => (
          <div key={pres.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Ordonnance #{pres.id}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(pres.prescription_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                pres.status === 'active' ? 'bg-green-100 text-green-800' :
                pres.status === 'expired' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {pres.status === 'active' ? 'Active' : pres.status === 'expired' ? 'Expirée' : pres.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Patient:</span>{' '}
                <span className="text-gray-600">{pres.patient?.name || `Patient #${pres.patient_id}`}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Médecin:</span>{' '}
                <span className="text-gray-600">{pres.doctor_name}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Diagnostic:</span>{' '}
                <span className="text-gray-600">{pres.diagnosis}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Médicaments:</span>{' '}
                <span className="text-gray-600">{pres.medications?.length || 0}</span>
              </p>
            </div>

            <button
              onClick={() => downloadPrescriptionPDF(pres)}
              className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMedicinesPage = () => (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Médicaments</h2>
        <button
          onClick={() => exportToCSV(medicines, 'medicaments')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un médicament..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médicament</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Forme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.map(med => (
                <tr key={med.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{med.name}</div>
                    <div className="text-sm text-gray-500">{med.manufacturer || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{med.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{med.dosage_form}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{med.stock_quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{med.unit_price}€</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      med.stock_status === 'in_stock' ? 'bg-green-100 text-green-800' :
                      med.stock_status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {med.stock_status === 'in_stock' ? 'En stock' :
                       med.stock_status === 'low_stock' ? 'Stock faible' : 'Rupture'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDoctorsPage = () => (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Médecins</h2>
        <button
          onClick={() => exportToCSV(doctors, 'medecins')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un médecin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médecin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spécialisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Licence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDoctors.map(doctor => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-medium">
                          {doctor.first_name[0]}{doctor.last_name[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {doctor.first_name} {doctor.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{doctor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {doctor.specialization}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{doctor.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{doctor.license_number || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      doctor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {doctor.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(doctor.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Tableau de Bord</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Patients totaux"
          value={stats.totalPatients}
          color="#4F46E5"
          bgColor="#EEF2FF"
        />
        <StatCard
          icon={UserCheck}
          title="Médecins actifs"
          value={stats.activeDoctors}
          color="#059669"
          bgColor="#D1FAE5"
        />
        <StatCard
          icon={Calendar}
          title="RDV aujourd'hui"
          value={stats.appointmentsToday}
          color="#7C3AED"
          bgColor="#F3E8FF"
        />
        <StatCard
          icon={Pill}
          title="Stock faible"
          value={stats.lowStockMedicines}
          color="#DC2626"
          bgColor="#FEE2E2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Activity}
          title="RDV cette semaine"
          value={stats.appointmentsThisWeek}
          color="#0891B2"
          bgColor="#CFFAFE"
        />
        <StatCard
          icon={FileText}
          title="Ordonnances actives"
          value={stats.activePrescriptions}
          color="#8B5CF6"
          bgColor="#EDE9FE"
        />
        <StatCard
          icon={Pill}
          title="Médicaments disponibles"
          value={stats.totalMedicines}
          color="#F59E0B"
          bgColor="#FEF3C7"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Dernières activités</h3>
          <ul className="space-y-4">
            {recentActivities.map((act, index) => (
              <li key={index} className="flex items-start">
                <div className={`p-2 rounded-full ${act.color} bg-opacity-20`}>
                  <act.icon className="w-6 h-6" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">{act.text}</p>
                  <p className="text-xs text-gray-400">{act.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Patients récents</h3>
          <ul className="space-y-4">
            {patients.map(p => (
              <li key={p.id} className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-medium">
                    {p.first_name[0]}{p.last_name[0]}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{p.first_name} {p.last_name}</p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* MENU */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 shadow hover:bg-indigo-50'
          }`}
        >
          <Activity className="w-5 h-5 mr-2" />
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab('patients')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'patients'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 shadow hover:bg-indigo-50'
          }`}
        >
          <Users className="w-5 h-5 mr-2" />
          Patients
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'doctors'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 shadow hover:bg-indigo-50'
          }`}
        >
          <UserCheck className="w-5 h-5 mr-2" />
          Médecins
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'appointments'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 shadow hover:bg-indigo-50'
          }`}
        >
          <Calendar className="w-5 h-5 mr-2" />
          Rendez-vous
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'prescriptions'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 shadow hover:bg-indigo-50'
          }`}
        >
          <FileText className="w-5 h-5 mr-2" />
          Ordonnances
        </button>

        <button
          onClick={() => setActiveTab('medicines')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'medicines'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 shadow hover:bg-indigo-50'
          }`}
        >
          <Pill className="w-5 h-5 mr-2" />
          Médicaments
        </button>
      </div>

      {/* CONTENU SELON LE TAB */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Chargement...</p>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'patients' && renderPatientsPage()}
          {activeTab === 'doctors' && renderDoctorsPage()}
          {activeTab === 'appointments' && renderAppointmentsPage()}
          {activeTab === 'prescriptions' && renderPrescriptionsPage()}
          {activeTab === 'medicines' && renderMedicinesPage()}
        </>
      )}
    </div>
  );
}
