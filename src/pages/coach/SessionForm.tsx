import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Loader2, ArrowLeft } from 'lucide-react';

type SessionType = { id: string; name: string };
type Location = { id: string; name: string };

export default function SessionForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type_id: '',
    location_id: '',
    date: '',
    start_time: isEdit ? '' : '17:00',
    end_time: isEdit ? '' : '18:00',
    min_people: '4',
    min_people_blocking: true,
    max_people: '20',
    max_people_blocking: true,
    equipment_coach: '',
    equipment_clients: '',
    equipment_location: '',
    status: 'published',
  });

  useEffect(() => {
    fetchSessionTypes();
    fetchLocations();
    if (isEdit) {
      fetchSession();
    }
  }, [id]);

  const fetchSessionTypes = async () => {
    const { data } = await apiClient.getSessionTypes();
    const fetchedTypes = (data as any)?.session_types || data || [];
    setSessionTypes(fetchedTypes);
    if (!isEdit && fetchedTypes.length > 0) {
      setFormData(prev => ({ ...prev, type_id: prev.type_id || fetchedTypes[0].id.toString() }));
    }
  };

  const fetchLocations = async () => {
    const { data } = await apiClient.getLocations();
    const fetchedLocations = (data as any)?.locations || data || [];
    setLocations(fetchedLocations);
    if (!isEdit && fetchedLocations.length > 0) {
      setFormData(prev => ({ ...prev, location_id: prev.location_id || fetchedLocations[0].id.toString() }));
    }
  };

  const fetchSession = async () => {
    if (!id) return;
    try {
      const { data, error } = await apiClient.getSession(id);
      if (error) throw new Error(error.message);
      // getSession retourne { session: { ... } }
      const session = (data as any)?.session || data;
      if (session) {
        setFormData({
          title: session.title,
          description: session.description || '',
          type_id: session.type_id?.toString() || '',
          location_id: session.location_id?.toString() || '',
          date: session.date,
          start_time: session.start_time,
          end_time: session.end_time,
          min_people: session.min_people?.toString() || '4',
          min_people_blocking: session.min_people_blocking !== 0 && session.min_people_blocking !== false,
          max_people: session.max_people?.toString() || '20',
          max_people_blocking: session.max_people_blocking !== 0 && session.max_people_blocking !== false,
          equipment_coach: session.equipment_coach || '',
          equipment_clients: session.equipment_clients || '',
          equipment_location: session.equipment_location || '',
          status: session.status,
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la séance',
        variant: 'destructive',
      });
      navigate('/coach/sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const sessionData = {
        title: formData.title,
        description: formData.description || null,
        type_id: formData.type_id || null,
        location_id: formData.location_id || null,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        min_people: parseInt(formData.min_people),
        max_people: parseInt(formData.max_people),
        min_people_blocking: formData.min_people_blocking ? 1 : 0,
        max_people_blocking: formData.max_people_blocking ? 1 : 0,
        equipment_coach: formData.equipment_coach || null,
        equipment_clients: formData.equipment_clients || null,
        equipment_location: formData.equipment_location || null,
        status: formData.status,
        created_by: user.id,
      };

      if (isEdit && id) {
        const { error } = await apiClient.updateSession(id, sessionData);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await apiClient.createSession(sessionData);
        if (error) throw new Error(error.message);
      }

      toast({
        title: isEdit ? 'Séance mise à jour' : 'Séance créée',
        description: isEdit ? 'La séance a été mise à jour' : 'La séance a été créée avec succès',
      });
      navigate('/coach/sessions');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || (isEdit ? 'Impossible de mettre à jour la séance' : 'Impossible de créer la séance'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <Button variant="ghost" onClick={() => navigate('/coach/sessions')} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">
            {isEdit ? 'Modifier la séance' : 'Créer une séance'}
          </h1>
          <p className="text-muted-foreground">Remplissez les informations de la séance</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Titre de la séance *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type_id">Type de séance *</Label>
                <Select value={formData.type_id} onValueChange={(value) => setFormData({ ...formData, type_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location_id">Lieu *</Label>
                <Select value={formData.location_id} onValueChange={(value) => setFormData({ ...formData, location_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un lieu" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="start_time">Heure début *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_time">Heure fin *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
              <div className="space-y-4">
                <Label htmlFor="min_people">Minimum participants *</Label>
                <div className="flex gap-4 items-center">
                  <Input
                    id="min_people"
                    type="number"
                    min="1"
                    className="w-24"
                    value={formData.min_people}
                    onChange={(e) => setFormData({ ...formData, min_people: e.target.value })}
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="min_people_blocking"
                      checked={formData.min_people_blocking}
                      onCheckedChange={(checked) => setFormData({ ...formData, min_people_blocking: checked })}
                    />
                    <Label htmlFor="min_people_blocking" className="text-sm font-normal cursor-pointer text-muted-foreground">
                      <span className={formData.min_people_blocking ? 'font-semibold text-foreground' : ''}>{formData.min_people_blocking ? 'Blocante' : 'Indicative'}</span>
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="max_people">Maximum participants *</Label>
                <div className="flex gap-4 items-center">
                  <Input
                    id="max_people"
                    type="number"
                    min="1"
                    className="w-24"
                    value={formData.max_people}
                    onChange={(e) => setFormData({ ...formData, max_people: e.target.value })}
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="max_people_blocking"
                      checked={formData.max_people_blocking}
                      onCheckedChange={(checked) => setFormData({ ...formData, max_people_blocking: checked })}
                    />
                    <Label htmlFor="max_people_blocking" className="text-sm font-normal cursor-pointer text-muted-foreground">
                      <span className={formData.max_people_blocking ? 'font-semibold text-foreground' : ''}>{formData.max_people_blocking ? 'Blocante' : 'Indicative'}</span>
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Presets Matériel */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-medium">Matériel</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({
                      ...formData,
                      equipment_clients: 'Bâtons de marche, chaussures adaptées, eau',
                      equipment_coach: 'Trousse de secours, gourde',
                      equipment_location: 'Point de RDV extérieur'
                    })}
                  >
                    Bâtons / Extérieur
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({
                      ...formData,
                      equipment_clients: 'Tenue de sport, serviette, eau',
                      equipment_coach: 'Élastiques, musique',
                      equipment_location: 'Tapis de sol, haltères'
                    })}
                  >
                    Tapis / Salle
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({
                      ...formData,
                      equipment_clients: 'Tenue de sport, chaussures indoor, serviette, eau',
                      equipment_coach: 'Chronomètre, sifflet, programme',
                      equipment_location: 'Poids libres, machines, bancs'
                    })}
                  >
                    Muscu / Circuit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({
                      ...formData,
                      equipment_clients: 'Tenue ample, chaussettes épaisses',
                      equipment_coach: 'Musique douce, huiles essentielles',
                      equipment_location: 'Tapis de sol, plaids, coussins'
                    })}
                  >
                    Relax / Bien-être
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => setFormData({
                      ...formData,
                      equipment_clients: '',
                      equipment_coach: '',
                      equipment_location: ''
                    })}
                  >
                    Effacer
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipment_coach" className="text-muted-foreground">Matériel coach</Label>
                  <Input
                    id="equipment_coach"
                    value={formData.equipment_coach}
                    onChange={(e) => setFormData({ ...formData, equipment_coach: e.target.value })}
                    placeholder="Tapis, élastiques..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="equipment_clients" className="text-muted-foreground">Matériel clients</Label>
                  <Input
                    id="equipment_clients"
                    value={formData.equipment_clients}
                    onChange={(e) => setFormData({ ...formData, equipment_clients: e.target.value })}
                    placeholder="Tenue confortable, bouteille d'eau..."
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="equipment_location" className="text-muted-foreground">Matériel sur place</Label>
                  <Input
                    id="equipment_location"
                    value={formData.equipment_location}
                    onChange={(e) => setFormData({ ...formData, equipment_location: e.target.value })}
                    placeholder="Vestiaires, douches..."
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="status">Statut *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publiée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  isEdit ? 'Mettre à jour' : 'Créer la séance'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/coach/sessions')} className="w-full sm:w-auto">
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
