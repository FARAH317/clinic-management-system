import React, { useState, useEffect } from 'react';
import { History, Filter, X } from 'lucide-react';

export default function ActivityPage() {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activityFilters, setActivityFilters] = useState({
    actionType: '',
    user: '',
    entity: '',
    startDate: '',
    endDate: ''
  });
  const [activityPage, setActivityPage] = useState(1);
  const [activityPerPage] = useState(20);
  const [totalActivityLogs, setTotalActivityLogs] = useState(0);

  useEffect(() => {
    fetchActivityLogs();
  }, [activityPage, activityFilters]);

  const fetchActivityLogs = () => {
    try {
      setLoading(true);
      const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
      
      // Filtrer les logs
      let filtered = logs.filter(log => {
        if (activityFilters.actionType && log.action !== activityFilters.actionType) return false;
        if (activityFilters.entity && log.entity !== activityFilters.entity) return false;
        if (activityFilters.user && !log.user.toLowerCase().includes(activityFilters.user.toLowerCase())) return false;
        if (activityFilters.startDate && new Date(log.timestamp) < new Date(activityFilters.startDate)) return false;
        if (activityFilters.endDate && new Date(log.timestamp) > new Date(activityFilters.endDate)) return false;
        return true;
      });

      setTotalActivityLogs(filtered.length);
      
      // Paginer
      const startIndex = (activityPage - 1) * activityPerPage;
      const paginatedLogs = filtered.slice(startIndex, startIndex + activityPerPage);
      
      setActivityLogs(paginatedLogs);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setActivityFilters({
      actionType: '',
      user: '',
      entity: '',
      startDate: '',
      endDate: ''
    });
    setActivityPage(1);
  };

  const getActionBadge = (action) => {
    const badges = {
      create: { class: 'bg-green-100 text-green-800', label: 'Création', icon: '➕' },
      update: { class: 'bg-blue-100 text-blue-800', label: 'Modification', icon: '✏️' },
      delete: { class: 'bg-red-100 text-red-800', label: 'Suppression', icon: '🗑️' }
    };
    return badges[action] || { class: 'bg-gray-100 text-gray-800', label: action, icon: '📝' };
  };

  const getEntityLabel = (entity) => {
    const labels = {
      patient: { label: 'Patient', icon: '👤', color: 'text-indigo-600' },
      doctor: { label: 'Médecin', icon: '⚕️', color: 'text-green-600' },
      appointment: { label: 'Rendez-vous', icon: '📅', color: 'text-purple-600' },
      prescription: { label: 'Ordonnance', icon: '📋', color: 'text-pink-600' },
      medicine: { label: 'Médicament', icon: '💊', color: 'text-orange-600' },
      invoice: { label: 'Facture', icon: '💰', color: 'text-emerald-600' }
    };
    return labels[entity] || { label: entity, icon: '📄', color: 'text-gray-600' };
  };

  const totalPages = Math.ceil(totalActivityLogs / activityPerPage);

  // Stats
  const stats = {
    total: activityLogs.length,
    create: activityLogs.filter(log => log.action === 'create').length,
    update: activityLogs.filter(log => log.action === 'update').length,
    delete: activityLogs.filter(log => log.action === 'delete').length
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Historique des Activités</h1>
        <p className="text-gray-600">Consultez toutes les actions effectuées dans le système</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Activités</p>
          <p className="text-3xl font-bold text-gray-900">{totalActivityLogs}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Créations</p>
          <p className="text-3xl font-bold text-green-600">{stats.create}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Modifications</p>
          <p className="text-3xl font-bold text-blue-600">{stats.update}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Suppressions</p>
          <p className="text-3xl font-bold text-red-600">{stats.delete}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-cyan-600" />
            Filtres
          </h3>
          <button
            onClick={clearFilters}
            className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-4 h-4 mr-1" />
            Réinitialiser
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type d'action</label>
            <select
              value={activityFilters.actionType}
              onChange={(e) => {
                setActivityFilters({...activityFilters, actionType: e.target.value});
                setActivityPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Tous</option>
              <option value="create">Création</option>
              <option value="update">Modification</option>
              <option value="delete">Suppression</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entité</label>
            <select
              value={activityFilters.entity}
              onChange={(e) => {
                setActivityFilters({...activityFilters, entity: e.target.value});
                setActivityPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Toutes</option>
              <option value="patient">Patient</option>
              <option value="doctor">Médecin</option>
              <option value="appointment">Rendez-vous</option>
              <option value="prescription">Ordonnance</option>
              <option value="medicine">Médicament</option>
              <option value="invoice">Facture</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Utilisateur</label>
            <input
              type="text"
              value={activityFilters.user}
              onChange={(e) => {
                setActivityFilters({...activityFilters, user: e.target.value});
                setActivityPage(1);
              }}
              placeholder="Rechercher..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
            <input
              type="date"
              value={activityFilters.startDate}
              onChange={(e) => {
                setActivityFilters({...activityFilters, startDate: e.target.value});
                setActivityPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
            <input
              type="date"
              value={activityFilters.endDate}
              onChange={(e) => {
                setActivityFilters({...activityFilters, endDate: e.target.value});
                setActivityPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement de l'historique...</p>
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
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Entité
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Détails
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <History className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium mb-1">Aucune activité enregistrée</p>
                      <p className="text-sm">Les actions effectuées apparaîtront ici</p>
                    </td>
                  </tr>
                ) : (
                  activityLogs.map((log, index) => {
                    const actionBadge = getActionBadge(log.action);
                    const entityInfo = getEntityLabel(log.entity);
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          <div className="font-medium">
                            {new Date(log.timestamp).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-medium text-xs mr-3">
                              {log.user[0]}
                            </div>
                            <span className="font-medium text-gray-900">{log.user}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${actionBadge.class}`}>
                            <span className="mr-1.5">{actionBadge.icon}</span>
                            {actionBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 ${entityInfo.color}`}>
                            <span className="mr-1.5">{entityInfo.icon}</span>
                            {entityInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                          {log.details}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-700">
                Affichage {((activityPage - 1) * activityPerPage) + 1} à {Math.min(activityPage * activityPerPage, totalActivityLogs)} sur {totalActivityLogs} activités
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                  disabled={activityPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Précédent
                </button>
                <span className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium">
                  {activityPage} / {totalPages}
                </span>
                <button
                  onClick={() => setActivityPage(p => Math.min(totalPages, p + 1))}
                  disabled={activityPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}