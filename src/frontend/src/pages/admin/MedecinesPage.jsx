import React, { useState, useEffect } from 'react';
import { Pill, Search, Download, Edit, Trash2, Plus, X, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5005/api';

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    category: '',
    manufacturer: '',
    dosage_form: '',
    strength: '',
    stock_quantity: 0,
    reorder_level: 10,
    unit_price: 0,
    expiry_date: '',
    description: ''
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/medicines?per_page=100`);
      const data = await res.json();
      if (data.success) {
        setMedicines(data.medicines);
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

  const handleAddMedicine = async () => {
    try {
      if (!newMedicine.name?.trim() || !newMedicine.category?.trim()) {
        alert('❌ Le nom et la catégorie sont obligatoires');
        return;
      }

      const medicineData = {
        ...newMedicine,
        name: newMedicine.name.trim(),
        category: newMedicine.category.trim(),
        manufacturer: newMedicine.manufacturer?.trim() || '',
        dosage_form: newMedicine.dosage_form?.trim() || '',
        strength: newMedicine.strength?.trim() || '',
        stock_quantity: parseInt(newMedicine.stock_quantity) || 0,
        reorder_level: parseInt(newMedicine.reorder_level) || 10,
        unit_price: parseFloat(newMedicine.unit_price) || 0,
        expiry_date: newMedicine.expiry_date || null,
        description: newMedicine.description?.trim() || ''
      };

      const response = await fetch(`${API_URL}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicineData)
      });

      const result = await response.json();

      if (result.success) {
        await logActivity('create', 'medicine', result.medicine?.id || 'N/A', 
          `Médicament "${newMedicine.name}" (${newMedicine.category}) ajouté - Stock: ${newMedicine.stock_quantity}`);

        alert('✅ Médicament ajouté avec succès !');
        setShowAddModal(false);
        setNewMedicine({
          name: '', category: '', manufacturer: '', dosage_form: '',
          strength: '', stock_quantity: 0, reorder_level: 10,
          unit_price: 0, expiry_date: '', description: ''
        });
        fetchMedicines();
      } else {
        alert('❌ ' + (result.error || 'Erreur lors de l\'ajout'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de connexion au serveur');
    }
  };

  const handleEditMedicine = async () => {
    try {
      if (!selectedMedicine.name?.trim() || !selectedMedicine.category?.trim()) {
        alert('❌ Le nom et la catégorie sont obligatoires');
        return;
      }

      const medicineData = {
        ...selectedMedicine,
        name: selectedMedicine.name.trim(),
        category: selectedMedicine.category.trim(),
        stock_quantity: parseInt(selectedMedicine.stock_quantity) || 0,
        reorder_level: parseInt(selectedMedicine.reorder_level) || 10,
        unit_price: parseFloat(selectedMedicine.unit_price) || 0
      };

      const response = await fetch(`${API_URL}/medicines/${selectedMedicine.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicineData)
      });

      const result = await response.json();

      if (result.success) {
        await logActivity('update', 'medicine', selectedMedicine.id, 
          `Médicament "${selectedMedicine.name}" modifié - Stock: ${selectedMedicine.stock_quantity}`);
        alert('✅ Médicament modifié avec succès !');
        setShowEditModal(false);
        setSelectedMedicine(null);
        fetchMedicines();
      } else {
        alert('❌ ' + (result.error || 'Erreur lors de la modification'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de connexion au serveur');
    }
  };

  const handleDeleteMedicine = async (medicine) => {
    if (!window.confirm(`⚠️ Êtes-vous sûr de vouloir supprimer le médicament "${medicine.name}" ?\n\nCette action est irréversible.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/medicines/${medicine.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        await logActivity('delete', 'medicine', medicine.id, 
          `Médicament "${medicine.name}" (${medicine.category}) supprimé`);
        alert('✅ Médicament supprimé avec succès !');
        fetchMedicines();
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
    a.download = `medicaments_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredMedicines = medicines.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatusBadge = (status) => {
    const configs = {
      in_stock: { class: 'bg-green-100 text-green-700', label: 'En stock' },
      low_stock: { class: 'bg-yellow-100 text-yellow-700', label: 'Stock faible' },
      out_of_stock: { class: 'bg-red-100 text-red-700', label: 'Rupture' }
    };
    return configs[status] || configs.in_stock;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Médicaments</h1>
        <p className="text-gray-600">Gérez votre inventaire de médicaments</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un médicament..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => exportToCSV(medicines)}
              className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Médicament
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Médicaments</p>
          <p className="text-3xl font-bold text-gray-900">{medicines.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">En Stock</p>
          <p className="text-3xl font-bold text-green-600">
            {medicines.filter(m => m.stock_status === 'in_stock').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Stock Faible</p>
          <p className="text-3xl font-bold text-yellow-600">
            {medicines.filter(m => m.stock_status === 'low_stock').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Rupture</p>
          <p className="text-3xl font-bold text-red-600">
            {medicines.filter(m => m.stock_status === 'out_of_stock').length}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {medicines.filter(m => m.stock_status === 'low_stock' || m.stock_status === 'out_of_stock').length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-semibold mb-1">Alerte Stock</h3>
            <p className="text-red-700 text-sm">
              {medicines.filter(m => m.stock_status === 'low_stock' || m.stock_status === 'out_of_stock').length} médicament(s) nécessitent une attention immédiate
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des médicaments...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Médicament
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Forme
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Prix
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
                {filteredMedicines.map((med) => {
                  const statusBadge = getStockStatusBadge(med.stock_status);
                  return (
                    <tr key={med.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center mr-3">
                            <Pill className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{med.name}</div>
                            <div className="text-sm text-gray-500">{med.manufacturer || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{med.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{med.dosage_form}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{med.stock_quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{med.unit_price}€</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedMedicine(med);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedicine(med)}
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
                <h2 className="text-2xl font-bold text-gray-900">Ajouter un Médicament</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                      placeholder="Paracétamol, Aspirine, etc."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                    <input
                      type="text"
                      value={newMedicine.category}
                      onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
                      placeholder="Analgésique, Antibiotique, etc."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabricant</label>
                    <input
                      type="text"
                      value={newMedicine.manufacturer}
                      onChange={(e) => setNewMedicine({...newMedicine, manufacturer: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Forme</label>
                    <input
                      type="text"
                      value={newMedicine.dosage_form}
                      onChange={(e) => setNewMedicine({...newMedicine, dosage_form: e.target.value})}
                      placeholder="Comprimé, Gélule, Sirop, etc."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                    <input
                      type="text"
                      value={newMedicine.strength}
                      onChange={(e) => setNewMedicine({...newMedicine, strength: e.target.value})}
                      placeholder="500mg, 10ml, etc."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                    <input
                      type="number"
                      value={newMedicine.stock_quantity}
                      onChange={(e) => setNewMedicine({...newMedicine, stock_quantity: e.target.value})}
                      min="0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seuil d'alerte</label>
                    <input
                      type="number"
                      value={newMedicine.reorder_level}
                      onChange={(e) => setNewMedicine({...newMedicine, reorder_level: e.target.value})}
                      min="0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prix unitaire (€)</label>
                    <input
                      type="number"
                      value={newMedicine.unit_price}
                      onChange={(e) => setNewMedicine({...newMedicine, unit_price: e.target.value})}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration</label>
                    <input
                      type="date"
                      value={newMedicine.expiry_date}
                      onChange={(e) => setNewMedicine({...newMedicine, expiry_date: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newMedicine.description}
                    onChange={(e) => setNewMedicine({...newMedicine, description: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    onClick={handleAddMedicine}
                    className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier */}
      {showEditModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Modifier le Médicament</h2>
                <button onClick={() => {setShowEditModal(false); setSelectedMedicine(null);}} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={selectedMedicine.name}
                      onChange={(e) => setSelectedMedicine({...selectedMedicine, name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                    <input
                      type="text"
                      value={selectedMedicine.category}
                      onChange={(e) => setSelectedMedicine({...selectedMedicine, category: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabricant</label>
                    <input
                      type="text"
                      value={selectedMedicine.manufacturer || ''}
                      onChange={(e) => setSelectedMedicine({...selectedMedicine, manufacturer: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Forme</label>
                    <input
                      type="text"
                      value={selectedMedicine.dosage_form || ''}
                      onChange={(e) => setSelectedMedicine({...selectedMedicine, dosage_form: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                    <input
                      type="text"
                      value={selectedMedicine.strength || ''}
                      onChange={(e) => setSelectedMedicine({...selectedMedicine, strength: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                    <input
                      type="number"
                      value={selectedMedicine.stock_quantity}
                      onChange={(e) => setSelectedMedicine({...selectedMedicine, stock_quantity: e.target.value})}
                      min="0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seuil d'alerte</label>
                    <input
                      type="number"
                      value={selectedMedicine.reorder_level}
                      onChange={(e) => setSelectedMedicine({...selectedMedicine, reorder_level: e.target.value})}
                      min="0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prix unitaire (€)</label>
                    <input
                      type="number"
                      value={selectedMedicine.unit_price}
                      onChange={(e) => setSelectedMedicine({...selectedMedicine, unit_price: e.target.value})}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration</label>
                    <input
                      type="date"
                      value={selectedMedicine.expiry_date?.split('T')[0] || ''}
                      onChange={(e) => setSelectedMedicine({...selectedMedicine, expiry_date: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={selectedMedicine.description || ''}
                    onChange={(e) => setSelectedMedicine({...selectedMedicine, description: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {setShowEditModal(false); setSelectedMedicine(null);}}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleEditMedicine}
                    className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
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