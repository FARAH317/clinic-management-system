import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, FileText, TrendingUp, User, Weight, Ruler, Activity, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';

const API_URLS = {
  billing: 'http://localhost:5007/api',
  patient: 'http://localhost:5002/api',
  doctor: 'http://localhost:5006/api',
  appointment: 'http://localhost:5003/api'
};

export default function BillingAndIMC() {
  const [activeTab, setActiveTab] = useState('imc');
  const [loading, setLoading] = useState(false);
  
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
  const [invoices, setInvoices] = useState([]);
  const [invoiceStats, setInvoiceStats] = useState({});
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
  
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (activeTab === 'facturation') {
      fetchInvoices();
      fetchInvoiceStats();
    }
    fetchPatients();
    fetchDoctors();
    fetchAppointments();
  }, [activeTab]);

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

  const fetchInvoiceStats = async () => {
    try {
      const res = await fetch(`${API_URLS.billing}/invoices/stats`);
      const data = await res.json();
      if (data.success) setInvoiceStats(data.stats);
    } catch (error) {
      console.error('Erreur:', error);
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
        
        // Réinitialiser le formulaire
        setImcData({ weight: '', height: '', patient_id: '', notes: '' });
        
        // Recharger l'historique si patient sélectionné
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
    if (!newInvoice.consultation_id || !newInvoice.patient_id || !newInvoice.doctor_id) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URLS.billing}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Facture créée avec succès!');
        setShowCreateInvoice(false);
        setNewInvoice({
          consultation_id: '', patient_id: '', doctor_id: '',
          medication_cost: 0, additional_fees: 0, remboursement: 0,
          payment_method: 'cash', due_date: ''
        });
        fetchInvoices();
        fetchInvoiceStats();
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      alert('Erreur de création de facture');
      console.error(error);
    } finally {
      setLoading(false);
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
        fetchInvoiceStats();
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
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En attente' },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Payée' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Annulée' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Facturation & IMC</h1>
        <p className="text-gray-600">Gestion des factures et calcul de l'Indice de Masse Corporelle</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setActiveTab('imc')}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition ${
            activeTab === 'imc'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 shadow hover:bg-indigo-50'
          }`}
        >
          <Calculator className="w-5 h-5 mr-2" />
          Calcul IMC
        </button>
        
        <button
          onClick={() => setActiveTab('facturation')}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition ${
            activeTab === 'facturation'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 shadow hover:bg-indigo-50'
          }`}
        >
          <DollarSign className="w-5 h-5 mr-2" />
          Facturation
        </button>
      </div>

      {/* Contenu IMC */}
      {activeTab === 'imc' && (
        <div className="space-y-6">
          {/* Calculateur IMC */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Calculator className="w-6 h-6 mr-2 text-indigo-600" />
              Calculateur d'IMC
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Weight className="w-4 h-4 inline mr-1" />
                  Poids (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={imcData.weight}
                  onChange={(e) => setImcData({...imcData, weight: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="70.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Ruler className="w-4 h-4 inline mr-1" />
                  Taille (cm) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={imcData.height}
                  onChange={(e) => setImcData({...imcData, height: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="175"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Patient (optionnel)
                </label>
                <select
                  value={imcData.patient_id}
                  onChange={(e) => {
                    setImcData({...imcData, patient_id: e.target.value});
                    if (e.target.value) fetchIMCHistory(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Notes additionnelles"
                />
              </div>
            </div>

            <button
              onClick={calculateIMC}
              disabled={loading}
              className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              <Calculator className="w-5 h-5 mr-2" />
              {loading ? 'Calcul en cours...' : 'Calculer l\'IMC'}
            </button>
          </div>

          {/* Résultat IMC */}
          {imcResult && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Résultat</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">IMC</p>
                  <p className="text-3xl font-bold text-indigo-600">{imcResult.bmi}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Poids</p>
                  <p className="text-3xl font-bold text-green-600">{imcResult.weight} kg</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Taille</p>
                  <p className="text-3xl font-bold text-purple-600">{imcResult.height} cm</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`inline-block px-4 py-2 rounded-full text-lg font-semibold ${getIMCColor(imcResult.category)}`}>
                  {imcResult.category}
                </span>
              </div>
            </div>
          )}

          {/* Historique IMC */}
          {imcHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Historique IMC</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poids</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taille</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IMC</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
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

      {/* Contenu Facturation */}
      {activeTab === 'facturation' && (
        <div className="space-y-6">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Factures</p>
                  <p className="text-3xl font-bold text-gray-800">{invoiceStats.total_invoices || 0}</p>
                </div>
                <FileText className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Revenus Totaux</p>
                  <p className="text-3xl font-bold text-green-600">{invoiceStats.total_revenue || 0}€</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">En Attente</p>
                  <p className="text-3xl font-bold text-yellow-600">{invoiceStats.pending || 0}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Montant Impayé</p>
                  <p className="text-3xl font-bold text-red-600">{invoiceStats.total_pending || 0}€</p>
                </div>
                <DollarSign className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </div>
          </div>

          {/* Bouton Créer Facture */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateInvoice(true)}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <FileText className="w-5 h-5 mr-2" />
              Créer une facture
            </button>
          </div>

          {/* Liste des factures */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remboursement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reste à payer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map(invoice => {
                    const statusInfo = getStatusBadge(invoice.status);
                    const StatusIcon = statusInfo.icon;
                    
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
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {invoice.status === 'pending' && (
                            <button
                              onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                              className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
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
        </div>
      )}

      {/* Modal Créer Facture */}
      {showCreateInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Créer une Facture</h2>
                <button onClick={() => setShowCreateInvoice(false)} className="text-gray-500 hover:text-gray-700">
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rendez-vous *</label>
                  <select
                    value={newInvoice.consultation_id}
                    onChange={(e) => {
                      const apt = appointments.find(a => a.id === parseInt(e.target.value));
                      setNewInvoice({
                        ...newInvoice,
                        consultation_id: e.target.value,
                        patient_id: apt?.patient_id || '',
                        doctor_id: apt?.doctor_id || ''
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Sélectionner un rendez-vous</option>
                    {appointments.map(apt => (
                      <option key={apt.id} value={apt.id}>
                        RDV #{apt.id} - {apt.doctor_name} - {new Date(apt.appointment_date).toLocaleDateString('fr-FR')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coût médicaments (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newInvoice.medication_cost}
                      onChange={(e) => setNewInvoice({...newInvoice, medication_cost: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frais additionnels (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newInvoice.additional_fees}
                      onChange={(e) => setNewInvoice({...newInvoice, additional_fees: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Méthode de paiement</label>
                    <select
                      value={newInvoice.payment_method}
                      onChange={(e) => setNewInvoice({ ...newInvoice, payment_method: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="cash">Espèces</option>
                      <option value="card">Carte bancaire</option>
                      <option value="insurance">Assurance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date limite de paiement</label>
                  <input
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Récapitulatif Montants */}
                <div className="bg-gray-50 p-4 rounded-lg border mt-4">
                  <h3 className="font-semibold mb-2 text-gray-700">Récapitulatif</h3>
                  <p className="text-sm text-gray-600">Coût médicaments : {newInvoice.medication_cost}€</p>
                  <p className="text-sm text-gray-600">Frais additionnels : {newInvoice.additional_fees}€</p>
                  <p className="text-sm text-green-600">Remboursement : -{newInvoice.remboursement}€</p>

                  <hr className="my-2" />

                  <p className="font-bold text-gray-900">
                    Total :{" "}
                    {(newInvoice.medication_cost + newInvoice.additional_fees - newInvoice.remboursement).toFixed(2)}€
                  </p>
                </div>

                {/* Boutons */}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowCreateInvoice(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Annuler
                  </button>

                  <button
                    onClick={handleCreateInvoice}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Créer la facture
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
