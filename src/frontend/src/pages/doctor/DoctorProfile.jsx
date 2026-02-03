import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  User, Mail, Phone, Calendar, Award, Stethoscope, 
  Users, Clock, FileText, TrendingUp, Edit, Save, X 
} from 'lucide-react';

const API_URLS = {
  patient: 'http://localhost:5002/api',
  appointment: 'http://localhost:5003/api',
  prescription: 'http://localhost:5004/api',
  doctor: 'http://localhost:5006/api'
};

export default function DoctorProfile() {
  const { user } = useContext(AuthContext);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [myPatients, setMyPatients] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [myPrescriptions, setMyPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchDoctorProfile();
  }, [user]);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      
      // 1. Récupérer les infos du médecin depuis doctor-service
      const doctorsRes = await fetch(`${API_URLS.doctor}/doctors?search=${user?.username}`);
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        if (doctorsData.success && doctorsData.doctors.length > 0) {
          const doctor = doctorsData.doctors[0];
          setDoctorInfo(doctor);
          setEditForm(doctor);
        }
      }
      
      // 2. Récupérer TOUS les RDV et filtrer ceux du médecin
      const appointmentsRes = await fetch(`${API_URLS.appointment}/appointments?per_page=200`);
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        if (appointmentsData.success) {
          const filtered = appointmentsData.appointments.filter(apt =>
            apt.doctor_name?.toLowerCase().includes(user?.username?.toLowerCase())
          );
          setMyAppointments(filtered);
          
          // Extraire les patients uniques
          const uniquePatientIds = [...new Set(filtered.map(apt => apt.patient_id))];
          
          // Récupérer les détails des patients
          const patientsPromises = uniquePatientIds.map(async (patientId) => {
            try {
              const res = await fetch(`${API_URLS.patient}/patients/${patientId}`);
              const data = await res.json();
              return data.success ? data.patient : null;
            } catch {
              return null;
            }
          });
          
          const patientsData = await Promise.all(patientsPromises);
          setMyPatients(patientsData.filter(p => p !== null));
        }
      }
      
      // 3. Récupérer les ordonnances du médecin
      const prescriptionsRes = await fetch(`${API_URLS.prescription}/prescriptions?per_page=200`);
      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        if (prescriptionsData.success) {
          const filtered = prescriptionsData.prescriptions.filter(pres =>
            pres.doctor_name?.toLowerCase().includes(user?.username?.toLowerCase())
          );
          setMyPrescriptions(filtered);
        }
      }
      
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    try {
      const response = await fetch(`${API_URLS.doctor}/doctors/${doctorInfo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      const result = await response.json();
      if (result.success) {
        setDoctorInfo(editForm);
        setIsEditing(false);
        alert('✅ Profil mis à jour avec succès !');
      } else {
        alert('❌ Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de connexion');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Stats
  const stats = {
    totalPatients: myPatients.length,
    totalAppointments: myAppointments.length,
    totalPrescriptions: myPrescriptions.length,
    appointmentsThisMonth: myAppointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      const now = new Date();
      return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="space-y-6 p-8 bg-gray-50 min-h-screen">
      {/* Header avec Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil Médical</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations et consultez vos statistiques</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg"
          >
            <Edit className="w-5 h-5 mr-2" />
            Modifier
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditForm(doctorInfo);
              }}
              className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
            >
              <X className="w-5 h-5 mr-2" />
              Annuler
            </button>
            <button
              onClick={handleEditSave}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              Enregistrer
            </button>
          </div>
        )}
      </div>

      {/* Carte Profil */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>
        <div className="px-8 pb-8">
          <div className="flex items-end -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl">
              {doctorInfo?.first_name?.[0]}{doctorInfo?.last_name?.[0]}
            </div>
            <div className="ml-6 mb-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Dr. {doctorInfo?.first_name} {doctorInfo?.last_name}
              </h2>
              <p className="text-lg text-indigo-600 font-medium">{doctorInfo?.specialization}</p>
            </div>
          </div>

          {/* Informations */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-1 border rounded"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{doctorInfo?.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Téléphone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-3 py-1 border rounded"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{doctorInfo?.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <Award className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Expérience</p>
                  <p className="text-gray-900 font-medium">{doctorInfo?.years_of_experience || 0} ans</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <Stethoscope className="w-5 h-5 text-indigo-600 mr-3" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Spécialisation</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.specialization || ''}
                      onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
                      className="w-full px-3 py-1 border rounded"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{doctorInfo?.specialization}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <Calendar className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Licence</p>
                  <p className="text-gray-900 font-medium">{doctorInfo?.license_number || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <Clock className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Frais Consultation</p>
                  <p className="text-gray-900 font-medium">{doctorInfo?.consultation_fee || 0}€</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Mes Patients</p>
          <p className="text-4xl font-bold text-gray-900">{stats.totalPatients}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Total RDV</p>
          <p className="text-4xl font-bold text-gray-900">{stats.totalAppointments}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-pink-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Ordonnances</p>
          <p className="text-4xl font-bold text-gray-900">{stats.totalPrescriptions}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Ce Mois</p>
          <p className="text-4xl font-bold text-gray-900">{stats.appointmentsThisMonth}</p>
        </div>
      </div>

      {/* Mes Patients */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Users className="w-6 h-6 mr-2 text-indigo-600" />
          Mes Patients ({myPatients.length})
        </h3>
        
        {myPatients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun patient enregistré</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPatients.slice(0, 6).map(patient => (
              <div key={patient.id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold mr-4">
                  {patient.first_name?.[0]}{patient.last_name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {patient.first_name} {patient.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{patient.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RDV Récents */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-purple-600" />
          Mes Rendez-vous Récents
        </h3>
        
        {myAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun rendez-vous</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myAppointments.slice(0, 5).map(apt => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-4">
                    {apt.patient?.name?.[0] || 'P'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {apt.patient?.name || `Patient #${apt.patient_id}`}
                    </p>
                    <p className="text-sm text-gray-500">{apt.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(apt.appointment_date).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(apt.appointment_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}