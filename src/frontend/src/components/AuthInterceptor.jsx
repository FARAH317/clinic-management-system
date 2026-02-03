import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Composant pour intercepter les appels API et gérer automatiquement
 * la redirection vers login quand le token expire (401)
 */
export default function AuthInterceptor({ children }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Sauvegarder la fonction fetch originale
    const originalFetch = window.fetch;

    // Fonction pour intercepter les réponses fetch
    const interceptFetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // Si on reçoit une 401 Unauthorized
        if (response.status === 401) {
          console.log('Token expiré, redirection vers login...');

          // Déconnexion automatique
          logout();

          // Redirection vers login avec message
          navigate('/admin/login', {
            state: {
              message: 'Votre session a expiré. Veuillez vous reconnecter.',
              from: window.location.pathname
            },
            replace: true
          });

          // Retourner une réponse d'erreur pour arrêter le traitement
          return new Response(JSON.stringify({
            success: false,
            error: 'Session expirée'
          }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return response;
      } catch (error) {
        console.error('Erreur réseau:', error);
        throw error;
      }
    };

    // Remplacer la fonction fetch globale
    window.fetch = interceptFetch;

    // Cleanup: restaurer la fonction fetch originale
    return () => {
      window.fetch = originalFetch;
    };
  }, [logout, navigate]);

  return children;
}
