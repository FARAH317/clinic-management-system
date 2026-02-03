import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { hasPermission } from '../utils/rolePermissions';

/**
 * Composant pour protéger les routes nécessitant une authentification
 * Compatible avec votre AuthContext existant et gestion des rôles
 */
export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Redirige vers login si non connecté
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Détermine le module basé sur le chemin
  const path = location.pathname;
  let module = 'dashboard'; // default

  if (path.includes('/patients')) module = 'patients';
  else if (path.includes('/doctors')) module = 'doctors';
  else if (path.includes('/appointments')) module = 'appointments';
  else if (path.includes('/prescriptions')) module = 'prescriptions';
  else if (path.includes('/medicines')) module = 'medicines';
  else if (path.includes('/billing')) module = 'billing';
  else if (path.includes('/activity')) module = 'activity';

  // Vérifie les permissions
  if (!hasPermission(user.role, module, 'view')) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Accès refusé</h2>
            <p className="text-gray-300 mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Autorise l'accès
  return children;
}
