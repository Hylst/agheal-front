import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type AppRole = 'admin' | 'coach' | 'adherent';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  roles?: AppRole[];
}

interface AuthContextType {
  session: { access_token: string } | null;
  user: User | null;
  role: AppRole | null;
  roles: AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si un token existe au démarrage
    const token = localStorage.getItem('access_token');
    if (token) {
      setSession({ access_token: token });
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const applyUserData = (userData: User) => {
    setUser(userData);
    const userRoles: AppRole[] = (userData.roles as AppRole[]) || ['adherent'];
    setRoles(userRoles);
    if (userRoles.includes('admin')) setRole('admin');
    else if (userRoles.includes('coach')) setRole('coach');
    else setRole('adherent');
  };

  const fetchCurrentUser = async () => {
    try {
      const { data, error } = await apiClient.getMyProfile();
      if (error || !data) {
        // Token invalide, on nettoie
        localStorage.removeItem('access_token');
        setSession(null);
        setUser(null);
        setRole(null);
        setRoles([]);
      } else {
        // /profiles/me retourne directement les données du profil
        const userData = data.user || data;
        applyUserData(userData);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await apiClient.login(email, password);

      if (error) throw new Error(error.message);
      if (!data) throw new Error('Réponse invalide du serveur');

      apiClient.setToken(data.access_token);
      setSession({ access_token: data.access_token });
      applyUserData(data.user);

      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue !',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error.message || 'Email ou mot de passe incorrect',
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await apiClient.signup(email, password, firstName, lastName);

      if (error) throw new Error(error.message);

      toast({
        title: 'Inscription réussie',
        description: 'Vous pouvez maintenant vous connecter',
      });

      navigate('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur d\'inscription',
        description: error.message || 'Une erreur est survenue',
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    toast({
      variant: 'destructive',
      title: 'Non disponible',
      description: 'La connexion Google n\'est pas encore implémentée en local',
    });
  };

  const signOut = async () => {
    try {
      apiClient.setToken(null);
      setSession(null);
      setUser(null);
      setRole(null);
      setRoles([]);
      navigate('/login');
      toast({
        title: 'Déconnexion',
        description: 'À bientôt !',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, role, roles, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
