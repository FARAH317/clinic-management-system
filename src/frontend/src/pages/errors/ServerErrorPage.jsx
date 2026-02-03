import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Server, RefreshCw, ArrowLeft, Home, AlertTriangle } from 'lucide-react';

function ServerErrorPage() {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Server className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">500</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Erreur serveur
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Une erreur inattendue s'est produite sur le serveur. Nos équipes techniques ont été notifiées.
        </p>

        {/* Suggestions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-red-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Que faire maintenant ?
          </h3>
          <ul className="text-left space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Actualisez la page pour réessayer
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Revenez plus tard, le problème pourrait être résolu
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Contactez le support si le problème persiste
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Actualiser la page
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à la page précédente
          </button>

          <Link
            to="/"
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Aller à l'accueil
          </Link>
        </div>

        {/* Technical Info */}
        <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800 mb-1">
                Informations techniques
              </p>
              <p className="text-sm text-gray-600">
                Code d'erreur: 500 Internal Server Error
              </p>
              <p className="text-sm text-gray-600">
                Timestamp: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServerErrorPage;
