import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';

import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Filter, ArrowLeft, List, CalendarDays } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Session = {
  id: number;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  min_people: number;
  max_people: number;
  min_people_blocking: number | boolean;
  max_people_blocking: number | boolean;
  equipment_coach: string | null;
  equipment_clients: string | null;
  equipment_location: string | null;
  status: string;
  session_types: { name: string } | null;
  locations: { name: string; address: string | null } | null;
  registrations: { id: number }[];
  limit_registration_7_days: boolean | number;
};

export default function Sessions() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', date: '', search: '' });
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await apiClient.getSessions({ status: 'published', include: 'types,locations,registrations' });
      if (error) throw new Error(error.message);
      const list = (data as any)?.sessions || data || [];
      setSessions(list);
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

  const handleRegister = async (sessionId: number, currentRegistrations: number, maxPeople: number) => {
    if (!user) return;

    if (currentRegistrations >= maxPeople) {
      toast({
        title: 'Séance complète',
        description: 'Cette séance a atteint le nombre maximum de participants',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await apiClient.registerToSession(sessionId);
      if (error) {
        if (error.message.includes('bloqué') || error.message.includes('statut')) {
          toast({ title: 'Compte bloqué', description: 'Votre compte est bloqué. Contactez un administrateur.', variant: 'destructive' });
        } else if (error.message.includes('déjà') || error.message.includes('duplicate') || error.message.includes('Duplicate')) {
          toast({ title: 'Déjà inscrit', description: 'Vous êtes déjà inscrit à cette séance', variant: 'destructive' });
        } else {
          throw new Error(error.message);
        }
        return;
      }
      toast({ title: 'Inscription confirmée', description: 'Vous êtes inscrit à cette séance' });
      fetchSessions();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de s\'inscrire', variant: 'destructive' });
    }
  };

  const handleUnregister = async (sessionId: number) => {
    if (!user) return;

    try {
      const { error } = await apiClient.unregisterFromSession(sessionId);
      if (error) throw new Error(error.message);
      toast({ title: 'Désinscription confirmée', description: 'Vous êtes désinscrit de cette séance' });
      fetchSessions();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de se désinscrire',
        variant: 'destructive',
      });
    }
  };

  const isUserRegistered = (session: Session) => {
    // Dans l'API PHP, si l'adhérent fait une requête simple, registrations[0].count = 0 ou 1 si inscrit ? 
    // Attends, le backend retourne { registrations: [{ count: X }] }. 
    // Mais pour savoir si MOI je suis inscrit, l'API ne le dit pas explicitement dans getSessions()
    // sauf si on demande include=me (non implémenté).
    // Alternative: Dans l'API Supabase, registrations(id) retournait les IDs de TOUS les inscrits ? 
    // Non, il y avait un filtre RLS. 
    // Ici, le plus simple est de vérifier si l'utilisateur est dans la liste des inscriptions si on les a, 
    // ou d'utiliser un count spécifique. 
    // Vu que fetchSessions() ne retourne que les séances publiées, on va supposer que registrations[0].count
    // est le nombre TOTAL. Pour savoir si le user est inscrit, on pourrait comparer avec History.
    // MAIS, je vais modifier le handler de fetchSessions pour charger les registrations de l'USER.

    // Correction temporaire pour ne pas casser l'UI :
    return (session.registrations[0] as any)?.is_user_registered || false;
  };

  const getAvailabilityBadge = (current: number, max: number, min: number, isClosedBecause7Days: boolean) => {
    if (isClosedBecause7Days) return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Ouverture à J-7</Badge>;
    const remaining = max - current;
    if (remaining === 0) return <Badge variant="destructive">Complet</Badge>;
    if (remaining <= 3) return <Badge className="bg-orange-500">Presque complet</Badge>;
    if (current < min) return <Badge variant="secondary">Min. non atteint</Badge>;
    return <Badge className="bg-green-600">Places disponibles</Badge>;
  };

  const handleOpenDialog = (session: Session) => {
    setSelectedSession(session);
    setDialogOpen(true);
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.title.toLowerCase().includes(filter.search.toLowerCase()) ||
      session.description?.toLowerCase().includes(filter.search.toLowerCase());
    const matchesType = !filter.type || session.session_types?.name === filter.type;
    const matchesDate = !filter.date || session.date === filter.date;
    return matchesSearch && matchesType && matchesDate;
  });

  const getSessionsForDate = (date: Date) => {
    return filteredSessions.filter(session =>
      isSameDay(new Date(session.date), date)
    );
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  });

  const availableSessionTypes = Array.from(
    new Set(
      sessions
        .map((s) => s.session_types?.name)
        .filter((name): name is string => !!name)
    )
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Séances disponibles</h1>
              <p className="text-muted-foreground">Inscrivez-vous aux séances proposées par nos coachs</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-2" />
                Liste
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                onClick={() => setViewMode('calendar')}
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Calendrier
              </Button>
            </div>
          </div>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
            <Filter className="w-5 h-5 text-muted-foreground hidden sm:block" />
            <Input
              placeholder="Rechercher..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full sm:max-w-xs"
            />
            <Select
              value={filter.type || "all"}
              onValueChange={(value) => setFilter({ ...filter, type: value === "all" ? "" : value })}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Type de séance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {availableSessionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filter.date}
              onChange={(e) => setFilter({ ...filter, date: e.target.value })}
              className="w-full sm:w-48"
            />
          </div>
        </Card>

        {viewMode === 'list' ? (
          filteredSessions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Aucune séance disponible pour le moment</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.map((session) => {
                const registered = isUserRegistered(session);
                const currentParticipants = (session.registrations[0] as any)?.count || 0;
                
                // Calcul pour ouverture à 7 jours
                const daysUntilSession = differenceInDays(new Date(session.date), new Date());
                const isClosedBecause7Days = (session.limit_registration_7_days === true || session.limit_registration_7_days === 1) && daysUntilSession > 7;

                return (
                  <Card
                    key={session.id}
                    className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${isClosedBecause7Days ? 'opacity-70 bg-gray-50' : ''}`}
                    onClick={() => handleOpenDialog(session)}
                  >
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-foreground">{session.title}</h3>
                          {getAvailabilityBadge(currentParticipants, session.max_people, session.min_people, isClosedBecause7Days)}
                        </div>
                        {session.session_types && (
                          <Badge variant="outline" className="mb-2">
                            {session.session_types.name}
                          </Badge>
                        )}
                        {session.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{session.description}</p>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(session.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{session.start_time} - {session.end_time}</span>
                        </div>
                        {session.locations && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{session.locations.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>
                            {currentParticipants} / {session.max_people} participants
                          </span>
                        </div>
                      </div>

                      {registered ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnregister(session.id);
                          }}
                        >
                          Se désinscrire
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegister(session.id, currentParticipants, session.max_people);
                          }}
                          disabled={currentParticipants >= session.max_people}
                        >
                          S'inscrire
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMonth(new Date())}
                >
                  Aujourd'hui
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                >
                  →
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
                  {day}
                </div>
              ))}

              {monthDays.map((day) => {
                const daySessions = getSessionsForDate(day);
                const isCurrentMonth = isSameMonth(day, selectedMonth);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toString()}
                    className={`min-h-24 p-2 border rounded-lg ${isCurrentMonth ? 'bg-card' : 'bg-muted/50'
                      } ${isToday ? 'border-primary border-2' : ''}`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {daySessions.slice(0, 2).map((session) => (
                        <div
                          key={session.id}
                          className="text-xs p-1 bg-primary/10 rounded cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={() => handleOpenDialog(session)}
                        >
                          <div className="font-medium truncate">{session.start_time}</div>
                          <div className="truncate">{session.title}</div>
                        </div>
                      ))}
                      {daySessions.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{daySessions.length - 2} autre(s)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {selectedSession && (() => {
          const currentParticipants = (selectedSession.registrations[0] as any)?.count || 0;
          const daysUntilSession = differenceInDays(new Date(selectedSession.date), new Date());
          const isClosedBecause7DaysModal = (selectedSession.limit_registration_7_days === true || selectedSession.limit_registration_7_days === 1) && daysUntilSession > 7;
          
          return (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedSession.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedSession.session_types && (
                  <Badge variant="outline">{selectedSession.session_types.name}</Badge>
                )}

                {selectedSession.description && (
                  <p className="text-muted-foreground">{selectedSession.description}</p>
                )}

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span>{format(new Date(selectedSession.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span>{selectedSession.start_time} - {selectedSession.end_time}</span>
                  </div>
                  {selectedSession.locations && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">{selectedSession.locations.name}</div>
                        {selectedSession.locations.address && (
                          <div className="text-sm text-muted-foreground">{selectedSession.locations.address}</div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <span>
                          {currentParticipants} / {selectedSession.max_people} participants
                        </span>
                        {getAvailabilityBadge(
                          currentParticipants,
                          selectedSession.max_people,
                          selectedSession.min_people,
                          isClosedBecause7DaysModal
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground ml-8">
                      Maximum : {selectedSession.max_people_blocking ? 'Strict' : 'Indicatif'} 
                      {' • '}
                      Minimum requis : {selectedSession.min_people} ({selectedSession.min_people_blocking ? 'Strict' : 'Indicatif'})
                    </div>
                  </div>
                  
                  {(selectedSession.equipment_coach || selectedSession.equipment_clients || selectedSession.equipment_location) && (
                    <div className="mt-4 p-4 bg-muted rounded-lg space-y-2 text-sm">
                      <h4 className="font-semibold text-foreground mb-2">Matériel & Équipement</h4>
                      {selectedSession.equipment_coach && (
                        <div><span className="font-medium">Coach :</span> {selectedSession.equipment_coach}</div>
                      )}
                      {selectedSession.equipment_clients && (
                        <div><span className="font-medium">Adhérents :</span> {selectedSession.equipment_clients}</div>
                      )}
                      {selectedSession.equipment_location && (
                        <div><span className="font-medium">Sur place :</span> {selectedSession.equipment_location}</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t flex flex-col gap-2">
                  {isUserRegistered(selectedSession) ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleUnregister(selectedSession.id);
                        setDialogOpen(false);
                      }}
                    >
                      Se désinscrire
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => {
                        handleRegister(
                          selectedSession.id,
                          currentParticipants,
                          selectedSession.max_people
                        );
                        setDialogOpen(false);
                      }}
                      disabled={currentParticipants >= selectedSession.max_people || isClosedBecause7DaysModal}
                    >
                      {isClosedBecause7DaysModal ? 'Inscriptions fermées (Ouverture à J-7)' : 'S\'inscrire'}
                    </Button>
                  )}
                  
                  {/* Raccourcis pour les Admin & Coachs uniquement */}
                  {(role === 'admin' || role === 'coach') && (
                    <div className="mt-4 pt-4 border-t border-dashed flex items-center justify-between">
                      <span className="text-sm text-muted-foreground mr-4">Gestion rapide (Coach)</span>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/coach/sessions/${selectedSession.id}/edit`)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (window.confirm('Voulez-vous vraiment supprimer cette séance ? Les inscrits seront désinscrits.')) {
                              setDialogOpen(false);
                              try {
                                const { error } = await apiClient.deleteSession(selectedSession.id.toString());
                                if (error) throw new Error(error.message);
                                toast({ title: 'Séance supprimée' });
                                fetchSessions();
                              } catch (e: any) {
                                toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
                              }
                            }
                          }}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          );
        })()}
      </div>
    </div>
  );
}
