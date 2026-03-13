import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { User, Phone, FileText, ArrowLeft, AlertCircle, Info, Users, Calendar, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarUpload } from '@/components/AvatarUpload';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Profile = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  organization: string | null;
  remarks_health: string | null;
  statut_compte: string | null;
  avatar_base64: string | null;
  additional_info: string | null;
  age: number | null;
  created_at: string | null;
  payment_status: string | null;
  renewal_date: string | null;
};

export default function Profile() {
  const { user, role, roles } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({
    first_name: '',
    last_name: '',
    phone: '',
    organization: '',
    remarks_health: '',
    statut_compte: '',
    avatar_base64: null,
    additional_info: null,
    age: null,
    created_at: null,
    payment_status: null,
    renewal_date: null,
  });
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isCoachOrAdmin = roles.includes('admin') || roles.includes('coach');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await apiClient.getMyProfile();
      if (error) throw new Error(error.message);
      if (data) {
        // me() retourne { user: { ... } }
        setProfile((data as any).user || data);
      }

      const { data: groupsData, error: groupsError } = await apiClient.getUserGroups(user.id);
      if (groupsError) throw new Error(groupsError.message);
      // getUserGroups retourne { groups: [] }
      setUserGroups((groupsData as any)?.groups || groupsData || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le profil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const updateData: Record<string, any> = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        remarks_health: profile.remarks_health,
        avatar_base64: profile.avatar_base64,
        additional_info: profile.additional_info,
        age: profile.age,
      };
      if (isCoachOrAdmin) {
        updateData.organization = profile.organization;
      }

      const { error } = await apiClient.updateProfile(user.id, updateData);
      if (error) throw new Error(error.message);

      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-12 h-12" />
      </div>
    );
  }

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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground">Mon Profil</h1>
            {profile.statut_compte === 'bloque' && (
              <Badge variant="destructive" className="text-base">
                <AlertCircle className="w-4 h-4 mr-1" />
                Compte bloqué
              </Badge>
            )}
            {profile.statut_compte === 'actif' && (
              <Badge className="bg-green-600 text-base">Compte actif</Badge>
            )}
          </div>
          <p className="text-muted-foreground">Gérez vos informations personnelles</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex justify-center pb-6 border-b">
              <AvatarUpload
                currentAvatar={profile.avatar_base64}
                onAvatarChange={(base64) => setProfile({ ...profile, avatar_base64: base64 })}
                userName={`${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
              />
            </div>

            {/* Rôles pour Admin/Coach uniquement */}
            {isCoachOrAdmin && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium mb-2 block">Rôles</Label>
                <div className="flex gap-2">
                  {roles.map((r) => (
                    <Badge key={r} variant="default" className="text-sm">
                      {r === 'admin' ? 'Admin' : r === 'coach' ? 'Coach' : 'Adhérent'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Informations administratives */}
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Informations administratives</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Date d'inscription</Label>
                  <p className="font-medium">{formatDate(profile.created_at)}</p>
                </div>
                {!isCoachOrAdmin && (
                  <>
                    <div>
                      <Label className="text-muted-foreground text-sm mr-2">Statut règlement</Label>
                      <Badge
                        variant={profile.payment_status === 'a_jour' ? 'default' : 'secondary'}
                        className={profile.payment_status === 'a_jour' ? 'bg-green-600 mt-1' : 'mt-1'}
                      >
                        {profile.payment_status === 'a_jour' ? 'À jour' : 'En attente'}
                      </Badge>
                    </div>
                    {profile.renewal_date && (
                      <div>
                        <Label className="text-muted-foreground text-sm">Date de renouvellement</Label>
                        <p className="font-medium">{formatDate(profile.renewal_date)}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Informations personnelles</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Prénom *</Label>
                  <Input
                    id="first_name"
                    value={profile.first_name || ''}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Nom *</Label>
                  <Input
                    id="last_name"
                    value={profile.last_name || ''}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground mt-1">
                    L'email ne peut pas être modifié
                  </p>
                </div>
                <div>
                  <Label htmlFor="age">Âge (optionnel)</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={profile.age || ''}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Votre âge"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Contact</h2>
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              {/* ====== MOBILE : sections secondaires en Accordion ====== */}
              <div className="sm:hidden mt-4">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="sante">
                    <AccordionTrigger className="text-base font-semibold">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        Informations de santé
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <Label htmlFor="remarks_health_m">Remarques santé / Contre-indications</Label>
                      <Textarea
                        id="remarks_health_m"
                        value={profile.remarks_health || ''}
                        onChange={(e) => setProfile({ ...profile, remarks_health: e.target.value })}
                        placeholder="Informations importantes concernant votre santé..."
                        rows={4}
                      />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="precisions">
                    <AccordionTrigger className="text-base font-semibold">
                      <span className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-muted-foreground" />
                        Précisions utiles
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <Label htmlFor="additional_info_m">Informations complémentaires</Label>
                      <Textarea
                        id="additional_info_m"
                        value={profile.additional_info || ''}
                        onChange={(e) => setProfile({ ...profile, additional_info: e.target.value })}
                        placeholder="Autres informations que vous souhaitez partager..."
                        rows={3}
                      />
                    </AccordionContent>
                  </AccordionItem>
                  {userGroups.length > 0 && (
                    <AccordionItem value="groupes">
                      <AccordionTrigger className="text-base font-semibold">
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          Mes groupes
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className="flex flex-wrap gap-2">
                          {userGroups.map((group) => (
                            <Badge key={group.id} variant="secondary" className="text-sm">{group.name}</Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>

              {/* ====== DESKTOP : sections secondaires classiques (sm+) ====== */}
              <div className="hidden sm:block">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">Informations de santé</h2>
                </div>
                <div>
                  <Label htmlFor="remarks_health">Remarques santé / Contre-indications</Label>
                  <Textarea
                    id="remarks_health"
                    value={profile.remarks_health || ''}
                    onChange={(e) => setProfile({ ...profile, remarks_health: e.target.value })}
                    placeholder="Informations importantes concernant votre santé..."
                    rows={4}
                  />
                </div>
                <div className="flex items-center gap-2 mb-4 mt-6">
                  <Info className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">Précisions utiles</h2>
                </div>
                <div>
                  <Label htmlFor="additional_info">Informations complémentaires</Label>
                  <Textarea
                    id="additional_info"
                    value={profile.additional_info || ''}
                    onChange={(e) => setProfile({ ...profile, additional_info: e.target.value })}
                    placeholder="Autres informations que vous souhaitez partager..."
                    rows={3}
                  />
                </div>
                {userGroups.length > 0 && (
                  <div className="border-t pt-4 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <h2 className="text-xl font-semibold">Mes groupes</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userGroups.map((group) => (
                        <Badge key={group.id} variant="secondary" className="text-sm">{group.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}