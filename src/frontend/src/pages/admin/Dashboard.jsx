import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, Pill, Activity, TrendingUp, Clock, AlertCircle, Download, Search, UserCheck } from 'lucide-react';
import { History } from 'lucide-react';

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
  const [showAddPrescriptionModal, setShowAddPrescriptionModal] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
  patient_id: '',
  doctor_id: '',
  diagnosis: '',
  notes: '',
  valid_until: '',
  medications: []
  });
  const [newMedication, setNewMedication] = useState({
  medicine_id: '',
  medicine_name: '',
  dosage: '',
  frequency: '',
  duration: '',
  quantity: '',
  instructions: ''
  });
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
const [showEditPatientModal, setShowEditPatientModal] = useState(false);
const [showEditDoctorModal, setShowEditDoctorModal] = useState(false);
const [selectedPatient, setSelectedPatient] = useState(null);
const [selectedDoctor, setSelectedDoctor] = useState(null);

const [newPatient, setNewPatient] = useState({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: 'Homme',
  blood_group: '',
  address: ''
});

const [newDoctor, setNewDoctor] = useState({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  specialization: '',
  license_number: '',
  years_of_experience: 0,
  consultation_fee: 0
});
const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
const [selectedAppointment, setSelectedAppointment] = useState(null);

const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
const [showEditMedicineModal, setShowEditMedicineModal] = useState(false);
const [selectedMedicine, setSelectedMedicine] = useState(null);

const [newAppointment, setNewAppointment] = useState({
  patient_id: '',
  doctor_id: '',
  appointment_date: '',
  appointment_time: '',
  reason: '',
  notes: ''
});

