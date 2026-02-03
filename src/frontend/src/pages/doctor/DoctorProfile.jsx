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
      console.log('👤 User connecté:', user);
      
      // 1. Récupérer les infos du médecin depuis doctor-service
      const doctorsRes = await fetch(`${API_URLS.doctor}/doctors?per_page=100`);
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        console.log('👨‍⚕️ Tous les médecins:', doctorsData);
        
        if (doctorsData.success && doctorsData.doctors.length > 0) {
          // Trouver le médecin par username (recherche flexible)
          const doctor = doctorsData.doctors.find(doc => {
            const docName = `${doc.first_name} ${doc.last_name}`.toLowerCase();
            const username = user?.username?.toLowerCase() || '';
            const firstName = user?.first_name?.toLowerCase() || '';
            
            return (
              docName.includes(username) ||
              docName.includes(firstName) ||
              doc.first_name?.toLowerCase() === firstName ||
              doc.last_name?.toLowerCase() === username
            );
          });
          
          console.log('✅ Médecin trouvé:', doctor);
          
          if (doctor) {
            setDoctorInfo(doctor);
            setEditForm(doctor);
            
            // Maintenant qu'on a le médecin, on filtre ses données avec son nom complet
            const doctorFullName = `Dr. ${doctor.first_name} ${doctor.last_name}`.toLowerCase();
            console.log('🔍 Filtrage avec:', doctorFullName);
            
            // 2. Récupérer SES rendez-vous
            await fetchDoctorAppointments(doctorFullName, doctor.id);
            
            // 3. Récupérer SES ordonnances
            await fetchDoctorPrescriptions(doctorFullName, doctor.id);
          } else {
            console.warn('⚠️ Médecin non trouvé dans la base');
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorAppointments = async (doctorFullName, doctorId) => {
    try {
      const appointmentsRes = await fetch(`${API_URLS.appointment}/appointments?per_page=500`);
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        console.log('📅 Tous les RDV:', appointmentsData);
        
        if (appointmentsData.success) {
          // Filtrer avec plusieurs critères
          const filtered = appointmentsData.appointments.filter(apt => {
            const aptDoctorName = apt.doctor_name?.toLowerCase() || '';
            const aptDoctorId = apt.doctor_id;
            
            return (
              aptDoctorName.includes(doctorFullName) ||
              aptDoctorId === doctorId ||
              aptDoctorName.includes(doctorFullName.replace('dr. ', ''))
            );
          });
          
          console.log('✅ RDV filtrés:', filtered.length);
          setMyAppointments(filtered);
          
          // Extraire les patients uniques
          const uniquePatientIds = [...new Set(filtered.map(apt => apt.patient_id))];
          console.log('👥 IDs patients uniques:', uniquePatientIds);
          
          // Récupérer les détails des patients
          if (uniquePatientIds.length > 0) {
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
            const validPatients = patientsData.filter(p => p !== null);
            console.log('✅ Patients récupérés:', validPatients.length);
            setMyPatients(validPatients);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur RDV:', error);
    }
  };

  const fetchDoctorPrescriptions = async (doctorFullName, doctorId) => {
    try {
      const prescriptionsRes = await fetch(`${API_URLS.prescription}/prescriptions?per_page=500`);
      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        console.log('💊 Toutes les ordonnances:', prescriptionsData);
        
        if (prescriptionsData.success) {
          // Filtrer avec plusieurs critères
          const filtered = prescriptionsData.prescriptions.filter(pres => {
            const presDoctorName = pres.doctor_name?.toLowerCase() || '';
            const presDoctorId = pres.doctor_id;
            
            return (
              presDoctorName.includes(doctorFullName) ||
              presDoctorId === doctorId ||
              presDoctorName.includes(doctorFullName.replace('dr. ', ''))
            );
          });
          
          console.log('✅ Ordonnances filtrées:', filtered.length);
          setMyPrescriptions(filtered);
        }
      }
    } catch (error) {
      console.error('❌ Erreur ordonnances:', error);
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
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (!doctorInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Profil médecin non trouvé</p>
          <p className="text-gray-500 text-sm mt-2">Veuillez contacter l'administrateur</p>
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
    <div className="space-y-6 p-8 bg-gray-900 min-h-screen">
      {/* Header avec Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mon Profil Médical</h1>
          <p className="text-gray-400 mt-1">Gérez vos informations et consultez vos statistiques</p>
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
              className="flex items-center px-6 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition"
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
      <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>
        <div className="px-8 pb-8">
          <div className="flex items-end -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-800 shadow-xl">
              {doctorInfo?.first_name?.[0]}{doctorInfo?.last_name?.[0]}
            </div>
            <div className="ml-6 mb-4">
              <h2 className="text-3xl font-bold text-white">
                Dr. {doctorInfo?.first_name} {doctorInfo?.last_name}
              </h2>
              <p className="text-blue-400 text-lg">{doctorInfo?.specialization}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-700/50 rounded-xl">
                <Mail className="w-5 h-5 text-blue-400 mr-3" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium uppercase">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  ) : (
                    <p className="text-white font-medium">{doctorInfo?.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-700/50 rounded-xl">
                <Phone className="w-5 h-5 text-green-400 mr-3" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium uppercase">Téléphone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  ) : (
                    <p className="text-white font-medium">{doctorInfo?.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-700/50 rounded-xl">
                <Award className="w-5 h-5 text-purple-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Expérience</p>
                  <p className="text-white font-medium">{doctorInfo?.years_of_experience || 0} ans</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-700/50 rounded-xl">
                <Stethoscope className="w-5 h-5 text-indigo-400 mr-3" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium uppercase">Spécialisation</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.specialization || ''}
                      onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
                      className="w-full px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  ) : (
                    <p className="text-white font-medium">{doctorInfo?.specialization}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-700/50 rounded-xl">
                <Calendar className="w-5 h-5 text-red-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Licence</p>
                  <p className="text-white font-medium">{doctorInfo?.license_number || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-700/50 rounded-xl">
                <Clock className="w-5 h-5 text-orange-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Frais Consultation</p>
                  <p className="text-white font-medium">{doctorInfo?.consultation_fee || 0}€</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-gray-400 text-sm font-medium mb-1">Mes Patients</p>
          <p className="text-4xl font-bold text-white">{stats.totalPatients}</p>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-gray-400 text-sm font-medium mb-1">Total RDV</p>
          <p className="text-4xl font-bold text-white">{stats.totalAppointments}</p>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-gray-400 text-sm font-medium mb-1">Ordonnances</p>
          <p className="text-4xl font-bold text-white">{stats.totalPrescriptions}</p>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-gray-400 text-sm font-medium mb-1">Ce Mois</p>
          <p className="text-4xl font-bold text-white">{stats.appointmentsThisMonth}</p>
        </div>
      </div>

      {/* Mes Patients */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Users className="w-6 h-6 mr-2 text-indigo-400" />
          Mes Patients ({myPatients.length})
        </h3>
        
        {myPatients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucun patient enregistré</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPatients.slice(0, 6).map(patient => (
              <div key={patient.id} className="flex items-center p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold mr-4">
                  {patient.first_name?.[0]}{patient.last_name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {patient.first_name} {patient.last_name}
                  </p>
                  <p className="text-sm text-gray-400">{patient.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RDV Récents */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-purple-400" />
          Mes Rendez-vous Récents
        </h3>
        
        {myAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucun rendez-vous</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myAppointments.slice(0, 5).map(apt => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-4">
                    {apt.patient?.name?.[0] || 'P'}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {apt.patient?.name || `Patient #${apt.patient_id}`}
                    </p>
                    <p className="text-sm text-gray-400">{apt.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {new Date(apt.appointment_date).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-400">
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