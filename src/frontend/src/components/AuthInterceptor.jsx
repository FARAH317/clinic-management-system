import { useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Composant pour intercepter les appels API et gérer automatiquement
 * la redirection vers login quand le token expire (401)
 * ⚠️ IMPORTANT: N'intercepte PAS les requêtes de login elles-mêmes
 */
export default function AuthInterceptor({ children }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isRedirecting = useRef(false);

  useEffect(() => {
    // Sauvegarder la fonction fetch originale
    const originalFetch = window.fetch;

    // Fonction pour intercepter les réponses fetch
    const interceptFetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // Si on reçoit une 401 Unauthorized
        if (response.status === 401) {
          // Extraire l'URL de manière sûre
          let url = '';
          if (typeof args[0] === 'string') {
            url = args[0];
          } else if (args[0] instanceof Request) {
            url = args[0].url;
          } else if (args[0]?.url) {
            url = args[0].url;
          }
          
          // ⚠️ NE PAS intercepter si c'est une requête de login
          const isLoginRequest = url.includes('/auth/login') || 
                                 url.includes('/api/auth/login') ||
                                 url.includes('login');
          
          if (isLoginRequest) {
            // Pour les requêtes de login, laisser passer le 401
            console.log('❌ Échec de connexion : identifiants invalides');
            return response;
          }

          // Pour toutes les autres requêtes avec 401, déconnecter (une seule fois)
          if (!isRedirecting.current) {
            isRedirecting.current = true;
            console.log('🔒 Token expiré, redirection vers login...');

            // Déconnexion automatique
            logout();

            // Redirection vers login avec message
            setTimeout(() => {
              navigate('/admin/login', {
                state: {
                  message: 'Votre session a expiré. Veuillez vous reconnecter.',
                  from: window.location.pathname
                },
                replace: true
              });
              isRedirecting.current = false;
            }, 100);
          }

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
      isRedirecting.current = false;
    };
  }, [logout, navigate]);

  return children;
}