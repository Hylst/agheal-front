import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/integrations/api/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Page intermédiaire — reçoit le JWT depuis le callback Google OAuth
 * URL attendue : /auth/google/callback?token=<jwt>
 */
export default function GoogleCallback() {
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const { loadUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const error  = params.get('error');

    if (error || !token) {
      // Raison d'échec renvoyée par le backend
      const reason = params.get('reason') ?? 'unknown';
      toast({
        variant: 'destructive',
        title: 'Connexion Google échouée',
        description: `Erreur : ${reason}. Réessayez ou utilisez email/mot de passe.`,
      });
      navigate('/login');
      return;
    }

    // Stocke le JWT et charge le profil comme une connexion classique
    apiClient.setToken(token);
    loadUser().then(() => {
      navigate('/dashboard');
    }).catch(() => {
      toast({
        variant: 'destructive',
        title: 'Erreur de chargement',
        description: 'Connexion Google réussie mais profil introuvable.',
      });
      navigate('/login');
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="text-center space-y-4">
        {/* Spinner simple pendant la redirection */}
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Connexion avec Google en cours…</p>
      </div>
    </div>
  );
}
