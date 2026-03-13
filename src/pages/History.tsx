import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type Registration = {
  id: number;
  created_at: string;
  sessions: {
    id: number;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    session_types: { name: string } | null;
    locations: { name: string } | null;
  };
};

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const fetchRegistrations = async () => {
    if (!user) return;

    try {
      const { data, error } = await apiClient.getMyRegistrations();
      if (error) throw new Error(error.message);
      // getMyRegistrations retourne { registrations: [] }
      setRegistrations((data as any)?.registrations || data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: "Impossible de charger l'historique",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isPast = (date: string) => {
    return new Date(date) < new Date();
  };

  const upcomingSessions = registrations.filter((reg) => !isPast(reg.sessions.date));
  const pastSessions = registrations.filter((reg) => isPast(reg.sessions.date));

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
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
      <div className="max-w-5xl mx-auto p-4 sm:p-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au Dashboard
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Mes inscriptions</h1>
          <p className="text-muted-foreground">Historique et séances à venir</p>
        </div>

        {registrations.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Vous n'avez aucune inscription pour le moment</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {upcomingSessions.length > 0 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Séances à venir</h2>
                <div className="space-y-4">
                  {upcomingSessions.map((registration) => (
                    <Card key={registration.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-foreground">
                              {registration.sessions.title}
                            </h3>
                            <Badge className="bg-blue-600">À venir</Badge>
                            {registration.sessions.session_types && (
                              <Badge variant="outline">
                                {registration.sessions.session_types.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(registration.sessions.date), 'EEEE d MMMM yyyy', { locale: fr })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {registration.sessions.start_time} - {registration.sessions.end_time}
                              </span>
                            </div>
                            {registration.sessions.locations && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{registration.sessions.locations.name}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Inscrit le {format(new Date(registration.created_at), 'd MMMM yyyy à HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pastSessions.length > 0 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Séances passées</h2>
                <div className="space-y-4">
                  {pastSessions.map((registration) => (
                    <Card key={registration.id} className="p-4 sm:p-6 opacity-75">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-foreground">
                              {registration.sessions.title}
                            </h3>
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Terminée
                            </Badge>
                            {registration.sessions.session_types && (
                              <Badge variant="outline">
                                {registration.sessions.session_types.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(registration.sessions.date), 'EEEE d MMMM yyyy', { locale: fr })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {registration.sessions.start_time} - {registration.sessions.end_time}
                              </span>
                            </div>
                            {registration.sessions.locations && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{registration.sessions.locations.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
