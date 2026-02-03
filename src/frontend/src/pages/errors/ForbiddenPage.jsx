import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home, Lock, AlertTriangle } from 'lucide-react';

function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">403</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Accès refusé
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>

        {/* Access Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-red-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-red-500" />
            Raisons possibles
          </h3>
          <ul className="text-left space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Vous n'avez pas les droits d'accès requis
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Votre session a expiré
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Vous essayez d'accéder à une ressource protégée
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à la page précédente
          </button>

          <Link
            to="/"
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Aller à l'accueil
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-yellow-800 mb-1">
                Besoin d'aide ?
              </p>
              <p className="text-sm text-yellow-700">
                Contactez votre administrateur système pour obtenir les permissions nécessaires.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForbiddenPage;
