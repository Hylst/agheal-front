import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/integrations/api/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, Users, UserPlus, Search, Check, Save } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Attendee = {
  registration_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  attended: boolean;
  attended_at: string | null;
  registered_at: string;
  is_walk_in: boolean;
};

type Candidate = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export default function SessionAttendance() {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [session, setSession] = useState<any>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Walk-in search
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    fetchAttendance();
  }, [sessionId]);

  const fetchAttendance = async () => {
    setLoading(true);
    const { data, error } = await apiClient.getAttendance(sessionId!);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    setSession(data?.session || null);
    const list = data?.attendees || [];
    setAttendees(list);
    const map: Record<string, boolean> = {};
    list.forEach((a: Attendee) => { map[a.user_id] = a.attended; });
    setCheckedMap(map);
    setLoading(false);
    setDirty(false);
  };

  // Live search for walk-ins
  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      const { data } = await apiClient.getAttendanceCandidates(sessionId!, search.trim());
      setSearchResults(data?.candidates || []);
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sessionId]);

  const toggleAttended = useCallback((userId: string, val: boolean) => {
    setCheckedMap(prev => ({ ...prev, [userId]: val }));
    setDirty(true);
  }, []);

  const addWalkIn = useCallback(async (candidate: Candidate) => {
    // Ajouter directement comme présent (walk-in)
    setAttendees(prev => [
      ...prev,
      {
        registration_id: '',
        user_id: candidate.id,
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        email: candidate.email,
        attended: true,
        attended_at: null,
        registered_at: new Date().toISOString(),
        is_walk_in: true,
      },
    ]);
    setCheckedMap(prev => ({ ...prev, [candidate.id]: true }));
    setSearch('');
    setSearchResults([]);
    setDirty(true);
    toast({ title: `${candidate.first_name} ${candidate.last_name} ajouté(e) comme présent(e)` });
  }, []);

  const saveAttendance = async () => {
    setSaving(true);
    const attendances = attendees.map(a => ({
      user_id: a.user_id,
      attended: checkedMap[a.user_id] ?? false,
    }));

    const { error } = await apiClient.updateAttendance(sessionId!, attendances);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Présences enregistrées ✓' });
      await fetchAttendance();
    }
    setSaving(false);
  };

  const countAttended = attendees.filter(a => checkedMap[a.user_id]).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background p-8 text-center">
        <p className="text-muted-foreground">Séance introuvable.</p>
        <Button variant="ghost" onClick={() => navigate('/coach/sessions')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/coach/sessions')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux séances
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Pointage des présences</h1>
          <p className="text-muted-foreground mt-1">{session.title}</p>
        </div>

        {/* Session info */}
        <Card className="mb-6">
          <CardContent className="pt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(session.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{session.start_time} – {session.end_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                <span className="font-semibold text-foreground">{countAttended}</span>
                /{attendees.length} présent(s)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Registered attendees */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Inscrits ({attendees.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {attendees.length === 0 && (
              <p className="text-muted-foreground text-sm py-4 text-center">Aucun inscrit pour le moment.</p>
            )}
            {attendees.map((a) => (
              <div
                key={a.user_id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  checkedMap[a.user_id]
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`attend-${a.user_id}`}
                    checked={checkedMap[a.user_id] ?? false}
                    onCheckedChange={(val) => toggleAttended(a.user_id, !!val)}
                  />
                  <label
                    htmlFor={`attend-${a.user_id}`}
                    className="cursor-pointer flex flex-col"
                  >
                    <span className="font-medium text-foreground">
                      {a.first_name} {a.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">{a.email}</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {a.is_walk_in && (
                    <Badge variant="outline" className="text-xs border-blue-300 text-blue-600">
                      Sur place
                    </Badge>
                  )}
                  {checkedMap[a.user_id] && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Walk-in: add unregistered member */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Ajouter un participant sur place
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {searchLoading && (
              <p className="text-sm text-muted-foreground mt-2">Recherche...</p>
            )}

            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-lg divide-y">
                {searchResults.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-4 py-2 hover:bg-muted/60 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{c.first_name} {c.last_name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addWalkIn(c)}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {search.trim().length >= 2 && !searchLoading && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">Aucun membre trouvé.</p>
            )}
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end gap-3">
          {dirty && (
            <Badge variant="secondary" className="self-center">Modifications non sauvegardées</Badge>
          )}
          <Button
            onClick={saveAttendance}
            disabled={saving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer les présences'}
          </Button>
        </div>
      </div>
    </div>
  );
}
