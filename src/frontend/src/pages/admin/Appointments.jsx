import React, { useState, useEffect } from 'react';
import { Calendar, Search, Download, Edit, Trash2, Plus, X, Clock } from 'lucide-react';

const API_URLS = {
  appointment: 'http://localhost:5003/api',
  patient: 'http://localhost:5002/api',
  doctor: 'http://localhost:5006/api'
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URLS.appointment}/appointments?per_page=100`);
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

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_URLS.patient}/patients?per_page=100`);
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URLS.doctor}/doctors?per_page=100`);
      const data = await res.json();
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const logActivity = async (action, entity, entityId, details = '') => {
    try {
      const activityData = {
        action,
        entity,
        entity_id: entityId,
        user: 'Admin',
        details,
        timestamp: new Date().toISOString()
      };
      const existingLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
      existingLogs.unshift(activityData);
      localStorage.setItem('activityLogs', JSON.stringify(existingLogs.slice(0, 1000)));
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
    }
  };

  const handleAddAppointment = async () => {
    try {
      if (!newAppointment.patient_id || !newAppointment.doctor_id || 
          !newAppointment.appointment_date || !newAppointment.appointment_time || 
          !newAppointment.reason?.trim()) {
        alert('❌ Veuillez remplir tous les champs obligatoires');
        return;
      }

      const appointmentDateTime = `${newAppointment.appointment_date} ${newAppointment.appointment_time}:00`;
      const selectedDoctor = doctors.find(d => d.id === parseInt(newAppointment.doctor_id));
      const doctorName = selectedDoctor ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}` : '';
      const selectedPatient = patients.find(p => p.id === parseInt(newAppointment.patient_id));
      const patientName = selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : '';

      const appointmentData = {
        patient_id: parseInt(newAppointment.patient_id),
        doctor_id: parseInt(newAppointment.doctor_id),
        doctor_name: doctorName,
        appointment_date: appointmentDateTime,
        reason: newAppointment.reason.trim(),
        notes: newAppointment.notes?.trim() || '',
        status: 'scheduled',
        duration: 30
      };

      const response = await fetch(`${API_URLS.appointment}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      const result = await response.json();

      if (result.success) {
        await logActivity('create', 'appointment', result.appointment?.id || 'N/A', 
          `Rendez-vous créé: ${patientName} avec ${doctorName} le ${new Date(appointmentDateTime).toLocaleDateString('fr-FR')}`);
        
        alert('✅ Rendez-vous créé avec succès !');
        setShowAddModal(false);
        setNewAppointment({
          patient_id: '', doctor_id: '', appointment_date: '',
          appointment_time: '', reason: '', notes: ''
        });
        fetchAppointments();
      } else {
        alert('❌ ' + (result.error || 'Erreur lors de la création'));
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
        setShowEditModal(false);
        setSelectedAppointment(null);
        fetchAppointments();
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
          `Rendez-vous du ${new Date(appointment.appointment_date).toLocaleDateString('fr-FR')} supprimé`);
        alert('✅ Rendez-vous supprimé avec succès !');
        fetchAppointments();
      } else {
        alert('❌ ' + (result.error || 'Erreur lors de la suppression'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de connexion au serveur');
    }
  };

  const exportToCSV = (data) => {
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
    a.download = `rendez-vous_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredAppointments = appointments.filter(a =>
    a.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const configs = {
      scheduled: { class: 'bg-blue-100 text-blue-700', label: 'Planifié' },
      completed: { class: 'bg-green-100 text-green-700', label: 'Terminé' },
      cancelled: { class: 'bg-red-100 text-red-700', label: 'Annulé' }
    };
    return configs[status] || configs.scheduled;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Rendez-vous</h1>
        <p className="text-gray-600">Planifiez et gérez les consultations</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un rendez-vous..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => exportToCSV(appointments)}
              className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau RDV
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Total RDV</p>
          <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Aujourd'hui</p>
          <p className="text-3xl font-bold text-blue-600">
            {appointments.filter(a => {
              const aptDate = new Date(a.appointment_date);
              const today = new Date();
              return aptDate.toDateString() === today.toDateString();
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Cette semaine</p>
          <p className="text-3xl font-bold text-purple-600">
            {appointments.filter(a => {
              const aptDate = new Date(a.appointment_date);
              const now = new Date();
              const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 7);
              return aptDate >= weekStart && aptDate < weekEnd;
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Terminés</p>
          <p className="text-3xl font-bold text-green-600">
            {appointments.filter(a => a.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des rendez-vous...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date & Heure
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Médecin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Motif
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((apt) => {
                  const statusBadge = getStatusBadge(apt.status);
                  return (
                    <tr key={apt.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-purple-600 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(apt.appointment_date).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(apt.appointment_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {apt.patient?.name || `Patient #${apt.patient_id}`}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{apt.doctor_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{apt.reason || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(apt)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Ajouter */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Nouveau Rendez-vous</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
                  <select
                    value={newAppointment.patient_id}
                    onChange={(e) => setNewAppointment({...newAppointment, patient_id: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name} - {p.email}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Médecin *</label>
                  <select
                    value={newAppointment.doctor_id}
                    onChange={(e) => setNewAppointment({...newAppointment, doctor_id: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner un médecin</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} - {d.specialization}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={newAppointment.appointment_date}
                      onChange={(e) => setNewAppointment({...newAppointment, appointment_date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heure *</label>
                    <input
                      type="time"
                      value={newAppointment.appointment_time}
                      onChange={(e) => setNewAppointment({...newAppointment, appointment_time: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motif *</label>
                  <input
                    type="text"
                    value={newAppointment.reason}
                    onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
                    placeholder="Consultation générale, suivi, etc."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddAppointment}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Créer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Modifier le Rendez-vous</h2>
                <button onClick={() => {setShowEditModal(false); setSelectedAppointment(null);}} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
                  <select
                    value={selectedAppointment.patient_id}
                    onChange={(e) => setSelectedAppointment({...selectedAppointment, patient_id: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name} - {p.email}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Médecin *</label>
                  <select
                    value={selectedAppointment.doctor_id}
                    onChange={(e) => setSelectedAppointment({...selectedAppointment, doctor_id: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner un médecin</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} - {d.specialization}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date & Heure *</label>
                  <input
                    type="datetime-local"
                    value={selectedAppointment.appointment_date ? new Date(selectedAppointment.appointment_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setSelectedAppointment({...selectedAppointment, appointment_date: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motif *</label>
                  <input
                    type="text"
                    value={selectedAppointment.reason || ''}
                    onChange={(e) => setSelectedAppointment({...selectedAppointment, reason: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={selectedAppointment.status || 'scheduled'}
                    onChange={(e) => setSelectedAppointment({...selectedAppointment, status: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="scheduled">Planifié</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={selectedAppointment.notes || ''}
                    onChange={(e) => setSelectedAppointment({...selectedAppointment, notes: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {setShowEditModal(false); setSelectedAppointment(null);}}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleEditAppointment}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}