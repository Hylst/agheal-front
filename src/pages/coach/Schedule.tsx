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
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Users, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, addWeeks } from 'date-fns';
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
    max_people: '20',
    equipment_coach: '',
    equipment_clients: '',
    equipment_location: '',
    repeat_weeks: '1',
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
        capacity: parseInt(formData.max_people),
        status: 'published',
      };

      const sessions = [];
      const repeatCount = repeat ? parseInt(formData.repeat_weeks) : 1;

      for (let i = 0; i < repeatCount; i++) {
        const sessionDate = addWeeks(new Date(formData.date), i);
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
        max_people: '20',
        equipment_coach: '',
        equipment_clients: '',
        equipment_location: '',
        repeat_weeks: '1',
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
      dates.push(addWeeks(new Date(formData.date), i));
    }
    return dates;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">Planification</h1>
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

              <div className="grid grid-cols-3 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_people">Min. participants</Label>
                  <Input
                    id="min_people"
                    type="number"
                    min="1"
                    value={formData.min_people}
                    onChange={(e) => setFormData({ ...formData, min_people: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="max_people">Max. participants</Label>
                  <Input
                    id="max_people"
                    type="number"
                    min="1"
                    value={formData.max_people}
                    onChange={(e) => setFormData({ ...formData, max_people: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="equipment_coach">Matériel coach</Label>
                <Input
                  id="equipment_coach"
                  value={formData.equipment_coach}
                  onChange={(e) => setFormData({ ...formData, equipment_coach: e.target.value })}
                  placeholder="Ex: Chronomètre, sifflet..."
                />
              </div>

              <div>
                <Label htmlFor="equipment_clients">Matériel clients</Label>
                <Input
                  id="equipment_clients"
                  value={formData.equipment_clients}
                  onChange={(e) => setFormData({ ...formData, equipment_clients: e.target.value })}
                  placeholder="Ex: Tapis, bouteille d'eau..."
                />
              </div>

              <div>
                <Label htmlFor="equipment_location">Matériel sur place</Label>
                <Input
                  id="equipment_location"
                  value={formData.equipment_location}
                  onChange={(e) => setFormData({ ...formData, equipment_location: e.target.value })}
                  placeholder="Ex: Poids, élastiques..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Duplication</CardTitle>
              <CardDescription>Répéter cette séance sur plusieurs semaines</CardDescription>
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
                  <div>
                    <Label htmlFor="repeat_weeks">Nombre de semaines (1-12)</Label>
                    <Input
                      id="repeat_weeks"
                      type="number"
                      min="1"
                      max="12"
                      value={formData.repeat_weeks}
                      onChange={(e) => setFormData({ ...formData, repeat_weeks: e.target.value })}
                    />
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
