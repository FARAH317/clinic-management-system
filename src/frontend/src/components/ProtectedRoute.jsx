import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Composant pour protéger les routes nécessitant une authentification
 * Compatible avec votre AuthContext existant
 */
export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Redirige vers login si non connecté
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Vérifie si l'utilisateur est admin
  if (user.role !== 'admin') {
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