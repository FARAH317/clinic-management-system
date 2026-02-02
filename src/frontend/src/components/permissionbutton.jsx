import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { hasPermission } from '../utils/rolePermissions';
import { Lock } from 'lucide-react';

/**
 * Bouton qui se désactive automatiquement si l'utilisateur n'a pas les permissions
 * @param {Object} props
 * @param {string} props.module - Module concerné
 * @param {string} props.action - Action requise (create, edit, delete)
 * @param {function} props.onClick - Fonction au clic
 * @param {JSX.Element} props.children - Contenu du bouton
 * @param {string} props.className - Classes CSS additionnelles
 * @param {boolean} props.showTooltip - Afficher une info-bulle si pas de permission
 */
export default function PermissionButton({ 
  module, 
  action = 'view', 
  onClick, 
  children, 
  className = '',
  showTooltip = true,
  ...props 
}) {
  const { user } = useContext(AuthContext);
  const hasAccess = hasPermission(user?.role, module, action);

  if (!hasAccess && showTooltip) {
    return (
      <div className="relative group inline-block">
        <button
          disabled
          className={`${className} opacity-50 cursor-not-allowed relative`}
          {...props}
        >
          {children}
          <Lock className="w-4 h-4 absolute -top-1 -right-1 text-red-400" />
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">
          Permission refusée
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null; // Cache complètement le bouton
  }

  return (
    <button
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Hook personnalisé pour vérifier les permissions
 */
export function usePermission(module, action = 'view') {
  const { user } = useContext(AuthContext);
  return hasPermission(user?.role, module, action);
}

/**
 * Composant pour afficher du contenu conditionnel selon les permissions
 */
export function PermissionGuard({ module, action = 'view', children, fallback = null }) {
  const { user } = useContext(AuthContext);
  const hasAccess = hasPermission(user?.role, module, action);

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}