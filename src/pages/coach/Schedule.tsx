import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Users, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, addWeeks, addDays, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

type Location = {
  id: number;
  name: string;
};

type SessionType = {
  id: number;
  name: string;
  description: string | null;
  default_location_id: number | null;
};

export default function Schedule() {
  const navigate = useNavigate();
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [repeat, setRepeat] = useState(false);

  const [formData, setFormData] = useState({
    type_id: '',
    title: '',
    description: '',
    location_id: '',
    date: '',
    start_time: '',
    end_time: '',
    min_people: '1',
    min_people_blocking: true,
    max_people: '20',
    max_people_blocking: true,
    equipment_coach: '',
    equipment_clients: '',
    equipment_location: '',
    repeat_weeks: '1',
    repeat_unit: 'weeks',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [typesResponse, locationsResponse] = await Promise.all([
        apiClient.getSessionTypes(),
        apiClient.getLocations(),
      ]);

      if (typesResponse.error) throw typesResponse.error;
      if (locationsResponse.error) throw locationsResponse.error;

      const fetchedTypes = (typesResponse.data as any)?.session_types || typesResponse.data || [];
      const fetchedLocations = (locationsResponse.data as any)?.locations || locationsResponse.data || [];

      setSessionTypes(fetchedTypes);
      setLocations(fetchedLocations);

      if (fetchedTypes.length > 0) {
        const firstType = fetchedTypes[0];
        setFormData(prev => ({
          ...prev,
          type_id: firstType.id.toString(),
          title: firstType.name,
          description: firstType.description || '',
          location_id: firstType.default_location_id?.toString() || (fetchedLocations.length > 0 ? fetchedLocations[0].id.toString() : ''),
        }));
      } else if (fetchedLocations.length > 0) {
        setFormData(prev => ({
          ...prev,
          location_id: fetchedLocations[0].id.toString(),
        }));
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (typeId: string) => {
    const selectedType = sessionTypes.find((t) => t.id.toString() === typeId);
    if (selectedType) {
      setFormData({
        ...formData,
        type_id: typeId,
        title: selectedType.name,
        description: selectedType.description || '',
        location_id: selectedType.default_location_id?.toString() || '',
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.type_id || !formData.title || !formData.date || !formData.start_time || !formData.end_time) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      const baseSession = {
        type_id: formData.type_id || null,
        title: formData.title,
        description: formData.description || null,
        location_id: formData.location_id || null,
        start_time: formData.start_time,
        end_time: formData.end_time,
        min_people: parseInt(formData.min_people),
        max_people: parseInt(formData.max_people),
        min_people_blocking: formData.min_people_blocking ? 1 : 0,
        max_people_blocking: formData.max_people_blocking ? 1 : 0,
        equipment_coach: formData.equipment_coach || null,
        equipment_clients: formData.equipment_clients || null,
        equipment_location: formData.equipment_location || null,
        capacity: parseInt(formData.max_people), // backward compat if needed
        status: 'published',
      };

      const sessions = [];
      const repeatCount = repeat ? parseInt(formData.repeat_weeks) : 1;

      for (let i = 0; i < repeatCount; i++) {
        const baseDate = new Date(formData.date);
        let sessionDate = baseDate;
        if (formData.repeat_unit === 'days') {
            sessionDate = addDays(baseDate, i);
        } else if (formData.repeat_unit === 'months') {
            sessionDate = addMonths(baseDate, i);
        } else {
            sessionDate = addWeeks(baseDate, i);
        }
        
        sessions.push({
          ...baseSession,
          date: format(sessionDate, 'yyyy-MM-dd'),
        });
      }

      const { error } = await apiClient.createSessions(sessions);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `${sessions.length} séance(s) créée(s) avec succès`,
      });

      // Reset form
      setFormData({
        type_id: '',
        title: '',
        description: '',
        location_id: '',
        date: '',
        start_time: '',
        end_time: '',
        min_people: '1',
        min_people_blocking: true,
        max_people: '20',
        max_people_blocking: true,
        equipment_coach: '',
        equipment_clients: '',
        equipment_location: '',
        repeat_weeks: '1',
        repeat_unit: 'weeks',
      });
      setRepeat(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la/les séance(s)',
        variant: 'destructive',
      });
    }
  };

  const getPreviewDates = () => {
    if (!formData.date || !repeat) return [];
    const dates = [];
    const repeatCount = parseInt(formData.repeat_weeks);
    for (let i = 0; i < repeatCount; i++) {
      const baseDate = new Date(formData.date);
      let previewDate = baseDate;
      if (formData.repeat_unit === 'days') {
          previewDate = addDays(baseDate, i);
      } else if (formData.repeat_unit === 'months') {
          previewDate = addMonths(baseDate, i);
      } else {
          previewDate = addWeeks(baseDate, i);
      }
      dates.push(previewDate);
    }
    return dates;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au Dashboard
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Planification</h1>
          <p className="text-muted-foreground">Programmer une nouvelle séance</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Sélection de l'activité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="type">Type d'activité *</Label>
                <Select value={formData.type_id} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une activité" />
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Configuration de la séance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de la séance"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la séance..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="location">Lieu *</Label>
                <Select
                  value={formData.location_id}
                  onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                >
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="start_time">Heure début *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">Heure fin *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
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
                      placeholder="Tapis de sol, bancs..."
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Duplication</CardTitle>
              <CardDescription>Répéter cette séance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="repeat"
                  checked={repeat}
                  onCheckedChange={(checked) => setRepeat(checked as boolean)}
                />
                <Label htmlFor="repeat" className="cursor-pointer">
                  Répéter cette séance
                </Label>
              </div>

              {repeat && (
                <>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="repeat_weeks" className="text-muted-foreground">Nombre d'occurrences (1-12)</Label>
                      <Input
                        id="repeat_weeks"
                        type="number"
                        min="1"
                        max="12"
                        value={formData.repeat_weeks}
                        onChange={(e) => setFormData({ ...formData, repeat_weeks: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="repeat_unit" className="text-muted-foreground">Fréquence</Label>
                      <Select value={formData.repeat_unit} onValueChange={(value) => setFormData({ ...formData, repeat_unit: value })}>
                        <SelectTrigger className="mt-2" id="repeat_unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Tous les jours</SelectItem>
                          <SelectItem value="weeks">Toutes les semaines</SelectItem>
                          <SelectItem value="months">Tous les mois</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.date && (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Aperçu des dates :</p>
                      <div className="space-y-1">
                        {getPreviewDates().map((date, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{format(date, 'EEEE d MMMM yyyy', { locale: fr })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSubmit} className="w-full" size="lg">
                <Copy className="w-4 h-4 mr-2" />
                Créer {repeat ? `${formData.repeat_weeks} séance(s)` : 'la séance'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
