import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, UserCheck, UserX, Search, ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  statut_compte: string | null;
  user_roles: { role: string }[];
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionUser, setActionUser] = useState<{ id: string; action: string; role?: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await apiClient.getUsers();
      if (error) throw new Error(error.message);
      // getUsers retourne { users: [] }
      setUsers((data as any)?.users || data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string | null) => {
    try {
      const newStatus = currentStatus === 'actif' ? 'bloque' : 'actif';
      const { error } = await apiClient.toggleUserStatus(userId, newStatus as 'actif' | 'bloque');
      if (error) throw new Error(error.message);

      toast({
        title: 'Statut modifié',
        description: `Le compte a été ${newStatus === 'actif' ? 'activé' : 'bloqué'}`,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut',
        variant: 'destructive',
      });
    } finally {
      setActionUser(null);
    }
  };

  const handleToggleRole = async (userId: string, role: 'admin' | 'coach' | 'adherent', hasRole: boolean) => {
    // Sécurité : empêche de se retirer son propre rôle admin depuis l'UI
    if (userId === currentUser?.id && role === 'admin' && hasRole) {
      toast({
        title: 'Action interdite',
        description: 'Vous ne pouvez pas vous retirer votre propre rôle Administrateur.',
        variant: 'destructive',
      });
      return;
    }

    // Ouvre la modale de confirmation
    setActionUser({
      id: userId,
      action: hasRole ? 'remove_role' : 'add_role',
      role: role
    });
  };

  const confirmToggleRole = async (userId: string, role: string, isRemoval: boolean) => {
    try {
      if (isRemoval) {
        const { error } = await apiClient.removeUserRole(userId, role as any);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await apiClient.addUserRole(userId, role as any);
        if (error) throw new Error(error.message);
      }

      toast({
        title: 'Rôle modifié',
        description: `Le rôle ${role} a été ${isRemoval ? 'retiré' : 'ajouté'}`,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le rôle',
        variant: 'destructive',
      });
    } finally {
      setActionUser(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || user.phone?.includes(search);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au Dashboard
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les comptes, rôles et statuts</p>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="Rechercher par nom ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
        </Card>

        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const roles = user.user_roles.map((r) => r.role);
            const isAdmin = roles.includes('admin');
            const isCoach = roles.includes('coach');
            const isAdherent = roles.includes('adherent');
            const isBlocked = user.statut_compte === 'bloque';

            return (
              <Card key={user.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold text-foreground">
                        {user.first_name} {user.last_name}
                      </h3>
                      {isBlocked ? (
                        <Badge variant="destructive">Bloqué</Badge>
                      ) : (
                        <Badge className="bg-green-600">Actif</Badge>
                      )}
                      {isAdmin && <Badge className="bg-purple-600">Admin</Badge>}
                      {isCoach && <Badge className="bg-blue-600">Coach</Badge>}
                      {isAdherent && <Badge variant="outline">Adhérent</Badge>}
                    </div>
                    {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 sm:ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActionUser({ id: user.id, action: isBlocked ? 'activate' : 'block' })}
                      disabled={user.id === currentUser?.id}
                      title={user.id === currentUser?.id ? "Vous ne pouvez pas bloquer votre propre compte" : ""}
                    >
                      {isBlocked ? (
                        <><UserCheck className="w-4 h-4 mr-1" />Activer</>
                      ) : (
                        <><UserX className="w-4 h-4 mr-1" />Bloquer</>
                      )}
                    </Button>
                    <Button
                      variant={isAdmin ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleRole(user.id, 'admin', isAdmin)}
                      disabled={user.id === currentUser?.id}
                      title={user.id === currentUser?.id ? "Vous ne pouvez pas modifier votre propre rôle Admin" : ""}
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      Admin
                    </Button>
                    <Button
                      variant={isCoach ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleRole(user.id, 'coach', isCoach)}
                    >
                      Coach
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <AlertDialog open={!!actionUser} onOpenChange={() => setActionUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionUser?.action === 'block' && 'Bloquer ce compte ?'}
                {actionUser?.action === 'activate' && 'Activer ce compte ?'}
                {actionUser?.action === 'add_role' && 'Ajouter un rôle ?'}
                {actionUser?.action === 'remove_role' && 'Retirer un rôle ?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionUser?.action === 'block' && "L'utilisateur ne pourra plus s'inscrire aux séances."}
                {actionUser?.action === 'activate' && "L'utilisateur pourra à nouveau s'inscrire aux séances."}
                {actionUser?.action === 'add_role' && `Voulez-vous vraiment ajouter le rôle ${actionUser.role} à cet utilisateur ?`}
                {actionUser?.action === 'remove_role' && `Voulez-vous vraiment retirer le rôle ${actionUser.role} à cet utilisateur ?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (actionUser) {
                    const user = users.find((u) => u.id === actionUser.id);
                    if (user) {
                      if (actionUser.action === 'add_role' || actionUser.action === 'remove_role') {
                        confirmToggleRole(actionUser.id, actionUser.role!, actionUser.action === 'remove_role');
                      } else {
                        handleToggleStatus(actionUser.id, user.statut_compte);
                      }
                    }
                  }
                }}
              >
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
