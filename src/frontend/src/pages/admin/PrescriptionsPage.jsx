import React, { useState, useEffect } from 'react';
import { FileText, Search, Plus, X, Download, Trash2 } from 'lucide-react';

const API_URLS = {
  prescription: 'http://localhost:5004/api',
  patient: 'http://localhost:5002/api',
  doctor: 'http://localhost:5006/api',
  medicine: 'http://localhost:5005/api'
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
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

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
    fetchDoctors();
    fetchMedicines();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URLS.prescription}/prescriptions?per_page=100`);
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

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_URLS.patient}/patients?per_page=100`);
      const data = await res.json();
      if (data.success) setPatients(data.patients);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URLS.doctor}/doctors?per_page=100`);
      const data = await res.json();
      if (data.success) setDoctors(data.doctors);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await fetch(`${API_URLS.medicine}/medicines?per_page=100`);
      const data = await res.json();
      if (data.success) setMedicines(data.medicines);
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

  const handleAddPrescription = async () => {
    try {
      if (!newPrescription.patient_id || !newPrescription.doctor_id || !newPrescription.diagnosis?.trim()) {
        alert('❌ Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (newPrescription.medications.length === 0) {
        alert('❌ Veuillez ajouter au moins un médicament');
        return;
      }

      const selectedDoctor = doctors.find(d => d.id === parseInt(newPrescription.doctor_id));
      if (!selectedDoctor) {
        alert('❌ Médecin non trouvé');
        return;
      }
      const doctorName = `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`;

      const prescriptionData = {
        patient_id: parseInt(newPrescription.patient_id),
        doctor_name: doctorName,
        diagnosis: newPrescription.diagnosis.trim(),
        notes: newPrescription.notes?.trim() || '',
        valid_until: newPrescription.valid_until || null,
        medications: newPrescription.medications.map(med => ({
          medicine_id: parseInt(med.medicine_id),
          medicine_name: med.medicine_name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration || '',
          quantity: parseInt(med.quantity) || 1,
          instructions: med.instructions || ''
        }))
      };

      const response = await fetch(`${API_URLS.prescription}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData)
      });

      const result = await response.json();

      if (result.success) {
        await logActivity('create', 'prescription', result.prescription?.id || 'N/A',
          `Ordonnance créée par ${doctorName} pour patient #${newPrescription.patient_id}`);
        
        alert('✅ Ordonnance créée avec succès !');
        setShowAddModal(false);
        setNewPrescription({
          patient_id: '', doctor_id: '', diagnosis: '',
          notes: '', valid_until: '', medications: []
        });
        fetchPrescriptions();
      } else {
        alert('❌ ' + (result.error || 'Erreur lors de la création'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de connexion au serveur');
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

  const filteredPrescriptions = prescriptions.filter(p =>
    p.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Ordonnances</h1>
        <p className="text-gray-600">Créez et gérez les prescriptions médicales</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une ordonnance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer Ordonnance
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-900">{prescriptions.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Actives</p>
          <p className="text-3xl font-bold text-green-600">
            {prescriptions.filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Expirées</p>
          <p className="text-3xl font-bold text-red-600">
            {prescriptions.filter(p => p.status === 'expired').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Ce mois</p>
          <p className="text-3xl font-bold text-pink-600">
            {prescriptions.filter(p => {
              const created = new Date(p.prescription_date);
              const now = new Date();
              return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des ordonnances...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrescriptions.map(pres => (
            <div key={pres.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Ordonnance #{pres.id}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(pres.prescription_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  pres.status === 'active' ? 'bg-green-100 text-green-700' :
                  pres.status === 'expired' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
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
                className="w-full flex items-center justify-center px-4 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ajouter */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Créer une Ordonnance</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
                  <select
                    value={newPrescription.patient_id}
                    onChange={(e) => setNewPrescription({...newPrescription, patient_id: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Médecin *</label>
                  <select
                    value={newPrescription.doctor_id}
                    onChange={(e) => setNewPrescription({...newPrescription, doctor_id: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diagnostic *</label>
                  <textarea
                    value={newPrescription.diagnosis}
                    onChange={(e) => setNewPrescription({...newPrescription, diagnosis: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valide jusqu'au</label>
                  <input
                    type="date"
                    value={newPrescription.valid_until}
                    onChange={(e) => setNewPrescription({...newPrescription, valid_until: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={newPrescription.notes}
                    onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows="2"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Médicaments</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Médicament *</label>
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dosage *</label>
                      <input
                        type="text"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                        placeholder="ex: 500mg"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence *</label>
                      <input
                        type="text"
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                        placeholder="ex: 3 fois par jour"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Durée</label>
                      <input
                        type="text"
                        value={newMedication.duration}
                        onChange={(e) => setNewMedication({...newMedication, duration: e.target.value})}
                        placeholder="ex: 7 jours"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                      <input
                        type="number"
                        value={newMedication.quantity}
                        onChange={(e) => setNewMedication({...newMedication, quantity: e.target.value})}
                        placeholder="ex: 21"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                      <input
                        type="text"
                        value={newMedication.instructions}
                        onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                        placeholder="ex: Prendre après les repas"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    onClick={addMedicationToPrescription}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-4"
                  >
                    Ajouter ce médicament
                  </button>

                  {newPrescription.medications.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Médicaments ajoutés:</h4>
                      <ul className="space-y-2">
                        {newPrescription.medications.map((med, index) => (
                          <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
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
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddPrescription}
                    className="px-6 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                  >
                    Créer l'ordonnance
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