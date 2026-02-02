import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Download, Edit, Trash2, Plus, X, Eye, Calendar, Users as UsersIcon } from 'lucide-react';

const API_URLS = {
  doctor: 'http://localhost:5006/api',
  appointment: 'http://localhost:5003/api',
  patient: 'http://localhost:5002/api'
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
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

  useEffect(() => {
    fetchDoctors();
  }, []);

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

  const fetchDoctorProfile = async (doctorId) => {
    try {
      setLoadingProfile(true);
      
      const doctorRes = await fetch(`${API_URLS.doctor}/doctors/${doctorId}`);
      const doctorData = await doctorRes.json();
      
      if (doctorData.success) {
        setSelectedDoctor(doctorData.doctor);
        
        const appointmentsRes = await fetch(`${API_URLS.appointment}/appointments?doctor_id=${doctorId}&per_page=100`);
        const appointmentsData = await appointmentsRes.json();
        
        if (appointmentsData.success) {
          setDoctorAppointments(appointmentsData.appointments);
          
          const uniquePatientIds = [...new Set(appointmentsData.appointments.map(apt => apt.patient_id))];
          
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
        setShowAddModal(false);
        setNewDoctor({
          first_name: '', last_name: '', email: '', phone: '',
          specialization: '', license_number: '', years_of_experience: 0, consultation_fee: 0
        });
        fetchDoctors();
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
        setShowEditModal(false);
        setSelectedDoctor(null);
        fetchDoctors();
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
      } else {
        alert('❌ ' + (result.error || 'Erreur lors de la suppression'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de connexion au serveur');
    }
  };

  const openDoctorProfile = async (doctor) => {
    setShowProfileModal(true);
    await fetchDoctorProfile(doctor.id);
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
    a.download = `medecins_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredDoctors = doctors.filter(d =>
    d.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Médecins</h1>
        <p className="text-gray-600">Gérez votre équipe médicale</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un médecin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => exportToCSV(doctors)}
              className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Médecin
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Médecins</p>
          <p className="text-3xl font-bold text-gray-900">{doctors.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Actifs</p>
          <p className="text-3xl font-bold text-green-600">
            {doctors.filter(d => d.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Spécialités</p>
          <p className="text-3xl font-bold text-purple-600">
            {new Set(doctors.map(d => d.specialization)).size}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Exp. Moyenne</p>
          <p className="text-3xl font-bold text-blue-600">
            {doctors.length > 0 ? Math.round(doctors.reduce((acc, d) => acc + (d.years_of_experience || 0), 0) / doctors.length) : 0} ans
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des médecins...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Médecin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Spécialisation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Licence
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
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                          {doctor.first_name[0]}{doctor.last_name[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                        {doctor.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{doctor.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{doctor.license_number || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        doctor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {doctor.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDoctorProfile(doctor)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Voir profil"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doctor)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Ajouter Médecin */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ajouter un Médecin</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      value={newDoctor.first_name}
                      onChange={(e) => setNewDoctor({...newDoctor, first_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={newDoctor.last_name}
                      onChange={(e) => setNewDoctor({...newDoctor, last_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                      placeholder="exemple@gmail.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      value={newDoctor.phone}
                      onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                      placeholder="0555123456"
                      maxLength="10"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spécialisation *</label>
                  <input
                    type="text"
                    value={newDoctor.specialization}
                    onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                    placeholder="Cardiologue, Pédiatre, etc."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de licence</label>
                    <input
                      type="text"
                      value={newDoctor.license_number}
                      onChange={(e) => setNewDoctor({...newDoctor, license_number: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Années d'expérience</label>
                    <input
                      type="number"
                      value={newDoctor.years_of_experience}
                      onChange={(e) => setNewDoctor({...newDoctor, years_of_experience: e.target.value})}
                      min="0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frais de consultation (€)</label>
                  <input
                    type="number"
                    value={newDoctor.consultation_fee}
                    onChange={(e) => setNewDoctor({...newDoctor, consultation_fee: e.target.value})}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    onClick={handleAddDoctor}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier Médecin */}
      {showEditModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Modifier le Médecin</h2>
                <button onClick={() => {setShowEditModal(false); setSelectedDoctor(null);}} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      value={selectedDoctor.first_name}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, first_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={selectedDoctor.last_name}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, last_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={selectedDoctor.email}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, email: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      value={selectedDoctor.phone}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, phone: e.target.value})}
                      maxLength="10"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spécialisation *</label>
                  <input
                    type="text"
                    value={selectedDoctor.specialization}
                    onChange={(e) => setSelectedDoctor({...selectedDoctor, specialization: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de licence</label>
                    <input
                      type="text"
                      value={selectedDoctor.license_number || ''}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, license_number: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Années d'expérience</label>
                    <input
                      type="number"
                      value={selectedDoctor.years_of_experience}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, years_of_experience: e.target.value})}
                      min="0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frais de consultation (€)</label>
                  <input
                    type="number"
                    value={selectedDoctor.consultation_fee}
                    onChange={(e) => setSelectedDoctor({...selectedDoctor, consultation_fee: e.target.value})}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {setShowEditModal(false); setSelectedDoctor(null);}}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleEditDoctor}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Profil Médecin */}
      {showProfileModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
                    {selectedDoctor.first_name[0]}{selectedDoctor.last_name[0]}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                    </h2>
                    <p className="text-lg text-gray-600">{selectedDoctor.specialization}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setSelectedDoctor(null);
                    setDoctorAppointments([]);
                    setDoctorPatients([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              {loadingProfile ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center mb-2">
                        <UserCheck className="w-5 h-5 text-indigo-600 mr-2" />
                        <h3 className="font-semibold text-gray-700">Informations générales</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Email:</span> {selectedDoctor.email}</p>
                        <p><span className="font-medium">Téléphone:</span> {selectedDoctor.phone}</p>
                        <p><span className="font-medium">Licence:</span> {selectedDoctor.license_number || 'N/A'}</p>
                        <p>
                          <span className="font-medium">Statut:</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            selectedDoctor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedDoctor.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 shadow-sm">
                      <h3 className="font-semibold text-gray-700 mb-2">Expérience</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Années d'expérience:</span> {selectedDoctor.years_of_experience || 0} ans</p>
                        <p><span className="font-medium">Frais consultation:</span> {selectedDoctor.consultation_fee || 0}€</p>
                        <p><span className="font-medium">Membre depuis:</span> {new Date(selectedDoctor.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 shadow-sm">
                      <h3 className="font-semibold text-gray-700 mb-2">Statistiques</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Total rendez-vous:</span> {doctorAppointments.length}</p>
                        <p><span className="font-medium">Patients uniques:</span> {doctorPatients.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <UsersIcon className="w-6 h-6 mr-2 text-indigo-600" />
                      Patients suivis ({doctorPatients.length})
                    </h3>
                    {doctorPatients.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                        Aucun patient n'a encore pris rendez-vous avec ce médecin
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto max-h-64">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nombre RDV</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {doctorPatients.map(patient => {
                                const patientAppointments = doctorAppointments.filter(apt => apt.patient_id === patient.id);
                                return (
                                  <tr key={patient.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {patient.first_name} {patient.last_name}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{patient.phone}</td>
                                    <td className="px-6 py-4">
                                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                                        {patientAppointments.length} RDV
                                      </span>
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

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Calendar className="w-6 h-6 mr-2 text-purple-600" />
                      Rendez-vous récents ({doctorAppointments.length})
                    </h3>
                    {doctorAppointments.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                        Aucun rendez-vous enregistré
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto max-h-96">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date & Heure</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Motif</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Statut</th>
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
                                        apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                        apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
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