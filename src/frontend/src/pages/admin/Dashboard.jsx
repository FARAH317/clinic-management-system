import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, Pill, Activity, TrendingUp, Clock, AlertCircle, UserCheck, DollarSign } from 'lucide-react';

// ⚠️ IMPORTANT: Ce Dashboard est conçu pour être utilisé AVEC AdminLayout
// Ne pas inclure de sidebar ici car elle est déjà dans AdminLayout

// URLs des microservices
const API_URLS = {
  patient: 'http://localhost:5002/api',
  appointment: 'http://localhost:5003/api',
  prescription: 'http://localhost:5004/api',
  medicine: 'http://localhost:5005/api',
  doctor: 'http://localhost:5006/api',
  billing: 'http://localhost:5007/api'
};

export default function Dashboard() {
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
    activeDoctors: 0,
    totalRevenue: 0,
    pendingAmount: 0
  });
  const [billingStats, setBillingStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    totalPending: 0
  });
  const [patients, setPatients] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        patientsStatsRes, 
        appointmentsStatsRes, 
        prescriptionsStatsRes, 
        medicinesStatsRes, 
        doctorsStatsRes, 
        patientsListRes,
        billingStatsRes
      ] = await Promise.all([
        fetch(`${API_URLS.patient}/patients/stats`).catch(() => ({ ok: false })),
        fetch(`${API_URLS.appointment}/appointments/stats`).catch(() => ({ ok: false })),
        fetch(`${API_URLS.prescription}/prescriptions/stats`).catch(() => ({ ok: false })),
        fetch(`${API_URLS.medicine}/medicines/stats`).catch(() => ({ ok: false })),
        fetch(`${API_URLS.doctor}/doctors/stats`).catch(() => ({ ok: false })),
        fetch(`${API_URLS.patient}/patients?per_page=5`).catch(() => ({ ok: false })),
        fetch(`${API_URLS.billing}/invoices/stats`).catch(() => ({ ok: false }))
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

      if (billingStatsRes.ok) {
        const billingData = await billingStatsRes.json();
        if (billingData.success) {
          setBillingStats({
            totalInvoices: billingData.stats.total_invoices || 0,
            totalRevenue: billingData.stats.total_revenue || 0,
            pendingInvoices: billingData.stats.pending || 0,
            totalPending: billingData.stats.total_pending || 0
          });
          setStats(prev => ({
            ...prev,
            totalRevenue: billingData.stats.total_revenue || 0,
            pendingAmount: billingData.stats.total_pending || 0
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

  const StatCard = ({ icon: Icon, title, value, subValue, color, bgColor, trend }) => (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 hover:shadow-lg transition-all duration-300 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-lg p-3 ${bgColor}`}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        {subValue && <p className="text-sm text-gray-500">{subValue}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Chargement des données...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid principale */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              title="Patients totaux"
              value={stats.totalPatients}
              subValue={`+${stats.newThisMonth} ce mois`}
              color="#4F46E5"
              bgColor="bg-indigo-500/10"
              trend={12}
            />
            <StatCard
              icon={UserCheck}
              title="Médecins actifs"
              value={stats.activeDoctors}
              subValue={`${stats.totalDoctors} au total`}
              color="#059669"
              bgColor="bg-green-500/10"
            />
            <StatCard
              icon={Calendar}
              title="RDV aujourd'hui"
              value={stats.appointmentsToday}
              subValue={`${stats.appointmentsThisWeek} cette semaine`}
              color="#7C3AED"
              bgColor="bg-purple-500/10"
              trend={8}
            />
            <StatCard
              icon={Pill}
              title="Stock faible"
              value={stats.lowStockMedicines}
              subValue={`${stats.totalMedicines} médicaments total`}
              color="#DC2626"
              bgColor="bg-red-500/10"
              trend={-5}
            />
          </div>

          {/* Stats secondaires */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={FileText}
              title="Ordonnances actives"
              value={stats.activePrescriptions}
              subValue={`${stats.totalPrescriptions} au total`}
              color="#8B5CF6"
              bgColor="bg-violet-500/10"
            />
            <StatCard
              icon={DollarSign}
              title="Revenus totaux"
              value={`${stats.totalRevenue}€`}
              subValue={`${billingStats.totalInvoices} factures`}
              color="#10B981"
              bgColor="bg-emerald-500/10"
              trend={15}
            />
            <StatCard
              icon={Clock}
              title="Montant en attente"
              value={`${stats.pendingAmount}€`}
              subValue={`${billingStats.pendingInvoices} factures`}
              color="#F59E0B"
              bgColor="bg-amber-500/10"
            />
          </div>

          {/* Activity & Patients */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-400" />
                  Activités récentes
                </h3>
                <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                  Voir tout
                </button>
              </div>
              <ul className="space-y-4">
                {recentActivities.map((act, index) => (
                  <li key={index} className="flex items-start p-3 rounded-lg hover:bg-gray-700/50 transition">
                    <div className={`p-2 rounded-lg ${act.color} bg-opacity-10 flex-shrink-0`}>
                      <act.icon className={`w-5 h-5 ${act.color}`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm text-gray-300 font-medium">{act.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{act.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Patients */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-indigo-400" />
                  Patients récents
                </h3>
                <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                  Voir tout
                </button>
              </div>
              <ul className="space-y-4">
                {patients.map((p) => (
                  <li key={p.id} className="flex items-center p-3 rounded-lg hover:bg-gray-700/50 transition">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {p.first_name[0]}{p.last_name[0]}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-semibold text-white">
                        {p.first_name} {p.last_name}
                      </p>
                      <p className="text-xs text-gray-400">{p.email}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      p.gender === 'Homme' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
                    }`}>
                      {p.gender}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}