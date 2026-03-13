import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Search, Users, Edit, Eye, Calendar, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type ClientProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string;
  phone: string | null;
  organization: string | null;
  remarks_health: string | null;
  additional_info: string | null;
  coach_remarks: string | null;
  avatar_base64: string | null;
  statut_compte: string | null;
  created_at: string | null;
  age: number | null;
  payment_status: string | null;
  renewal_date: string | null;
  groups?: { id: number; name: string }[];
};

type Group = {
  id: number;
  name: string;
  details: string | null;
};

export default function Clients() {
  const { user, roles } = useAuth();
  const isAdmin = roles.includes('admin');
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [coachRemarks, setCoachRemarks] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [paymentStatus, setPaymentStatus] = useState('en_attente');
  const [renewalDate, setRenewalDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, groupsRes] = await Promise.all([
        apiClient.getClients(),
        apiClient.getGroups(),
      ]);

      if (clientsRes.error) throw new Error(clientsRes.error.message);
      if (groupsRes.error) throw new Error(groupsRes.error.message);

      const clientsData: ClientProfile[] = (clientsRes.data as any)?.clients || clientsRes.data || [];
      setClients(clientsData);
      setGroups((groupsRes.data as any)?.groups || groupsRes.data || []);

      // Build user→groups map from embedded groups in client data
      const ugMap: Record<string, number[]> = {};
      clientsData.forEach((c) => {
        ugMap[c.id] = (c.groups || []).map((g: any) => g.id);
      });
      setUserGroups(ugMap);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openClientDetail = (client: ClientProfile, edit = false) => {
    setSelectedClient(client);
    setCoachRemarks(client.coach_remarks || '');
    setSelectedGroups(userGroups[client.id] || []);
    setPaymentStatus(client.payment_status || 'en_attente');
    setRenewalDate(client.renewal_date || '');
    setEditMode(edit);
  };

  const closeDialog = () => {
    setSelectedClient(null);
    setEditMode(false);
    setCoachRemarks('');
    setSelectedGroups([]);
    setPaymentStatus('en_attente');
    setRenewalDate('');
  };

  const handleGroupToggle = (groupId: number) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      }
      if (prev.length >= 3) {
        toast({
          title: 'Limite atteinte',
          description: "Un client ne peut être associé qu'à 3 groupes maximum",
          variant: 'destructive',
        });
        return prev;
      }
      return [...prev, groupId];
    });
  };

  const handleSave = async () => {
    if (!selectedClient || !user) return;

    setSaving(true);
    try {
      const { error: profileError } = await apiClient.updateClient(selectedClient.id, {
        coach_remarks: coachRemarks,
        payment_status: paymentStatus,
        renewal_date: renewalDate || null,
      });
      if (profileError) throw new Error(profileError.message);

      const { error: groupsError } = await apiClient.setClientGroups(
        selectedClient.id,
        selectedGroups,
        user.id
      );
      if (groupsError) throw new Error(groupsError.message);

      // Update local state
      setClients(prev =>
        prev.map(c =>
          c.id === selectedClient.id
            ? { ...c, coach_remarks: coachRemarks, payment_status: paymentStatus, renewal_date: renewalDate || null }
            : c
        )
      );
      setUserGroups(prev => ({ ...prev, [selectedClient.id]: selectedGroups }));

      toast({ title: 'Enregistré', description: 'Les modifications ont été sauvegardées' });
      closeDialog();
    } catch (error: any) {
      console.error('Error saving:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les modifications',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
  };

  const getClientGroups = (clientId: string) => {
    const groupIds = userGroups[clientId] || [];
    return groups.filter(g => groupIds.includes(g.id));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Clients / Adhérents</h1>
              <p className="text-muted-foreground">Gérer les profils et groupes des adhérents</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Liste des adhérents ({filteredClients.length})</CardTitle>
              <div className="flex items-center gap-4">
                <div className="w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="a_jour">À jour</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Adhérent</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Règlement</TableHead>
                  <TableHead>Groupes</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          {client.avatar_base64 ? (
                            <AvatarImage src={client.avatar_base64} />
                          ) : null}
                          <AvatarFallback>
                            {getInitials(client.first_name, client.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {client.first_name} {client.last_name}
                          </p>
                          {client.age && (
                            <p className="text-xs text-muted-foreground">{client.age} ans</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{client.email || '-'}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={client.payment_status === 'a_jour' ? 'default' : 'secondary'}
                        className={client.payment_status === 'a_jour' ? 'bg-green-600' : ''}
                      >
                        {client.payment_status === 'a_jour' ? 'À jour' : 'En attente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getClientGroups(client.id).map(group => (
                          <Badge key={group.id} variant="secondary" className="text-xs">
                            {group.name}
                          </Badge>
                        ))}
                        {getClientGroups(client.id).length === 0 && (
                          <span className="text-muted-foreground text-sm">Aucun</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={client.statut_compte === 'actif' ? 'default' : 'destructive'}
                        className={client.statut_compte === 'actif' ? 'bg-green-600' : ''}
                      >
                        {client.statut_compte === 'actif' ? 'Actif' : 'Bloqué'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openClientDetail(client, false)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openClientDetail(client, true)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun adhérent trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Client Detail Dialog */}
        <Dialog open={!!selectedClient} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedClient && (
                  <>
                    <Avatar className="w-12 h-12">
                      {selectedClient.avatar_base64 ? (
                        <AvatarImage src={selectedClient.avatar_base64} />
                      ) : null}
                      <AvatarFallback>
                        {getInitials(selectedClient.first_name, selectedClient.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{selectedClient.first_name} {selectedClient.last_name}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge
                          variant={selectedClient.statut_compte === 'actif' ? 'default' : 'destructive'}
                          className={selectedClient.statut_compte === 'actif' ? 'bg-green-600 text-xs' : 'text-xs'}
                        >
                          {selectedClient.statut_compte === 'actif' ? 'Actif' : 'Bloqué'}
                        </Badge>
                        {selectedClient.age && (
                          <Badge variant="outline" className="text-xs">
                            {selectedClient.age} ans
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Mettez à jour le statut de paiement et la date de renouvellement pour {selectedClient?.first_name} {selectedClient?.last_name}.
              </DialogDescription>
            </DialogHeader>

            {selectedClient && (
              <div className="space-y-6">
                {/* Informations administratives */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <Label className="font-semibold">Informations administratives</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">Date d'inscription</Label>
                      <p className="font-medium">{formatDate(selectedClient.created_at)}</p>
                    </div>

                    {editMode ? (
                      <>
                        <div>
                          <Label className="text-muted-foreground text-sm">Statut règlement</Label>
                          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a_jour">À jour</SelectItem>
                              <SelectItem value="en_attente">En attente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-muted-foreground text-sm">Date de renouvellement</Label>
                          <Input
                            type="date"
                            value={renewalDate}
                            onChange={(e) => setRenewalDate(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label className="text-muted-foreground text-sm">Statut règlement</Label>
                          <Badge
                            variant={selectedClient.payment_status === 'a_jour' ? 'default' : 'secondary'}
                            className={selectedClient.payment_status === 'a_jour' ? 'bg-green-600 mt-1' : 'mt-1'}
                          >
                            {selectedClient.payment_status === 'a_jour' ? 'À jour' : 'En attente'}
                          </Badge>
                        </div>
                        {selectedClient.renewal_date && (
                          <div>
                            <Label className="text-muted-foreground text-sm">Date de renouvellement</Label>
                            <p className="font-medium">{formatDate(selectedClient.renewal_date)}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Informations de contact */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedClient.email || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Téléphone</Label>
                    <p className="font-medium">{selectedClient.phone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Organisation</Label>
                    <p className="font-medium">{selectedClient.organization || '-'}</p>
                  </div>
                </div>

                {/* Remarques santé */}
                <div>
                  <Label className="text-muted-foreground">Remarques santé</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">
                    {selectedClient.remarks_health || 'Aucune remarque'}
                  </p>
                </div>

                {/* Précisions utiles */}
                <div>
                  <Label className="text-muted-foreground">Précisions utiles</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">
                    {selectedClient.additional_info || 'Aucune information'}
                  </p>
                </div>

                {/* Coach Remarks */}
                <div className="border-t pt-4">
                  <Label htmlFor="coach_remarks" className="flex items-center gap-2 text-primary font-semibold">
                    <Edit className="w-4 h-4" />
                    Remarques Coach (privé)
                  </Label>
                  {editMode ? (
                    <Textarea
                      id="coach_remarks"
                      value={coachRemarks}
                      onChange={(e) => setCoachRemarks(e.target.value)}
                      placeholder="Précautions, rappels, matériel spécifique..."
                      rows={3}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 p-3 bg-primary/10 rounded-lg text-sm">
                      {selectedClient.coach_remarks || 'Aucune remarque coach'}
                    </p>
                  )}
                </div>

                {/* Groups Assignment */}
                <div className="border-t pt-4">
                  <Label className="flex items-center gap-2 font-semibold mb-3">
                    <Users className="w-4 h-4" />
                    Groupes (max 3)
                  </Label>
                  {editMode ? (
                    <div className="space-y-2">
                      {groups.map(group => (
                        <div key={group.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`group-${group.id}`}
                            checked={selectedGroups.includes(group.id)}
                            onCheckedChange={() => handleGroupToggle(group.id)}
                          />
                          <label htmlFor={`group-${group.id}`} className="text-sm cursor-pointer">
                            {group.name}
                          </label>
                        </div>
                      ))}
                      {groups.length === 0 && (
                        <p className="text-muted-foreground text-sm">
                          Aucun groupe disponible. Créez des groupes dans la section Groupes.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {getClientGroups(selectedClient.id).map(group => (
                        <Badge key={group.id} variant="secondary">
                          {group.name}
                        </Badge>
                      ))}
                      {getClientGroups(selectedClient.id).length === 0 && (
                        <span className="text-muted-foreground text-sm">Aucun groupe assigné</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              {editMode ? (
                <>
                  <Button variant="outline" onClick={closeDialog}>
                    Annuler
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={closeDialog}>
                    Fermer
                  </Button>
                  <Button onClick={() => setEditMode(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}