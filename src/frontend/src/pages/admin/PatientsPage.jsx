import React, { useState, useEffect } from 'react';
import { Users, Search, Download, Edit, Trash2, Plus, X } from 'lucide-react';

const API_URL = 'http://localhost:5002/api';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
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

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/patients?per_page=50`);
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

      const response = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });

      const result = await response.json();

      if (result.success) {
        await logActivity('create', 'patient', result.patient.id, 
          `Patient ${newPatient.first_name} ${newPatient.last_name} ajouté`);
        alert('✅ Patient ajouté avec succès !');
        setShowAddModal(false);
        setNewPatient({
          first_name: '', last_name: '', email: '', phone: '',
          date_of_birth: '', gender: 'Homme', blood_group: '', address: ''
        });
        fetchPatients();
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

      const response = await fetch(`${API_URL}/patients/${selectedPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });

      const result = await response.json();

      if (result.success) {
        await logActivity('update', 'patient', selectedPatient.id, 
          `Patient ${selectedPatient.first_name} ${selectedPatient.last_name} modifié`);
        alert('✅ Patient modifié avec succès !');
        setShowEditModal(false);
        setSelectedPatient(null);
        fetchPatients();
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
      const response = await fetch(`${API_URL}/patients/${patient.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        await logActivity('delete', 'patient', patient.id, 
          `Patient ${patient.first_name} ${patient.last_name} supprimé`);
        alert('✅ Patient supprimé avec succès !');
        fetchPatients();
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
    a.download = `patients_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredPatients = patients.filter(p => 
    p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Patients</h1>
        <p className="text-gray-600">Gérez les dossiers de vos patients</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => exportToCSV(patients)}
              className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Patient
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Patients</p>
          <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Hommes</p>
          <p className="text-3xl font-bold text-blue-600">
            {patients.filter(p => p.gender === 'Homme').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Femmes</p>
          <p className="text-3xl font-bold text-pink-600">
            {patients.filter(p => p.gender === 'Femme').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Ce mois</p>
          <p className="text-3xl font-bold text-green-600">
            {patients.filter(p => {
              const created = new Date(p.created_at);
              const now = new Date();
              return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des patients...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Groupe Sanguin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {patient.first_name[0]}{patient.last_name[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {patient.first_name} {patient.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{patient.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{patient.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        patient.gender === 'Homme' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
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
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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

      {/* Modal Ajouter Patient */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ajouter un Patient</h2>
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
                      value={newPatient.first_name}
                      onChange={(e) => setNewPatient({...newPatient, first_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={newPatient.last_name}
                      onChange={(e) => setNewPatient({...newPatient, last_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                      placeholder="exemple@gmail.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                      placeholder="0555123456"
                      maxLength="10"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance *</label>
                    <input
                      type="date"
                      value={newPatient.date_of_birth}
                      onChange={(e) => setNewPatient({...newPatient, date_of_birth: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Genre *</label>
                    <select
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Groupe sanguin</label>
                  <input
                    type="text"
                    value={newPatient.blood_group}
                    onChange={(e) => setNewPatient({...newPatient, blood_group: e.target.value})}
                    placeholder="A+, O-, etc."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <textarea
                    value={newPatient.address}
                    onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="2"
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
                    onClick={handleAddPatient}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier Patient */}
      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Modifier le Patient</h2>
                <button onClick={() => {setShowEditModal(false); setSelectedPatient(null);}} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      value={selectedPatient.first_name}
                      onChange={(e) => setSelectedPatient({...selectedPatient, first_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={selectedPatient.last_name}
                      onChange={(e) => setSelectedPatient({...selectedPatient, last_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={selectedPatient.email}
                      onChange={(e) => setSelectedPatient({...selectedPatient, email: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      value={selectedPatient.phone}
                      onChange={(e) => setSelectedPatient({...selectedPatient, phone: e.target.value})}
                      maxLength="10"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance *</label>
                    <input
                      type="date"
                      value={selectedPatient.date_of_birth?.split('T')[0]}
                      onChange={(e) => setSelectedPatient({...selectedPatient, date_of_birth: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Genre *</label>
                    <select
                      value={selectedPatient.gender}
                      onChange={(e) => setSelectedPatient({...selectedPatient, gender: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Groupe sanguin</label>
                  <input
                    type="text"
                    value={selectedPatient.blood_group || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, blood_group: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <textarea
                    value={selectedPatient.address || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, address: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="2"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {setShowEditModal(false); setSelectedPatient(null);}}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleEditPatient}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
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