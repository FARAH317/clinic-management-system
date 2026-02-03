import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, FileText, TrendingUp, Clock, Activity, UserCheck, Eye } from 'lucide-react';

const API_URLS = {
  patient: 'http://localhost:5002/api',
  appointment: 'http://localhost:5003/api',
  prescription: 'http://localhost:5004/api',
  doctor: 'http://localhost:5006/api'
};

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    myPatients: 0,
    myAppointmentsToday: 0,
    myAppointmentsWeek: 0,
    myPrescriptions: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorData();
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les infos du médecin connecté
      const doctorName = user?.username ? `Dr. ${user.username}` : '';
      
      // Récupérer SES rendez-vous
      const appointmentsRes = await fetch(`${API_URLS.appointment}/appointments?per_page=100`);
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        if (appointmentsData.success) {
          // Filtrer UNIQUEMENT les RDV du médecin connecté
          const myAppointments = appointmentsData.appointments.filter(apt => 
            apt.doctor_name?.toLowerCase().includes(user?.username?.toLowerCase())
          );
          
          setRecentAppointments(myAppointments.slice(0, 5));
          
          // Stats RDV aujourd'hui
          const today = new Date();
          const myAppointmentsToday = myAppointments.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            return aptDate.toDateString() === today.toDateString();
          }).length;
          
          // Stats RDV cette semaine
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          const myAppointmentsWeek = myAppointments.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            return aptDate >= weekStart && aptDate < weekEnd;
          }).length;
          
          // Extraire les IDs patients uniques du médecin
          const uniquePatientIds = [...new Set(myAppointments.map(apt => apt.patient_id))];
          
          setStats(prev => ({
            ...prev,
            myPatients: uniquePatientIds.length,
            myAppointmentsToday,
            myAppointmentsWeek
          }));
        }
      }
      
      // Récupérer SES ordonnances
      const prescriptionsRes = await fetch(`${API_URLS.prescription}/prescriptions?per_page=100`);
      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        if (prescriptionsData.success) {
          const myPrescriptions = prescriptionsData.prescriptions.filter(pres =>
            pres.doctor_name?.toLowerCase().includes(user?.username?.toLowerCase())
          );
          setStats(prev => ({
            ...prev,
            myPrescriptions: myPrescriptions.length
          }));
        }
      }
      
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 hover:shadow-lg transition-all duration-300 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-lg p-3 ${bgColor}`}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Personnalisé */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bienvenue Dr. {user?.first_name || user?.username} 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Voici un aperçu de votre activité médicale
            </p>
          </div>
          <button
            onClick={() => navigate('/doctor/profile')}
            className="flex items-center px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg"
          >
            <Eye className="w-5 h-5 mr-2" />
            Voir Mon Profil Complet
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Chargement de vos données...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              title="Mes Patients"
              value={stats.myPatients}
              color="#4F46E5"
              bgColor="bg-indigo-500/10"
            />
            <StatCard
              icon={Calendar}
              title="RDV Aujourd'hui"
              value={stats.myAppointmentsToday}
              color="#7C3AED"
              bgColor="bg-purple-500/10"
            />
            <StatCard
              icon={Clock}
              title="RDV Cette Semaine"
              value={stats.myAppointmentsWeek}
              color="#059669"
              bgColor="bg-green-500/10"
            />
            <StatCard
              icon={FileText}
              title="Mes Ordonnances"
              value={stats.myPrescriptions}
              color="#8B5CF6"
              bgColor="bg-violet-500/10"
            />
          </div>

          {/* Rendez-vous Récents */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                Mes Rendez-vous Récents
              </h3>
              <button
                onClick={() => navigate('/doctor/appointments')}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                Voir tout
              </button>
            </div>

            {recentAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Aucun rendez-vous récent</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAppointments.map((apt) => (
                  <div key={apt.id} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {apt.patient?.name?.[0] || 'P'}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {apt.patient?.name || `Patient #${apt.patient_id}`}
                          </p>
                          <p className="text-sm text-gray-400">{apt.reason || 'Consultation'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">
                          {new Date(apt.appointment_date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(apt.appointment_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accès Rapide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/doctor/patients')}
              className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 text-left hover:shadow-xl transition-all group"
            >
              <Users className="w-8 h-8 text-white mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-white font-bold text-lg mb-1">Mes Patients</h4>
              <p className="text-indigo-200 text-sm">Gérer mes patients</p>
            </button>

            <button
              onClick={() => navigate('/doctor/appointments')}
              className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-left hover:shadow-xl transition-all group"
            >
              <Calendar className="w-8 h-8 text-white mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-white font-bold text-lg mb-1">Mes Rendez-vous</h4>
              <p className="text-purple-200 text-sm">Consulter mon agenda</p>
            </button>

            <button
              onClick={() => navigate('/doctor/prescriptions')}
              className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl p-6 text-left hover:shadow-xl transition-all group"
            >
              <FileText className="w-8 h-8 text-white mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-white font-bold text-lg mb-1">Mes Ordonnances</h4>
              <p className="text-pink-200 text-sm">Gérer mes prescriptions</p>
            </button>
          </div>
        </>
      )}
    </div>
  );
}