const [newMedicine, setNewMedicine] = useState({
  name: '',
  category: '',
  manufacturer: '',
  dosage_form: '',
  strength: '',
  stock_quantity: 0,
  reorder_level: 10,
  unit_price: 0,
  expiry_date: '',
  description: ''
});
const [activityLogs, setActivityLogs] = useState([]);
const [activityFilters, setActivityFilters] = useState({
  actionType: '',
  user: '',
  startDate: '',
  endDate: ''
});
const [activityPage, setActivityPage] = useState(1);
const [activityPerPage] = useState(20);
const [totalActivityLogs, setTotalActivityLogs] = useState(0);
const [showDoctorProfileModal, setShowDoctorProfileModal] = useState(false);
const [selectedDoctorProfile, setSelectedDoctorProfile] = useState(null);
const [doctorAppointments, setDoctorAppointments] = useState([]);
const [doctorPatients, setDoctorPatients] = useState([]);
const [loadingProfile, setLoadingProfile] = useState(false);
  // Modifier le useEffect existant (ligne ~120)
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
  } else if (activeTab === 'activity') {
    fetchActivityLogs();
  }
}, [activeTab, activityPage, activityFilters]); // Ajouter les dépendances

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
  const fetchDoctorProfile = async (doctorId) => {
  try {
    setLoadingProfile(true);
    
    // Récupérer les infos du médecin
    const doctorRes = await fetch(`${API_URLS.doctor}/doctors/${doctorId}`);
    const doctorData = await doctorRes.json();
    
    if (doctorData.success) {
      setSelectedDoctorProfile(doctorData.doctor);
      
      // Récupérer tous les rendez-vous de ce médecin
      const appointmentsRes = await fetch(`${API_URLS.appointment}/appointments?doctor_id=${doctorId}&per_page=100`);
      const appointmentsData = await appointmentsRes.json();
      
      if (appointmentsData.success) {
        setDoctorAppointments(appointmentsData.appointments);
        
        // Extraire les patients uniques
        const uniquePatientIds = [...new Set(appointmentsData.appointments.map(apt => apt.patient_id))];
        
        // Récupérer les infos des patients
        const patientsPromises = uniquePatientIds.map(patientId => 
          fetch(`${API_URLS.patient}/patients/${patientId}`).then(res => res.json())
        );
        
        const patientsResults = await Promise.all(patientsPromises);
        const patientsData = patientsResults
          .filter(result => result.success)
          .map(result => result.patient);
        
        setDoctorPatients(patientsData);
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
    alert('Erreur lors du chargement du profil du médecin');
  } finally {
    setLoadingProfile(false);
  }
};

const openDoctorProfile = async (doctor) => {
  setShowDoctorProfileModal(true);
  await fetchDoctorProfile(doctor.id);
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
  // Ajouter après les fonctions fetch existantes (ligne ~350)
const logActivity = async (action, entity, entityId, details = '') => {
  try {
    const activityData = {
      action, // 'create', 'update', 'delete'
      entity, // 'patient', 'doctor', 'appointment', 'prescription', 'medicine'
      entity_id: entityId,
      user: 'Admin', // Remplacer par le vrai utilisateur connecté
      details,
      timestamp: new Date().toISOString()
    };

    // Enregistrer dans le localStorage (ou envoyer à une API dédiée)
    const existingLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    existingLogs.unshift(activityData);
    localStorage.setItem('activityLogs', JSON.stringify(existingLogs.slice(0, 1000))); // Garder max 1000 logs
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
  }
};

const fetchActivityLogs = () => {
  try {
    setLoading(true);
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    
    // Filtrer les logs
    let filtered = logs.filter(log => {
      if (activityFilters.actionType && log.action !== activityFilters.actionType) return false;
      if (activityFilters.user && !log.user.toLowerCase().includes(activityFilters.user.toLowerCase())) return false;
      if (activityFilters.startDate && new Date(log.timestamp) < new Date(activityFilters.startDate)) return false;
      if (activityFilters.endDate && new Date(log.timestamp) > new Date(activityFilters.endDate)) return false;
      return true;
    });

    setTotalActivityLogs(filtered.length);
    
    // Paginer
    const startIndex = (activityPage - 1) * activityPerPage;
    const paginatedLogs = filtered.slice(startIndex, startIndex + activityPerPage);
    
    setActivityLogs(paginatedLogs);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setLoading(false);
  }
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
  const handleAddPrescription = async () => {
  try {
    if (!newPrescription.patient_id || !newPrescription.doctor_id || !newPrescription.diagnosis) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (newPrescription.medications.length === 0) {
      alert('Veuillez ajouter au moins un médicament');
      return;
    }

    // Trouver le nom du médecin sélectionné
const selectedDoctor = doctors.find(d => d.id === parseInt(newPrescription.doctor_id));
const doctorName = selectedDoctor ? `${selectedDoctor.first_name} ${selectedDoctor.last_name}` : '';

const prescriptionData = {
  ...newPrescription,
  doctor_name: doctorName,
  prescription_date: new Date().toISOString(),
  status: 'active'
};

    const response = await fetch(`${API_URLS.prescription}/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prescriptionData)
    });

    const result = await response.json();

    if (result.success) {
      alert('Ordonnance créée avec succès!');
      setShowAddPrescriptionModal(false);
      setNewPrescription({
        patient_id: '',
        doctor_id: '',
        diagnosis: '',
        notes: '',
        valid_until: '',
        medications: []
      });
      fetchPrescriptions();
      if (activeTab === 'dashboard') fetchDashboardData();
    } else {
      alert('Erreur: ' + (result.error || 'Impossible de créer l\'ordonnance'));
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de la création de l\'ordonnance');
  }
};

const addMedicationToPrescription = () => {
  if (!newMedication.medicine_name || !newMedication.dosage || !newMedication.frequency) {
    alert('Veuillez remplir tous les champs du médicament');
    return;
  }

  setNewPrescription(prev => ({
    ...prev,
    medications: [...prev.medications, { ...newMedication }]
  }));

  setNewMedication({
    medicine_id: '',
    medicine_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: '',
    instructions: ''
  });
};

const removeMedicationFromPrescription = (index) => {
  setNewPrescription(prev => ({
    ...prev,
    medications: prev.medications.filter((_, i) => i !== index)
  }));
};
const openAddPrescriptionModal = async () => {
  setShowAddPrescriptionModal(true);
  // Charger les données si elles ne sont pas déjà chargées
  if (doctors.length === 0) await fetchDoctors();
  if (medicines.length === 0) await fetchMedicines();
  if (patients.length === 0) await fetchPatients();
};
// === GESTION PATIENTS ===
const handleAddPatient = async () => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!newPatient.first_name?.trim() || !newPatient.last_name?.trim()) {
      alert('❌ Le prénom et le nom sont obligatoires');
      return;
    }
    if (!emailRegex.test(newPatient.email)) {
      alert('❌ Format d\'email invalide');
      return;
    }
    if (!phoneRegex.test(newPatient.phone.replace(/\s/g, ''))) {
      alert('❌ Le téléphone doit contenir 10 chiffres');
      return;
    }
    if (!newPatient.date_of_birth) {
      alert('❌ La date de naissance est obligatoire');
      return;
    }

    const patientData = {
      ...newPatient,
      email: newPatient.email.toLowerCase().trim(),
      phone: newPatient.phone.replace(/\s/g, ''),
      first_name: newPatient.first_name.trim(),
      last_name: newPatient.last_name.trim()
    };

    const response = await fetch(`${API_URLS.patient}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });

    const result = await response.json();

    if (result.success) {
      await logActivity('create', 'patient', result.patient.id, `Patient ${newPatient.first_name} ${newPatient.last_name} ajouté`);
      alert('✅ Patient ajouté avec succès !');
      setShowAddPatientModal(false);
      setNewPatient({
        first_name: '', last_name: '', email: '', phone: '',
        date_of_birth: '', gender: 'Homme', blood_group: '', address: ''
      });
      fetchPatients();
      if (activeTab === 'dashboard') fetchDashboardData();
    } else {
      alert('❌ ' + (result.error || 'Erreur lors de l\'ajout du patient'));
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur de connexion au serveur');
  }
};

const handleEditPatient = async () => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!selectedPatient.first_name?.trim() || !selectedPatient.last_name?.trim()) {
      alert('❌ Le prénom et le nom sont obligatoires');
      return;
    }
    if (!emailRegex.test(selectedPatient.email)) {
      alert('❌ Format d\'email invalide');
      return;
    }
    if (!phoneRegex.test(selectedPatient.phone.replace(/\s/g, ''))) {
      alert('❌ Le téléphone doit contenir 10 chiffres');
      return;
    }

    const patientData = {
      ...selectedPatient,
      email: selectedPatient.email.toLowerCase().trim(),
      phone: selectedPatient.phone.replace(/\s/g, ''),
      first_name: selectedPatient.first_name.trim(),
      last_name: selectedPatient.last_name.trim()
    };

    const response = await fetch(`${API_URLS.patient}/patients/${selectedPatient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });

    const result = await response.json();

    if (result.success) {
      await logActivity('update', 'patient', selectedPatient.id, `Patient ${selectedPatient.first_name} ${selectedPatient.last_name} modifié`);
      alert('✅ Patient modifié avec succès !');
      setShowEditPatientModal(false);
      setSelectedPatient(null);
      fetchPatients();
      if (activeTab === 'dashboard') fetchDashboardData();
    } else {
      alert('❌ ' + (result.error || 'Erreur lors de la modification'));
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur de connexion au serveur');
  }
};

const handleDeletePatient = async (patient) => {
  if (!window.confirm(`⚠️ Êtes-vous sûr de vouloir supprimer le patient ${patient.first_name} ${patient.last_name} ?\n\nCette action est irréversible.`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URLS.patient}/patients/${patient.id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
       await logActivity('delete', 'patient', patient.id, `Patient ${patient.first_name} ${patient.last_name} supprimé`);
      alert('✅ Patient supprimé avec succès !');
      fetchPatients();
      if (activeTab === 'dashboard') fetchDashboardData();
    } else {
      alert('❌ ' + (result.error || 'Erreur lors de la suppression'));
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur de connexion au serveur');
  }
};

// === GESTION MÉDECINS ===
const handleAddDoctor = async () => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!newDoctor.first_name?.trim() || !newDoctor.last_name?.trim()) {
      alert('❌ Le prénom et le nom sont obligatoires');
      return;
    }
    if (!emailRegex.test(newDoctor.email)) {
      alert('❌ Format d\'email invalide');
      return;
    }
    if (!phoneRegex.test(newDoctor.phone.replace(/\s/g, ''))) {
      alert('❌ Le téléphone doit contenir 10 chiffres');
      return;
    }
    if (!newDoctor.specialization?.trim()) {
      alert('❌ La spécialisation est obligatoire');
      return;
    }

    const doctorData = {
      ...newDoctor,
      email: newDoctor.email.toLowerCase().trim(),
      phone: newDoctor.phone.replace(/\s/g, ''),
      first_name: newDoctor.first_name.trim(),
      last_name: newDoctor.last_name.trim(),
      specialization: newDoctor.specialization.trim(),
      years_of_experience: parseInt(newDoctor.years_of_experience) || 0,
      consultation_fee: parseFloat(newDoctor.consultation_fee) || 0
    };

    const response = await fetch(`${API_URLS.doctor}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorData)
    });

    const result = await response.json();

    if (result.success) {
       await logActivity('create', 'doctor', result.doctor?.id || 'N/A', 
        `Médecin Dr. ${newDoctor.first_name} ${newDoctor.last_name} (${newDoctor.specialization}) ajouté`);
      alert('✅ Médecin ajouté avec succès !');
      setShowAddDoctorModal(false);
      setNewDoctor({
        first_name: '', last_name: '', email: '', phone: '',
        specialization: '', license_number: '', years_of_experience: 0, consultation_fee: 0
      });
      fetchDoctors();
      if (activeTab === 'dashboard') fetchDashboardData();
    } else {
      alert('❌ ' + (result.error || 'Erreur lors de l\'ajout du médecin'));
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur de connexion au serveur');
  }
};

