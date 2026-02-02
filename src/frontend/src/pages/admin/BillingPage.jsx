import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, FileText, Plus, X } from 'lucide-react';

const API_URLS = {
  billing: 'http://localhost:5007/api',
  appointment: 'http://localhost:5003/api'
};

export default function BillingPage() {
  const [activeSubTab, setActiveSubTab] = useState('imc');
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // États IMC
  const [imcData, setImcData] = useState({
    weight: '',
    height: '',
    patient_id: '',
    notes: ''
  });
  const [imcResult, setImcResult] = useState(null);
  const [imcHistory, setImcHistory] = useState([]);

  // États Facturation
  const [billingStats, setBillingStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    totalPending: 0
  });
  const [invoices, setInvoices] = useState([]);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    consultation_id: '',
    patient_id: '',
    doctor_id: '',
    medication_cost: 0,
    additional_fees: 0,
    remboursement: 0,
    payment_method: 'cash',
    due_date: ''
  });

  useEffect(() => {
    fetchBillingData();
    fetchPatients();
    fetchAppointments();
    if (activeSubTab === 'facturation') {
      fetchInvoices();
    }
  }, [activeSubTab]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URLS.billing}/invoices/stats`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBillingStats({
            totalInvoices: data.stats.total_invoices || 0,
            totalRevenue: data.stats.total_revenue || 0,
            pendingInvoices: data.stats.pending || 0,
            totalPending: data.stats.total_pending || 0
          });
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://patient-service:5002/api/patients?per_page=100');
      const data = await res.json();
      if (data.success) setPatients(data.patients);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URLS.appointment}/appointments?per_page=100`);
      const data = await res.json();
      if (data.success) setAppointments(data.appointments);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URLS.billing}/invoices?per_page=50`);
      const data = await res.json();
      if (data.success) setInvoices(data.invoices);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateIMC = async () => {
    if (!imcData.weight || !imcData.height) {
      alert('Veuillez remplir le poids et la taille');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URLS.billing}/bmi/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imcData)
      });
      
      const data = await res.json();
      if (data.success) {
        setImcResult(data);
        alert(`IMC calculé: ${data.bmi} - ${data.category}`);
        setImcData({ weight: '', height: '', patient_id: '', notes: '' });
        
        if (imcData.patient_id) {
          fetchIMCHistory(imcData.patient_id);
        }
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      alert('Erreur de calcul IMC');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIMCHistory = async (patientId) => {
    try {
      const res = await fetch(`${API_URLS.billing}/bmi/records?patient_id=${patientId}`);
      const data = await res.json();
      if (data.success) setImcHistory(data.records);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      if (!newInvoice.consultation_id) {
        alert('❌ Veuillez sélectionner un rendez-vous');
        return;
      }

      const selectedAppointment = appointments.find(a => a.id === parseInt(newInvoice.consultation_id));
      
      if (!selectedAppointment) {
        alert('❌ Rendez-vous non trouvé');
        return;
      }

      const invoiceData = {
        consultation_id: parseInt(newInvoice.consultation_id),
        patient_id: selectedAppointment.patient_id,
        doctor_id: selectedAppointment.doctor_id || 1,
        medication_cost: parseFloat(newInvoice.medication_cost) || 0,
        additional_fees: parseFloat(newInvoice.additional_fees) || 0,
        remboursement: parseFloat(newInvoice.remboursement) || 0,
        payment_method: newInvoice.payment_method || 'cash',
        due_date: newInvoice.due_date || null
      };

      const response = await fetch(`${API_URLS.billing}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Facture créée avec succès !');
        setShowCreateInvoice(false);
        setNewInvoice({
          consultation_id: '', patient_id: '', doctor_id: '',
          medication_cost: 0, additional_fees: 0, remboursement: 0,
          payment_method: 'cash', due_date: ''
        });
        fetchInvoices();
        fetchBillingData();
      } else {
        alert('❌ Erreur: ' + (result.error || 'Impossible de créer la facture'));
      }
    } catch (error) {
      console.error('❌ Erreur création facture:', error);
      alert('❌ Erreur de connexion au serveur');
    }
  };

  const updateInvoiceStatus = async (invoiceId, status) => {
    try {
      const res = await fetch(`${API_URLS.billing}/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Statut mis à jour!');
        fetchInvoices();
        fetchBillingData();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getIMCColor = (category) => {
    const colors = {
      'Insuffisance pondérale': 'text-blue-600 bg-blue-100',
      'Poids normal': 'text-green-600 bg-green-100',
      'Surpoids': 'text-yellow-600 bg-yellow-100',
      'Obésité modérée': 'text-orange-600 bg-orange-100',
      'Obésité sévère': 'text-red-600 bg-red-100',
      'Obésité morbide': 'text-red-800 bg-red-200'
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      paid: { class: 'bg-green-100 text-green-800', label: 'Payée' },
      cancelled: { class: 'bg-red-100 text-red-800', label: 'Annulée' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Facturation & IMC</h1>
        <p className="text-gray-600">Gérez la facturation et calculez l'IMC des patients</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6 flex gap-2">
        <button
          onClick={() => setActiveSubTab('imc')}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition flex-1 justify-center ${
            activeSubTab === 'imc' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Calculator className="w-5 h-5 mr-2" />
          Calcul IMC
        </button>
        <button
          onClick={() => setActiveSubTab('facturation')}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition flex-1 justify-center ${
            activeSubTab === 'facturation' ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <DollarSign className="w-5 h-5 mr-2" />
          Facturation
        </button>
      </div>

      {/* IMC Tab */}
      {activeSubTab === 'imc' && (
        <div className="space-y-6">
          {/* Calculateur IMC */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Calculator className="w-6 h-6 mr-2 text-indigo-600" />
              Calculateur d'IMC
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={imcData.weight}
                  onChange={(e) => setImcData({...imcData, weight: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="70.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taille (cm) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={imcData.height}
                  onChange={(e) => setImcData({...imcData, height: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="175"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient (optionnel)</label>
                <select
                  value={imcData.patient_id}
                  onChange={(e) => {
                    setImcData({...imcData, patient_id: e.target.value});
                    if (e.target.value) fetchIMCHistory(e.target.value);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <input
                  type="text"
                  value={imcData.notes}
                  onChange={(e) => setImcData({...imcData, notes: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Notes additionnelles"
                />
              </div>
            </div>

            <button
              onClick={calculateIMC}
              disabled={loading}
              className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? 'Calcul en cours...' : 'Calculer l\'IMC'}
            </button>
          </div>

          {/* Résultat IMC */}
          {imcResult && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Résultat</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">IMC</p>
                  <p className="text-4xl font-bold text-indigo-600">{imcResult.bmi}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Poids</p>
                  <p className="text-4xl font-bold text-green-600">{imcResult.weight} kg</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Taille</p>
                  <p className="text-4xl font-bold text-purple-600">{imcResult.height} cm</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`inline-block px-6 py-2 rounded-full text-lg font-semibold ${getIMCColor(imcResult.category)}`}>
                  {imcResult.category}
                </span>
              </div>
            </div>
          )}

          {/* Historique IMC */}
          {imcHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Historique IMC</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Poids</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Taille</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">IMC</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Catégorie</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {imcHistory.map(record => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(record.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.weight} kg</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.height} cm</td>
                        <td className="px-6 py-4 text-sm font-bold text-indigo-600">{record.bmi}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getIMCColor(record.category)}`}>
                            {record.category}
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
      )}

      {/* Facturation Tab */}
      {activeSubTab === 'facturation' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium mb-1">Total Factures</p>
              <p className="text-3xl font-bold text-gray-900">{billingStats.totalInvoices}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium mb-1">Revenus Totaux</p>
              <p className="text-3xl font-bold text-green-600">{billingStats.totalRevenue}€</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium mb-1">En Attente</p>
              <p className="text-3xl font-bold text-yellow-600">{billingStats.pendingInvoices}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium mb-1">Montant Impayé</p>
              <p className="text-3xl font-bold text-red-600">{billingStats.totalPending}€</p>
            </div>
          </div>

          {/* Bouton Créer */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateInvoice(true)}
              className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer une facture
            </button>
          </div>

          {/* Liste des factures */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des factures...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">N° Facture</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Remboursement</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reste</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map(invoice => {
                      const statusInfo = getStatusBadge(invoice.status);
                      return (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">#{invoice.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">Patient #{invoice.patient_id}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">{invoice.montant_total}€</td>
                          <td className="px-6 py-4 text-sm text-green-600">{invoice.remboursement}€</td>
                          <td className="px-6 py-4 text-sm font-bold text-red-600">{invoice.reste_a_payer}€</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.class}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {invoice.status === 'pending' && (
                              <button
                                onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-xs font-medium"
                              >
                                Marquer payée
                              </button>
                            )}
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
      )}

      {/* Modal Créer Facture */}
      {showCreateInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Créer une Facture</h3>
                <button onClick={() => setShowCreateInvoice(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rendez-vous *</label>
                  <select
                    value={newInvoice.consultation_id}
                    onChange={(e) => {
                      const aptId = parseInt(e.target.value);
                      const apt = appointments.find(a => a.id === aptId);
                      setNewInvoice({
                        ...newInvoice,
                        consultation_id: e.target.value,
                        patient_id: apt?.patient_id || '',
                        doctor_id: apt?.doctor_id || ''
                      });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner un rendez-vous</option>
                    {appointments.map(apt => (
                      <option key={apt.id} value={apt.id}>
                        RDV #{apt.id} - {apt.doctor_name} - Patient #{apt.patient_id} - {new Date(apt.appointment_date).toLocaleDateString('fr-FR')}
                      </option>
                    ))}
                  </select>
                  
                  {newInvoice.consultation_id && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="text-blue-800">
                        ✅ Patient ID: #{newInvoice.patient_id} | Médecin ID: #{newInvoice.doctor_id}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coût médicaments (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newInvoice.medication_cost}
                      onChange={(e) => setNewInvoice({...newInvoice, medication_cost: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frais additionnels (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newInvoice.additional_fees}
                      onChange={(e) => setNewInvoice({...newInvoice, additional_fees: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remboursement (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newInvoice.remboursement}
                      onChange={(e) => setNewInvoice({...newInvoice, remboursement: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Méthode de paiement</label>
                    <select
                      value={newInvoice.payment_method}
                      onChange={(e) => setNewInvoice({...newInvoice, payment_method: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="cash">Espèces</option>
                      <option value="card">Carte bancaire</option>
                      <option value="check">Chèque</option>
                      <option value="insurance">Assurance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date d'échéance</label>
                  <input
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice({...newInvoice, due_date: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Récapitulatif</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coût médicaments:</span>
                      <span className="font-medium">{(newInvoice.medication_cost || 0).toFixed(2)} €</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais additionnels:</span>
                      <span className="font-medium">{(newInvoice.additional_fees || 0).toFixed(2)} €</span>
                    </div>
                    
                    <div className="flex justify-between text-green-600">
                      <span>Remboursement:</span>
                      <span className="font-medium">- {(newInvoice.remboursement || 0).toFixed(2)} €</span>
                    </div>
                    
                    <hr className="my-2" />
                    
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total à payer:</span>
                      <span className="text-emerald-600">
                        {(
                          (newInvoice.medication_cost || 0) + 
                          (newInvoice.additional_fees || 0) - 
                          (newInvoice.remboursement || 0)
                        ).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowCreateInvoice(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  
                  <button
                    onClick={handleCreateInvoice}
                    disabled={loading || !newInvoice.consultation_id}
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Création...' : 'Créer la facture'}
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