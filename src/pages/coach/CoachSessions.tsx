import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
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

type Session = {
  id: number;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  min_people: number;
  max_people: number;
  status: string;
  session_types: { name: string } | null;
  locations: { name: string } | null;
  registrations: { id: number; profiles: { first_name: string; last_name: string } }[];
};

export default function CoachSessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await apiClient.getSessions({ status: 'all', include: 'registrations' });

      if (error) throw error;
      // getSessions retourne { sessions: [] }
      setSessions((data as any)?.sessions || data || []);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les séances',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await apiClient.deleteSession(deleteId);

      if (error) throw error;

      toast({
        title: 'Séance supprimée',
        description: 'La séance a été supprimée avec succès',
      });
      fetchSessions();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la séance',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'published') return <Badge className="bg-green-600">Publiée</Badge>;
    if (status === 'draft') return <Badge variant="secondary">Brouillon</Badge>;
    if (status === 'cancelled') return <Badge variant="destructive">Annulée</Badge>;
    return null;
  };

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
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-foreground mb-2">Mes séances</h1>
            <p className="text-muted-foreground">Gérez vos séances et inscriptions</p>
          </div>
          <Button onClick={() => navigate('/coach/sessions/new')} className="gap-2">
            <Plus className="w-4 h-4" />
            Créer une séance
          </Button>
        </div>

        {sessions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Aucune séance créée</p>
            <Button onClick={() => navigate('/coach/sessions/new')}>Créer ma première séance</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold text-foreground">{session.title}</h3>
                      {getStatusBadge(session.status)}
                      {session.session_types && (
                        <Badge variant="outline">{session.session_types.name}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(session.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{session.start_time} - {session.end_time}</span>
                      </div>
                      {session.locations && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{session.locations.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {session.registrations.length} / {session.max_people} inscrits
                        </span>
                      </div>
                    </div>
                    {session.registrations.length > 0 && (
                      <div className="text-sm">
                        <p className="font-medium text-foreground mb-1">Participants :</p>
                        <p className="text-muted-foreground">
                          {session.registrations
                            .map((r) => `${r.profiles.first_name} ${r.profiles.last_name}`)
                            .join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/coach/sessions/${session.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteId(session.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette séance ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Les participants inscrits seront également désinscrits.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