const handleEditDoctor = async () => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!selectedDoctor.first_name?.trim() || !selectedDoctor.last_name?.trim()) {
      alert('❌ Le prénom et le nom sont obligatoires');
      return;
    }
    if (!emailRegex.test(selectedDoctor.email)) {
      alert('❌ Format d\'email invalide');
      return;
    }
    if (!phoneRegex.test(selectedDoctor.phone.replace(/\s/g, ''))) {
      alert('❌ Le téléphone doit contenir 10 chiffres');
      return;
    }
    if (!selectedDoctor.specialization?.trim()) {
      alert('❌ La spécialisation est obligatoire');
      return;
    }

    const doctorData = {
      ...selectedDoctor,
      email: selectedDoctor.email.toLowerCase().trim(),
      phone: selectedDoctor.phone.replace(/\s/g, ''),
      first_name: selectedDoctor.first_name.trim(),
      last_name: selectedDoctor.last_name.trim(),
      specialization: selectedDoctor.specialization.trim(),
      years_of_experience: parseInt(selectedDoctor.years_of_experience) || 0,
      consultation_fee: parseFloat(selectedDoctor.consultation_fee) || 0
    };

    const response = await fetch(`${API_URLS.doctor}/doctors/${selectedDoctor.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorData)
    });

    const result = await response.json();

    if (result.success) {
      await logActivity('update', 'doctor', selectedDoctor.id, 
        `Médecin Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name} modifié`);
      alert('✅ Médecin modifié avec succès !');
      setShowEditDoctorModal(false);
      setSelectedDoctor(null);
      fetchDoctors();
      if (activeTab === 'dashboard') fetchDashboardData();
    } else {
      alert('❌ ' + (result.error || 'Erreur lors de la modification'));
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur de connexion au serveur');
  }
};

const handleDeleteDoctor = async (doctor) => {
  if (!window.confirm(`⚠️ Êtes-vous sûr de vouloir supprimer le médecin Dr. ${doctor.first_name} ${doctor.last_name} ?\n\nCette action est irréversible.`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URLS.doctor}/doctors/${doctor.id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      await logActivity('delete', 'doctor', doctor.id, 
        `Médecin Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialization}) supprimé`);
      alert('✅ Médecin supprimé avec succès !');
      fetchDoctors();
      if (activeTab === 'dashboard') fetchDashboardData();
    } else {
      alert('❌ ' + (result.error || 'Erreur lors de la suppression'));
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur de connexion au serveur');
  }
};
// === GESTION RENDEZ-VOUS ===
const handleAddAppointment = async () => {
  try {
    if (!newAppointment.patient_id || !newAppointment.doctor_id || !newAppointment.appointment_date) {
      alert('❌ Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Combiner date et heure
    const appointmentDateTime = `${newAppointment.appointment_date}T${newAppointment.appointment_time || '09:00'}:00`;

    const selectedDoctor = doctors.find(d => d.id === parseInt(newAppointment.doctor_id));
    const doctorName = selectedDoctor ? `${selectedDoctor.first_name} ${selectedDoctor.last_name}` : '';

    const appointmentData = {
      patient_id: parseInt(newAppointment.patient_id),
      doctor_id: parseInt(newAppointment.doctor_id),
      doctor_name: doctorName,
      appointment_date: appointmentDateTime,
      reason: newAppointment.reason.trim(),
      notes: newAppointment.notes.trim(),
      status: 'scheduled'
    };

    const response = await fetch(`${API_URLS.appointment}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });

    const result = await response.json();

    if (result.success) {
      await logActivity('create', 'appointment', result.appointment?.id || 'N/A', 
        `Rendez-vous créé: ${patientName} avec Dr. ${doctorName} le ${new Date(appointmentDateTime).toLocaleDateString('fr-FR')}`);
      alert('✅ Rendez-vous créé avec succès !');
      setShowAddAppointmentModal(false);
      setNewAppointment({
        patient_id: '', doctor_id: '', appointment_date: '',
        appointment_time: '', reason: '', notes: ''
      });
      fetchAppointments();
      if (activeTab === 'dashboard') fetchDashboardData();
    } else {
      alert('❌ ' + (result.error || 'Erreur lors de la création du rendez-vous'));
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur de connexion au serveur');
  }
};

