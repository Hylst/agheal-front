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
import { ArrowLeft, Search, Users, Edit, Eye, CreditCard, Shield } from 'lucide-react';
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
  payment_status: 'a_jour' | 'en_attente';
  renewal_date: string | null;
  medical_certificate_date: string | null;
  groups?: { id: number; name: string }[];
  roles?: string[];
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
  const [paymentStatus, setPaymentStatus] = useState<'a_jour' | 'en_attente'>('en_attente');
  const [renewalDate, setRenewalDate] = useState('');
  const [medicalCertifDate, setMedicalCertifDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
    setMedicalCertifDate(client.medical_certificate_date || '');
    setEditMode(edit);
  };

  const closeDialog = () => {
    setSelectedClient(null);
    setEditMode(false);
    setCoachRemarks('');
    setSelectedGroups([]);
    setPaymentStatus('en_attente');
    setRenewalDate('');
    setMedicalCertifDate('');
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
        medical_certificate_date: medicalCertifDate || null,
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
            ? {
                ...c,
                coach_remarks: coachRemarks,
                payment_status: paymentStatus,
                renewal_date: renewalDate || null,
                medical_certificate_date: medicalCertifDate || null
              }
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

  // Gestion des rôles (admin uniquement)
  const handleRoleToggle = async (targetRole: 'coach' | 'admin') => {
    if (!selectedClient || !user) return;
    const currentRoles = selectedClient.roles || [];
    const hasRole = currentRoles.includes(targetRole);

    // Protection : l'admin ne peut pas se retirer son propre rôle admin
    if (hasRole && targetRole === 'admin' && selectedClient.id === user.id) {
      toast({
        title: 'Action refusée',
        description: 'Vous ne pouvez pas vous retirer votre propre rôle administrateur.',
        variant: 'destructive',
      });
      return;
    }

    setRoleUpdating(targetRole);
    try {
      if (hasRole) {
        const { error } = await apiClient.removeUserRole(selectedClient.id, targetRole);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await apiClient.addUserRole(selectedClient.id, targetRole);
        if (error) throw new Error(error.message);
      }

      // Mise à jour optimiste locale
      const newRoles = hasRole
        ? currentRoles.filter(r => r !== targetRole)
        : [...currentRoles, targetRole];
      setSelectedClient(prev => prev ? { ...prev, roles: newRoles } : prev);
      setClients(prev =>
        prev.map(c => c.id === selectedClient.id ? { ...c, roles: newRoles } : c)
      );

      toast({
        title: 'Rôle mis à jour',
        description: hasRole
          ? `Rôle "${targetRole}" retiré.`
          : `Rôle "${targetRole}" ajouté.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le rôle.',
        variant: 'destructive',
      });
    } finally {
      setRoleUpdating(null);
    }
  };

  const filteredClients = clients
    .filter(client => {
      const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase())
        || (client.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || client.payment_status === statusFilter;
      const matchesGroup = groupFilter === 'all'
        || (groupFilter === 'none'
          ? (userGroups[client.id] || []).length === 0
          : (userGroups[client.id] || []).includes(Number(groupFilter)));
      return matchesSearch && matchesStatus && matchesGroup;
    })
    .sort((a, b) => {
      const nameA = `${a.last_name || ''} ${a.first_name || ''}`.toLowerCase();
      const nameB = `${b.last_name || ''} ${b.first_name || ''}`.toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
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
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
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
            <div className="flex flex-col gap-3">
              {/* Titre + compteur */}
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Liste des adhérents ({filteredClients.length})</CardTitle>
                {/* Bouton tri A→Z / Z→A */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                  className="gap-1.5 text-xs"
                  title={sortOrder === 'asc' ? 'Tri A→Z (cliquer pour inverser)' : 'Tri Z→A (cliquer pour inverser)'}
                >
                  {sortOrder === 'asc'
                    ? <>⇧ A→Z</>
                    : <>⇩ Z→A</>
                  }
                </Button>
              </div>
              {/* Barre de filtres */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                {/* Filtre statut paiement */}
                <div className="flex-1 min-w-[140px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="a_jour">À jour</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Filtre groupe */}
                <div className="flex-1 min-w-[140px]">
                  <Select value={groupFilter} onValueChange={setGroupFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Groupe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les groupes</SelectItem>
                      <SelectItem value="none">Sans groupe</SelectItem>
                      {groups.map(g => (
                        <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Recherche texte */}
                <div className="relative flex-[2] min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Nom, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
                {/* Bouton reset filtres (si actifs) */}
                {(statusFilter !== 'all' || groupFilter !== 'all' || searchTerm) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setStatusFilter('all'); setGroupFilter('all'); setSearchTerm(''); }}
                    className="text-muted-foreground text-xs whitespace-nowrap"
                  >
                    × Réinitialiser
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Vue carte sur mobile */}
            <div className="sm:hidden space-y-3">
              {filteredClients.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">Aucun adhérent trouvé</p>
              )}
              {filteredClients.map((client) => (
                <div key={client.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-9 h-9">
                        {client.avatar_base64 && <AvatarImage src={client.avatar_base64} />}
                        <AvatarFallback>{getInitials(client.first_name, client.last_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{client.first_name} {client.last_name}</p>
                        {client.age && <p className="text-xs text-muted-foreground">{client.age} ans</p>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openClientDetail(client, false)}><Eye className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openClientDetail(client, true)}><Edit className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>{client.email || '-'}</p>
                    <p>{client.phone || '-'}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 items-center">
                    <Badge variant={client.statut_compte === 'actif' ? 'default' : 'destructive'} className={client.statut_compte === 'actif' ? 'bg-green-600 text-xs' : 'text-xs'}>
                      {client.statut_compte === 'actif' ? 'Actif' : 'Bloqué'}
                    </Badge>
                    {!(client.roles?.includes('admin') || client.roles?.includes('coach')) && (
                      <Badge variant={client.payment_status === 'a_jour' ? 'default' : 'secondary'} className={client.payment_status === 'a_jour' ? 'bg-green-600 text-xs' : 'text-xs'}>
                        {client.payment_status === 'a_jour' ? 'À jour' : 'En attente'}
                      </Badge>
                    )}
                    {getClientGroups(client.id).map(group => (
                      <Badge key={group.id} variant="secondary" className="text-xs">{group.name}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tableau sur desktop */}
            <div className="hidden sm:block overflow-x-auto">
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {(client.roles?.includes('admin') || client.roles?.includes('coach')) ? null : (
                          <Badge
                            variant={client.payment_status === 'a_jour' ? 'default' : 'secondary'}
                            className={client.payment_status === 'a_jour' ? 'bg-green-600' : ''}
                          >
                            {client.payment_status === 'a_jour' ? 'À jour' : 'En attente'}
                          </Badge>
                        )}
                      </div>
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
                        <Button size="sm" variant="ghost" onClick={() => openClientDetail(client, false)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openClientDetail(client, true)}>
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
            </div>
          </CardContent>
        </Card>

        {/* Client Detail Dialog */}
        <Dialog open={!!selectedClient} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">Date d'inscription</Label>
                      <p className="font-medium">{formatDate(selectedClient.created_at)}</p>
                    </div>

                    {!(selectedClient.roles?.includes('admin') || selectedClient.roles?.includes('coach')) && (
                      editMode ? (
                        <>
                          <div>
                            <Label className="text-muted-foreground text-sm">Statut règlement</Label>
                            <Select value={paymentStatus} onValueChange={(val) => setPaymentStatus(val as 'a_jour' | 'en_attente')}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="a_jour">À jour</SelectItem>
                                <SelectItem value="en_attente">En attente</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1">
                            <Label className="text-muted-foreground text-sm">Date de renouvellement</Label>
                            <Input
                              type="date"
                              value={renewalDate}
                              onChange={(e) => setRenewalDate(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div className="col-span-1">
                            <Label className="text-muted-foreground text-sm">Certificat médical (exp.)</Label>
                            <Input
                              type="date"
                              value={medicalCertifDate}
                              onChange={(e) => setMedicalCertifDate(e.target.value)}
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
                          {selectedClient.medical_certificate_date && (
                            <div>
                              <Label className="text-muted-foreground text-sm">Certificat médical (exp.)</Label>
                              <p className="font-medium">{formatDate(selectedClient.medical_certificate_date)}</p>
                            </div>
                          )}
                        </>
                      )
                    )}
                  </div>
                </div>

                {/* Informations de contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* Rôles (Admin uniquement) */}
                {isAdmin && (
                  <div className="border-t pt-4">
                    <Label className="flex items-center gap-2 font-semibold mb-3">
                      <Shield className="w-4 h-4 text-primary" />
                      Rôles (Admin)
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {(['coach', 'admin'] as const).map(r => {
                        const hasRole = (selectedClient.roles || []).includes(r);
                        const isSelfAdmin = r === 'admin' && selectedClient.id === user?.id;
                        const isLoading = roleUpdating === r;
                        return (
                          <Button
                            key={r}
                            size="sm"
                            variant={hasRole ? 'default' : 'outline'}
                            className={hasRole ? 'bg-primary text-primary-foreground' : ''}
                            disabled={isLoading || isSelfAdmin}
                            onClick={() => handleRoleToggle(r)}
                            title={isSelfAdmin ? 'Vous ne pouvez pas modifier votre propre rôle admin' : ''}
                          >
                            <Shield className="w-3.5 h-3.5 mr-1.5" />
                            {isLoading ? '...' : (hasRole ? `Retirer ${r}` : `Ajouter ${r}`)}
                          </Button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Le rôle "adhérent" est permanent et ne peut pas être retiré.
                    </p>
                  </div>
                )}
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