const handleEditAppointment = async () => {
  try {
    if (!selectedAppointment.patient_id || !selectedAppointment.doctor_id || !selectedAppointment.appointment_date) {
      alert('❌ Veuillez remplir tous les champs obligatoires');
      return;
    }

    const appointmentData = {
      patient_id: parseInt(selectedAppointment.patient_id),
      doctor_id: parseInt(selectedAppointment.doctor_id),
      appointment_date: selectedAppointment.appointment_date,
      reason: selectedAppointment.reason?.trim() || '',
      notes: selectedAppointment.notes?.trim() || '',
      status: selectedAppointment.status || 'scheduled'
    };

    const response = await fetch(`${API_URLS.appointment}/appointments/${selectedAppointment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });

    const result = await response.json();

    if (result.success) {
      await logActivity('update', 'appointment', selectedAppointment.id, 
        `Rendez-vous #${selectedAppointment.id} modifié (Statut: ${selectedAppointment.status})`);
      
      alert('✅ Rendez-vous modifié avec succès !');
      setShowEditAppointmentModal(false);
      setSelectedAppointment(null);
      fetchAppointments();
      if (activeTab === 'dashboard') fetchDashboardData();
    } else {
      alert('❌ ' + (result.error || 'Erreur lors de la modification'));
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur de connexion au serveur');
  }
};

const handleDeleteAppointment = async (appointment) => {
  if (!window.confirm(`⚠️ Êtes-vous sûr de vouloir supprimer ce rendez-vous ?\n\nCette action est irréversible.`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URLS.appointment}/appointments/${appointment.id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
       await logActivity('delete', 'appointment', appointment.id, 
        `Rendez-vous du ${new Date(appointment.appointment_date).toLocaleDateString('fr-FR')} avec ${appointment.doctor_name} supprimé`);
      alert('✅ Rendez-vous supprimé avec succès !');
      fetchAppointments();
      if (activeTab === 'dashboard') fetchDashboardData();
    } else {
      alert('❌ ' + (result.error || 'Erreur lors de la suppression'));
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur de connexion au serveur');
  }
};

const openAddAppointmentModal = async () => {
  setShowAddAppointmentModal(true);
  if (doctors.length === 0) await fetchDoctors();
  if (patients.length === 0) await fetchPatients();
};

// === GESTION MÉDICAMENTS ===
const handleAddMedicine = async () => {
  try {
    if (!newMedicine.name?.trim() || !newMedicine.category?.trim()) {
      alert('❌ Le nom et la catégorie sont obligatoires');
      return;
    }

    const medicineData = {
      ...newMedicine,
      name: newMedicine.name.trim(),
      category: newMedicine.category.trim(),
      manufacturer: newMedicine.manufacturer?.trim() || '',
      dosage_form: newMedicine.dosage_form?.trim() || '',
      strength: newMedicine.strength?.trim() || '',
      stock_quantity: parseInt(newMedicine.stock_quantity) || 0,
      reorder_level: parseInt(newMedicine.reorder_level) || 10,
      unit_price: parseFloat(newMedicine.unit_price) || 0,
      expiry_date: newMedicine.expiry_date || null,
      description: newMedicine.description?.trim() || ''
    };

    const response = await fetch(`${API_URLS.medicine}/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicineData)
    });

    const result = await response.json();

    if (result.success) {
      await logActivity('create', 'medicine', result.medicine?.id || 'N/A', 
        `Médicament "${newMedicine.name}" (${newMedicine.category}) ajouté - Stock: ${newMedicine.stock_quantity}`);

      alert('✅ Médicament ajouté avec succès !');
      setShowAddMedicineModal(false);
      setNewMedicine({
        name: '', category: '', manufacturer: '', dosage_form: '',
        strength: '', stock_quantity: 0, reorder_level: 10,
        unit_price: 0, expiry_date: '', description: ''
      });
      fetchMedicines();
      if (activeTab === 'dashboard') fetchDashboardData();
    } else {
      alert('❌ ' + (result.error || 'Erreur lors de l\'ajout du médicament'));
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur de connexion au serveur');
  }
};

const handleEditMedicine = async () => {
  try {
    if (!selectedMedicine.name?.trim() || !selectedMedicine.category?.trim()) {
      alert('❌ Le nom et la catégorie sont obligatoires');
      return;
    }

    const medicineData = {
      ...selectedMedicine,
      name: selectedMedicine.name.trim(),
      category: selectedMedicine.category.trim(),
      stock_quantity: parseInt(selectedMedicine.stock_quantity) || 0,
      reorder_level: parseInt(selectedMedicine.reorder_level) || 10,
      unit_price: parseFloat(selectedMedicine.unit_price) || 0
    };

    const response = await fetch(`${API_URLS.medicine}/medicines/${selectedMedicine.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicineData)
    });

    const result = await response.json();

    if (result.success) {
      await logActivity('update', 'medicine', selectedMedicine.id, 
        `Médicament "${selectedMedicine.name}" modifié - Stock: ${selectedMedicine.stock_quantity}`);
      alert('✅ Médicament modifié avec succès !');
      setShowEditMedicineModal(false);
      setSelectedMedicine(null);
      fetchMedicines();
      if (activeTab === 'dashboard') fetchDashboardData();
    } else {
      alert('❌ ' + (result.error || 'Erreur lors de la modification'));
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur de connexion au serveur');
  }
};

const handleDeleteMedicine = async (medicine) => {
  if (!window.confirm(`⚠️ Êtes-vous sûr de vouloir supprimer le médicament "${medicine.name}" ?\n\nCette action est irréversible.`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URLS.medicine}/medicines/${medicine.id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      await logActivity('delete', 'medicine', medicine.id, 
        `Médicament "${medicine.name}" (${medicine.category}) supprimé`);
      alert('✅ Médicament supprimé avec succès !');
      fetchMedicines();
      if (activeTab === 'dashboard') fetchDashboardData();
    } else {
      alert('❌ ' + (result.error || 'Erreur lors de la suppression'));
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur de connexion au serveur');
  }
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
  <div className="flex gap-2">
    <button
      onClick={() => setShowAddPatientModal(true)}
      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
    >
      <Users className="w-4 h-4 mr-2" />
      Ajouter Patient
    </button>
    <button
      onClick={() => exportToCSV(patients, 'patients')}
      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      <Download className="w-4 h-4 mr-2" />
      Exporter CSV
    </button>
  </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                  <td className="px-6 py-4 text-sm">
  <div className="flex gap-2">
    <button
      onClick={() => {
        setSelectedPatient(patient);
        setShowEditPatientModal(true);
      }}
      className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
    >
      Modifier
    </button>
    <button
      onClick={() => handleDeletePatient(patient)}
      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
    >
      Supprimer
    </button>
  </div>
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
      <div className="flex gap-2">
        <button
          onClick={openAddAppointmentModal}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Ajouter Rendez-vous
        </button>
        <button
          onClick={() => exportToCSV(appointments, 'rendez-vous')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </button>
      </div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setShowEditAppointmentModal(true);
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(apt)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                    >
                      Supprimer
                    </button>
                  </div>
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
    onClick={openAddPrescriptionModal}
    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
  >
    <FileText className="w-4 h-4 mr-2" />
    Ajouter Ordonnance
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
      <div className="flex gap-2">
        <button
          onClick={() => setShowAddMedicineModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Pill className="w-4 h-4 mr-2" />
          Ajouter Médicament
        </button>
        <button
          onClick={() => exportToCSV(medicines, 'medicaments')}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </button>
      </div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMedicine(med);
                        setShowEditMedicineModal(true);
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteMedicine(med)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                    >
                      Supprimer
                    </button>
                  </div>
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
  <div className="flex gap-2">
    <button
      onClick={() => setShowAddDoctorModal(true)}
      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
    >
      <UserCheck className="w-4 h-4 mr-2" />
      Ajouter Médecin
    </button>
    <button
      onClick={() => exportToCSV(doctors, 'medecins')}
      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      <Download className="w-4 h-4 mr-2" />
      Exporter CSV
    </button>
  </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                  <td className="px-6 py-4 text-sm">
  <div className="flex gap-2">
    <button
      onClick={() => openDoctorProfile(doctor)}
      className="px-3 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition"
    >
      Voir profil
    </button>
    <button
      onClick={() => {
        setSelectedDoctor(doctor);
        setShowEditDoctorModal(true);
      }}
      className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
    >
      Modifier
    </button>
    <button
      onClick={() => handleDeleteDoctor(doctor)}
      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
    >
      Supprimer
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
 // Ajouter après renderDoctorsPage (ligne ~1150)
const renderActivityPage = () => {
  const totalPages = Math.ceil(totalActivityLogs / activityPerPage);
  
  const getActionBadge = (action) => {
    const badges = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800'
    };
    const labels = {
      create: 'Création',
      update: 'Modification',
      delete: 'Suppression'
    };
    return { class: badges[action] || 'bg-gray-100 text-gray-800', label: labels[action] || action };
  };

  const getEntityLabel = (entity) => {
    const labels = {
      patient: 'Patient',
      doctor: 'Médecin',
      appointment: 'Rendez-vous',
      prescription: 'Ordonnance',
      medicine: 'Médicament'
    };
    return labels[entity] || entity;
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Historique des Activités</h2>
        <button
          onClick={() => {
            setActivityFilters({ actionType: '', user: '', startDate: '', endDate: '' });
            setActivityPage(1);
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Réinitialiser filtres
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type d'action</label>
            <select
              value={activityFilters.actionType}
              onChange={(e) => {
                setActivityFilters({...activityFilters, actionType: e.target.value});
                setActivityPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous</option>
              <option value="create">Création</option>
              <option value="update">Modification</option>
              <option value="delete">Suppression</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Utilisateur</label>
            <input
              type="text"
              value={activityFilters.user}
              onChange={(e) => {
                setActivityFilters({...activityFilters, user: e.target.value});
                setActivityPage(1);
              }}
              placeholder="Rechercher un utilisateur"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
            <input
              type="date"
              value={activityFilters.startDate}
              onChange={(e) => {
                setActivityFilters({...activityFilters, startDate: e.target.value});
                setActivityPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
            <input
              type="date"
              value={activityFilters.endDate}
              onChange={(e) => {
                setActivityFilters({...activityFilters, endDate: e.target.value});
                setActivityPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Heure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Détails</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activityLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Aucune activité enregistrée
                  </td>
                </tr>
              ) : (
                activityLogs.map((log, index) => {
                  const actionBadge = getActionBadge(log.action);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.user}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${actionBadge.class}`}>
                          {actionBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {getEntityLabel(log.entity)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Affichage {((activityPage - 1) * activityPerPage) + 1} à {Math.min(activityPage * activityPerPage, totalActivityLogs)} sur {totalActivityLogs} activités
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                disabled={activityPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                {activityPage} / {totalPages}
              </span>
              <button
                onClick={() => setActivityPage(p => Math.min(totalPages, p + 1))}
                disabled={activityPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
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
        <button
  onClick={() => setActiveTab('activity')}
  className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
    activeTab === 'activity'
      ? 'bg-indigo-600 text-white shadow-md'
      : 'bg-white text-gray-700 shadow hover:bg-indigo-50'
  }`}
>
  <History className="w-5 h-5 mr-2" />
  Historique
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
          {activeTab === 'activity' && renderActivityPage()}
        </>
      )}
      {/* Modal Ajouter Ordonnance */}
{showAddPrescriptionModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Créer une Ordonnance</h2>
          <button
            onClick={() => setShowAddPrescriptionModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Sélection Patient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient *
            </label>
            <select
              value={newPrescription.patient_id}
              onChange={(e) => setNewPrescription({...newPrescription, patient_id: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Sélectionner un patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} - {p.email}
                </option>
              ))}
            </select>
          </div>

          {/* Sélection Médecin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Médecin *
            </label>
            <select
              value={newPrescription.doctor_id}
              onChange={(e) => setNewPrescription({...newPrescription, doctor_id: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Sélectionner un médecin</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  Dr. {d.first_name} {d.last_name} - {d.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Diagnostic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnostic *
            </label>
            <textarea
              value={newPrescription.diagnosis}
              onChange={(e) => setNewPrescription({...newPrescription, diagnosis: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows="3"
              required
            />
          </div>

          {/* Date de validité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valide jusqu'au
            </label>
            <input
              type="date"
              value={newPrescription.valid_until}
              onChange={(e) => setNewPrescription({...newPrescription, valid_until: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={newPrescription.notes}
              onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows="2"
            />
          </div>

          {/* Ajouter Médicaments */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Médicaments</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Médicament *
                </label>
                <select
                  value={newMedication.medicine_id}
                  onChange={(e) => {
                    const med = medicines.find(m => m.id === parseInt(e.target.value));
                    setNewMedication({
                      ...newMedication,
                      medicine_id: e.target.value,
                      medicine_name: med ? med.name : ''
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Sélectionner un médicament</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} - {m.dosage_form}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage *
                </label>
                <input
                  type="text"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  placeholder="ex: 500mg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence *
                </label>
                <input
                  type="text"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                  placeholder="ex: 3 fois par jour"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée
                </label>
                <input
                  type="text"
                  value={newMedication.duration}
                  onChange={(e) => setNewMedication({...newMedication, duration: e.target.value})}
                  placeholder="ex: 7 jours"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <input
                  type="number"
                  value={newMedication.quantity}
                  onChange={(e) => setNewMedication({...newMedication, quantity: e.target.value})}
                  placeholder="ex: 21"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <input
                  type="text"
                  value={newMedication.instructions}
                  onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                  placeholder="ex: Prendre après les repas"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={addMedicationToPrescription}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Ajouter ce médicament
            </button>

            {/* Liste des médicaments ajoutés */}
            {newPrescription.medications.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Médicaments ajoutés:</h4>
                <ul className="space-y-2">
                  {newPrescription.medications.map((med, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div>
                        <p className="font-medium">{med.medicine_name}</p>
                        <p className="text-sm text-gray-600">
                          {med.dosage} - {med.frequency} - {med.duration}
                        </p>
                      </div>
                      <button
                        onClick={() => removeMedicationFromPrescription(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              onClick={() => setShowAddPrescriptionModal(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleAddPrescription}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Créer l'ordonnance
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
{/* Modal Ajouter Patient */}
{showAddPatientModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Ajouter un Patient</h2>
          <button onClick={() => setShowAddPatientModal(false)} className="text-gray-500 hover:text-gray-700">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
              <input type="text" value={newPatient.first_name} onChange={(e) => setNewPatient({...newPatient, first_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input type="text" value={newPatient.last_name} onChange={(e) => setNewPatient({...newPatient, last_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input type="email" value={newPatient.email} onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                placeholder="exemple@gmail.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
              <input type="tel" value={newPatient.phone} onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                placeholder="0555123456" maxLength="10" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance *</label>
              <input type="date" value={newPatient.date_of_birth} onChange={(e) => setNewPatient({...newPatient, date_of_birth: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Genre *</label>
              <select value={newPatient.gender} onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Groupe sanguin</label>
            <input type="text" value={newPatient.blood_group} onChange={(e) => setNewPatient({...newPatient, blood_group: e.target.value})}
              placeholder="A+, O-, etc." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
            <textarea value={newPatient.address} onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" rows="2" />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button onClick={() => setShowAddPatientModal(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Annuler
            </button>
            <button onClick={handleAddPatient}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal Modifier Patient */}
{showEditPatientModal && selectedPatient && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Modifier le Patient</h2>
          <button onClick={() => {setShowEditPatientModal(false); setSelectedPatient(null);}} className="text-gray-500 hover:text-gray-700">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
              <input type="text" value={selectedPatient.first_name} onChange={(e) => setSelectedPatient({...selectedPatient, first_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input type="text" value={selectedPatient.last_name} onChange={(e) => setSelectedPatient({...selectedPatient, last_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input type="email" value={selectedPatient.email} onChange={(e) => setSelectedPatient({...selectedPatient, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
              <input type="tel" value={selectedPatient.phone} onChange={(e) => setSelectedPatient({...selectedPatient, phone: e.target.value})}
                maxLength="10" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance *</label>
              <input type="date" value={selectedPatient.date_of_birth?.split('T')[0]} onChange={(e) => setSelectedPatient({...selectedPatient, date_of_birth: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Genre *</label>
              <select value={selectedPatient.gender} onChange={(e) => setSelectedPatient({...selectedPatient, gender: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Groupe sanguin</label>
            <input type="text" value={selectedPatient.blood_group || ''} onChange={(e) => setSelectedPatient({...selectedPatient, blood_group: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
            <textarea value={selectedPatient.address || ''} onChange={(e) => setSelectedPatient({...selectedPatient, address: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" rows="2" />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button onClick={() => {setShowEditPatientModal(false); setSelectedPatient(null);}}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Annuler
            </button>
            <button onClick={handleEditPatient}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal Ajouter Médecin */}
{showAddDoctorModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Ajouter un Médecin</h2>
          <button onClick={() => setShowAddDoctorModal(false)} className="text-gray-500 hover:text-gray-700">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
              <input type="text" value={newDoctor.first_name} onChange={(e) => setNewDoctor({...newDoctor, first_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input type="text" value={newDoctor.last_name} onChange={(e) => setNewDoctor({...newDoctor, last_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input type="email" value={newDoctor.email} onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                placeholder="exemple@gmail.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
              <input type="tel" value={newDoctor.phone} onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                placeholder="0555123456" maxLength="10" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Spécialisation *</label>
            <input type="text" value={newDoctor.specialization} 
            onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
placeholder="Cardiologue, Pédiatre, etc." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
</div>
<div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de licence</label>
          <input type="text" value={newDoctor.license_number} onChange={(e) => setNewDoctor({...newDoctor, license_number: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Années d'expérience</label>
          <input type="number" value={newDoctor.years_of_experience} onChange={(e) => setNewDoctor({...newDoctor, years_of_experience: e.target.value})}
            min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Frais de consultation (€)</label>
        <input type="number" value={newDoctor.consultation_fee} onChange={(e) => setNewDoctor({...newDoctor, consultation_fee: e.target.value})}
          min="0" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button onClick={() => setShowAddDoctorModal(false)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
          Annuler
        </button>
        <button onClick={handleAddDoctor}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Ajouter
        </button>
      </div>
    </div>
  </div>
</div>
</div>
)}
{/* Modal Modifier Médecin */}
{showEditDoctorModal && selectedDoctor && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Modifier le Médecin</h2>
          <button onClick={() => {setShowEditDoctorModal(false); setSelectedDoctor(null);}} className="text-gray-500 hover:text-gray-700">
            <span className="text-2xl">×</span>
          </button>
        </div>
        <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
          <input type="text" value={selectedDoctor.first_name} onChange={(e) => setSelectedDoctor({...selectedDoctor, first_name: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
          <input type="text" value={selectedDoctor.last_name} onChange={(e) => setSelectedDoctor({...selectedDoctor, last_name: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input type="email" value={selectedDoctor.email} onChange={(e) => setSelectedDoctor({...selectedDoctor, email: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
          <input type="tel" value={selectedDoctor.phone} onChange={(e) => setSelectedDoctor({...selectedDoctor, phone: e.target.value})}
            maxLength="10" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Spécialisation *</label>
        <input type="text" value={selectedDoctor.specialization} onChange={(e) => setSelectedDoctor({...selectedDoctor, specialization: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de licence</label>
          <input type="text" value={selectedDoctor.license_number || ''} onChange={(e) => setSelectedDoctor({...selectedDoctor, license_number: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Années d'expérience</label>
          <input type="number" value={selectedDoctor.years_of_experience} onChange={(e) => setSelectedDoctor({...selectedDoctor, years_of_experience: e.target.value})}
            min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Frais de consultation (€)</label>
        <input type="number" value={selectedDoctor.consultation_fee} onChange={(e) => setSelectedDoctor({...selectedDoctor, consultation_fee: e.target.value})}
          min="0" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button onClick={() => {setShowEditDoctorModal(false); setSelectedDoctor(null);}}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
          Annuler
        </button>
        <button onClick={handleEditDoctor}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Modifier
        </button>
      </div>
    </div>
  </div>
</div>
</div>
)}
{/* Modal Ajouter Rendez-vous */}
{showAddAppointmentModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Ajouter un Rendez-vous</h2>
          <button onClick={() => setShowAddAppointmentModal(false)} className="text-gray-500 hover:text-gray-700">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
            <select value={newAppointment.patient_id} onChange={(e) => setNewAppointment({...newAppointment, patient_id: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
              <option value="">Sélectionner un patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name} - {p.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Médecin *</label>
            <select value={newAppointment.doctor_id} onChange={(e) => setNewAppointment({...newAppointment, doctor_id: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
              <option value="">Sélectionner un médecin</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} - {d.specialization}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input type="date" value={newAppointment.appointment_date} 
                onChange={(e) => setNewAppointment({...newAppointment, appointment_date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure *</label>
              <input type="time" value={newAppointment.appointment_time} 
                onChange={(e) => setNewAppointment({...newAppointment, appointment_time: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motif *</label>
            <input type="text" value={newAppointment.reason} 
              onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
              placeholder="Consultation générale, suivi, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea value={newAppointment.notes} 
              onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" rows="3" />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button onClick={() => setShowAddAppointmentModal(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Annuler
            </button>
            <button onClick={handleAddAppointment}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Créer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal Modifier Rendez-vous */}
{showEditAppointmentModal && selectedAppointment && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Modifier le Rendez-vous</h2>
          <button onClick={() => {setShowEditAppointmentModal(false); setSelectedAppointment(null);}} 
            className="text-gray-500 hover:text-gray-700">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
            <select value={selectedAppointment.patient_id} 
              onChange={(e) => setSelectedAppointment({...selectedAppointment, patient_id: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
              <option value="">Sélectionner un patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name} - {p.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Médecin *</label>
            <select value={selectedAppointment.doctor_id} 
              onChange={(e) => setSelectedAppointment({...selectedAppointment, doctor_id: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
              <option value="">Sélectionner un médecin</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} - {d.specialization}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date & Heure *</label>
            <input type="datetime-local" 
              value={selectedAppointment.appointment_date ? new Date(selectedAppointment.appointment_date).toISOString().slice(0, 16) : ''}
              onChange={(e) => setSelectedAppointment({...selectedAppointment, appointment_date: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motif *</label>
            <input type="text" value={selectedAppointment.reason || ''} 
              onChange={(e) => setSelectedAppointment({...selectedAppointment, reason: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select value={selectedAppointment.status || 'scheduled'} 
              onChange={(e) => setSelectedAppointment({...selectedAppointment, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="scheduled">Planifié</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea value={selectedAppointment.notes || ''} 
              onChange={(e) => setSelectedAppointment({...selectedAppointment, notes: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" rows="3" />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button onClick={() => {setShowEditAppointmentModal(false); setSelectedAppointment(null);}}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Annuler
            </button>
            <button onClick={handleEditAppointment}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal Ajouter Médicament */}
{showAddMedicineModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Ajouter un Médicament</h2>
          <button onClick={() => setShowAddMedicineModal(false)} className="text-gray-500 hover:text-gray-700">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input type="text" value={newMedicine.name} 
                onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                placeholder="Paracétamol, Aspirine, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
              <input type="text" value={newMedicine.category} 
                onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
                placeholder="Analgésique, Antibiotique, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fabricant</label>
              <input type="text" value={newMedicine.manufacturer} 
                onChange={(e) => setNewMedicine({...newMedicine, manufacturer: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Forme</label>
              <input type="text" value={newMedicine.dosage_form} 
                onChange={(e) => setNewMedicine({...newMedicine, dosage_form: e.target.value})}
                placeholder="Comprimé, Gélule, Sirop, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
              <input type="text" value={newMedicine.strength} 
                onChange={(e) => setNewMedicine({...newMedicine, strength: e.target.value})}
                placeholder="500mg, 10ml, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input type="number" value={newMedicine.stock_quantity} 
                onChange={(e) => setNewMedicine({...newMedicine, stock_quantity: e.target.value})}
                min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seuil d'alerte</label>
              <input type="number" value={newMedicine.reorder_level} 
                onChange={(e) => setNewMedicine({...newMedicine, reorder_level: e.target.value})}
                min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix unitaire (€)</label>
              <input type="number" value={newMedicine.unit_price} 
                onChange={(e) => setNewMedicine({...newMedicine, unit_price: e.target.value})}
                min="0" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration</label>
              <input type="date" value={newMedicine.expiry_date} 
                onChange={(e) => setNewMedicine({...newMedicine, expiry_date: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea value={newMedicine.description} 
              onChange={(e) => setNewMedicine({...newMedicine, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" rows="3" />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button onClick={() => setShowAddMedicineModal(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Annuler
            </button>
            <button onClick={handleAddMedicine}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal Modifier Médicament */}
{showEditMedicineModal && selectedMedicine && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Modifier le Médicament</h2>
          <button onClick={() => {setShowEditMedicineModal(false); setSelectedMedicine(null);}} 
            className="text-gray-500 hover:text-gray-700">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input type="text" value={selectedMedicine.name} 
                onChange={(e) => setSelectedMedicine({...selectedMedicine, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
              <input type="text" value={selectedMedicine.category} 
                onChange={(e) => setSelectedMedicine({...selectedMedicine, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fabricant</label>
              <input type="text" value={selectedMedicine.manufacturer || ''} 
                onChange={(e) => setSelectedMedicine({...selectedMedicine, manufacturer: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Forme</label>
              <input type="text" value={selectedMedicine.dosage_form || ''} 
                onChange={(e) => setSelectedMedicine({...selectedMedicine, dosage_form: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
              <input type="text" value={selectedMedicine.strength || ''} 
                onChange={(e) => setSelectedMedicine({...selectedMedicine, strength: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input type="number" value={selectedMedicine.stock_quantity} 
                onChange={(e) => setSelectedMedicine({...selectedMedicine, stock_quantity: e.target.value})}
                min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seuil d'alerte</label>
              <input type="number" value={selectedMedicine.reorder_level} 
                onChange={(e) => setSelectedMedicine({...selectedMedicine, reorder_level: e.target.value})}
                min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix unitaire (€)</label>
              <input type="number" value={selectedMedicine.unit_price} 
                onChange={(e) => setSelectedMedicine({...selectedMedicine, unit_price: e.target.value})}
                min="0" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration</label>
              <input type="date" value={selectedMedicine.expiry_date?.split('T')[0] || ''} 
                onChange={(e) => setSelectedMedicine({...selectedMedicine, expiry_date: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea value={selectedMedicine.description || ''} 
              onChange={(e) => setSelectedMedicine({...selectedMedicine, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" rows="3" />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button onClick={() => {setShowEditMedicineModal(false); setSelectedMedicine(null);}}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Annuler
            </button>
            <button onClick={handleEditMedicine}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
{/* Modal Profil Médecin */}
{showDoctorProfileModal && selectedDoctorProfile && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
              {selectedDoctorProfile.first_name[0]}{selectedDoctorProfile.last_name[0]}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Dr. {selectedDoctorProfile.first_name} {selectedDoctorProfile.last_name}
              </h2>
              <p className="text-lg text-gray-600">{selectedDoctorProfile.specialization}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowDoctorProfileModal(false);
              setSelectedDoctorProfile(null);
              setDoctorAppointments([]);
              setDoctorPatients([]);
            }}
            className="text-gray-500 hover:text-gray-700 text-3xl"
          >
            ×
          </button>
        </div>

        {loadingProfile ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Informations du médecin */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-2">
                  <UserCheck className="w-5 h-5 text-indigo-600 mr-2" />
                  <h3 className="font-semibold text-gray-700">Informations générales</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email:</span> {selectedDoctorProfile.email}</p>
                  <p><span className="font-medium">Téléphone:</span> {selectedDoctorProfile.phone}</p>
                  <p><span className="font-medium">Licence:</span> {selectedDoctorProfile.license_number || 'N/A'}</p>
                  <p>
                    <span className="font-medium">Statut:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      selectedDoctorProfile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedDoctorProfile.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-2">
                  <Activity className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold text-gray-700">Expérience</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Années d'expérience:</span> {selectedDoctorProfile.years_of_experience || 0} ans</p>
                  <p><span className="font-medium">Frais consultation:</span> {selectedDoctorProfile.consultation_fee || 0}€</p>
                  <p><span className="font-medium">Membre depuis:</span> {new Date(selectedDoctorProfile.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-700">Statistiques</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Total rendez-vous:</span> {doctorAppointments.length}</p>
                  <p><span className="font-medium">Patients uniques:</span> {doctorPatients.length}</p>
                  <p><span className="font-medium">RDV cette semaine:</span> {
                    doctorAppointments.filter(apt => {
                      const aptDate = new Date(apt.appointment_date);
                      const now = new Date();
                      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 7);
                      return aptDate >= weekStart && aptDate < weekEnd;
                    }).length
                  }</p>
                </div>
              </div>
            </div>

            {/* Patients du médecin */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-indigo-600" />
                Patients suivis ({doctorPatients.length})
              </h3>
              
              {doctorPatients.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  Aucun patient n'a encore pris rendez-vous avec ce médecin
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Genre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre de RDV</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernier RDV</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {doctorPatients.map(patient => {
                          const patientAppointments = doctorAppointments.filter(apt => apt.patient_id === patient.id);
                          const lastAppointment = patientAppointments.sort((a, b) => 
                            new Date(b.appointment_date) - new Date(a.appointment_date)
                          )[0];
                          
                          return (
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
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                                  {patientAppointments.length} RDV
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {lastAppointment ? new Date(lastAppointment.appointment_date).toLocaleDateString('fr-FR') : 'N/A'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Rendez-vous récents */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-purple-600" />
                Rendez-vous récents ({doctorAppointments.length})
              </h3>
              
              {doctorAppointments.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  Aucun rendez-vous enregistré
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Heure</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {doctorAppointments
                          .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
                          .slice(0, 20)
                          .map(apt => (
                            <tr key={apt.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {new Date(apt.appointment_date).toLocaleString('fr-FR')}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {apt.patient?.name || `Patient #${apt.patient_id}`}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{apt.reason || 'N/A'}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                  apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {apt.status === 'scheduled' ? 'Planifié' : 
                                   apt.status === 'completed' ? 'Terminé' :
                                   apt.status === 'cancelled' ? 'Annulé' : apt.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
}
