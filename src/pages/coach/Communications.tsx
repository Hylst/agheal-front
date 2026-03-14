import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, AlertCircle, Send, MessageSquare, Pencil, X, Check, Mail, MessageCircle, Clock, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Communication {
  id: number;
  author_id: string;
  target_type: "all" | "group" | "user";
  target_id: string | null;
  content: string;
  is_urgent: boolean;
  created_at: string;
  first_name?: string;
  last_name?: string;
}

interface EmailCampaign {
  id: number;
  author_id: string;
  subject: string;
  content: string;
  target_type: "all" | "group" | "user";
  target_id: string | null;
  scheduled_at: string;
  status: "pending" | "sent" | "failed";
  created_at: string;
  first_name?: string;
  last_name?: string;
}

interface Group { id: number; name: string; }
interface Client { id: string; first_name: string; last_name: string; }

export default function Communications() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [communications, setCommunications] = useState<Communication[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // État du formulaire In-App
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [targetType, setTargetType] = useState<"all" | "group" | "user">("all");
  const [targetId, setTargetId] = useState<string>("");
  const [content, setContent] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [saving, setSaving] = useState(false);

  // État du formulaire Email
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [emailTargetType, setEmailTargetType] = useState<"all" | "group" | "user">("all");
  const [emailTargetId, setEmailTargetId] = useState<string>("");
  const [emailScheduledAt, setEmailScheduledAt] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [commsRes, emailsRes, groupsRes, clientsRes] = await Promise.all([
        apiClient.getCommunicationsTargets(),
        apiClient.getEmailCampaigns(),
        apiClient.getGroups(),
        apiClient.getClients(),
      ]);

      if (!commsRes.error) setCommunications((commsRes.data as any)?.data ?? []);
      if (!emailsRes.error) setEmailCampaigns((emailsRes.data as any)?.data ?? []);
      
      if (!groupsRes.error) setGroups((groupsRes.data as any)?.groups ?? []);
      if (!clientsRes.error) setClients((clientsRes.data as any)?.clients ?? []);

    } catch (error) {
      console.error("Erreur fetchAll:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // --- Fonctions In-App ---
  const resetForm = () => {
    setEditingId(null); setTargetType("all"); setTargetId(""); setContent(""); setIsUrgent(false); setShowForm(false);
  };

  const startEdit = (comm: Communication) => {
    setEditingId(comm.id); setTargetType(comm.target_type); setTargetId(comm.target_id ?? ""); setContent(comm.content); setIsUrgent(comm.is_urgent); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!content.trim()) return toast.error("Le message ne peut pas être vide");
    if (targetType !== "all" && !targetId) return toast.error("Veuillez sélectionner une cible");
    try {
      setSaving(true);
      const payload = { target_type: targetType, target_id: targetType === "all" ? null : targetId, content, is_urgent: isUrgent ? 1 : 0 };
      const res = editingId !== null ? await apiClient.updateCommunication(editingId, payload) : await apiClient.saveCommunication(payload);
      if (res.error) throw new Error(res.error.message);
      toast.success(editingId ? "Message mis à jour !" : "Message publié avec succès !");
      resetForm(); fetchAll();
    } catch (error: any) {
      toast.error(error.message || "Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer définitivement ce message ?")) return;
    try {
      const { error } = await apiClient.deleteCommunication(id);
      if (error) throw new Error(error.message);
      toast.success("Message supprimé");
      fetchAll();
    } catch (err: any) { toast.error(err.message || "Erreur de suppression"); }
  };

  // --- Fonctions Email ---
  const resetEmailForm = () => {
    setEmailSubject(""); setEmailContent(""); setEmailTargetType("all"); setEmailTargetId("");
    
    // Date immédiate par défaut (arrondie à la minute)
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setEmailScheduledAt(now.toISOString().slice(0, 16));
    
    setShowEmailForm(false);
  };

  const handleSaveEmail = async () => {
    if (!emailSubject.trim()) return toast.error("Le sujet e-mail est requis");
    if (!emailContent.trim()) return toast.error("Le contenu e-mail est requis");
    if (emailTargetType !== "all" && !emailTargetId) return toast.error("Veuillez sélectionner une cible");
    if (!emailScheduledAt) return toast.error("Veuillez sélectionner une date d'envoi");

    // Convertir l'heure locale HTML5 en format MySQL (UTC ou Local, ici on garde le format datetime standard local)
    const sqlDatetime = emailScheduledAt.replace("T", " ") + ":00";

    try {
      setSavingEmail(true);
      const payload = {
        subject: emailSubject,
        content: emailContent,
        target_type: emailTargetType,
        target_id: emailTargetType === "all" ? null : emailTargetId,
        scheduled_at: sqlDatetime
      };
      const res = await apiClient.createEmailCampaign(payload);
      if (res.error) throw new Error(res.error.message);
      toast.success("Campagne d'e-mails programmée !");
      resetEmailForm(); fetchAll();
    } catch (error: any) {
      toast.error(error.message || "Erreur réseau");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleDeleteEmail = async (id: number) => {
    if (!window.confirm("Annuler/Supprimer cette campagne d'e-mails ?")) return;
    try {
      const { error } = await apiClient.deleteEmailCampaign(id);
      if (error) throw new Error(error.message);
      toast.success("Campagne supprimée");
      fetchAll();
    } catch (err: any) { toast.error(err.message || "Erreur de suppression"); }
  };


  const groupLabel = (type: string, id: string | null) => {
    if (type === "all") return "🌐 Tous les adhérents";
    if (type === "group") {
      const g = groups.find((x) => String(x.id) === String(id));
      return `👥 Groupe : ${g ? g.name : id}`;
    }
    if (type === "user") {
      const c = clients.find((x) => x.id === id);
      return `👤 Adhérent : ${c ? `${c.first_name} ${c.last_name}` : id}`;
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Communications
              </h1>
              <p className="text-sm text-muted-foreground">
                {role === "admin" ? "Gestion des messages et e-mails" : "Gestion des messages et e-mails"}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="inapp" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="inapp" className="flex gap-2"><MessageCircle className="w-4 h-4" /> Dans l'application</TabsTrigger>
            <TabsTrigger value="email" className="flex gap-2"><Mail className="w-4 h-4" /> E-mails programmables</TabsTrigger>
          </TabsList>

          {/* ONGLET 1: IN APP */}
          <TabsContent value="inapp">
            <div className="flex justify-end mb-4">
              {!showForm && (
                <Button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Message interne
                </Button>
              )}
            </div>

            {/* Formulaire In-App */}
            {showForm && (
              <Card className="mb-6 border-primary/30 bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {editingId ? <Pencil className="h-5 w-5 text-primary" /> : <Send className="h-5 w-5 text-primary" />}
                    {editingId ? "Modifier le message interne" : "Rédiger un message interne"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Destinataire</Label>
                      <Select value={targetType} onValueChange={(val: any) => { setTargetType(val); setTargetId(""); }} disabled={editingId !== null}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">🌐 Tous les adhérents</SelectItem>
                          <SelectItem value="group">👥 Un groupe spécifique</SelectItem>
                          <SelectItem value="user">👤 Un adhérent spécifique</SelectItem>
                        </SelectContent>
                      </Select>
                      {editingId !== null && <p className="text-xs text-muted-foreground italic">La cible ne peut pas être modifiée.</p>}
                    </div>
                    {targetType === "group" && (
                      <div className="space-y-2">
                        <Label>Groupe</Label>
                        <Select value={targetId} onValueChange={setTargetId} disabled={editingId !== null}>
                          <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                          <SelectContent>
                            {groups.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {targetType === "user" && (
                      <div className="space-y-2">
                        <Label>Adhérent</Label>
                        <Select value={targetId} onValueChange={setTargetId} disabled={editingId !== null}>
                          <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                          <SelectContent>
                            {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                    <Switch id="urgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
                    <Label htmlFor="urgent" className="flex items-center gap-2 cursor-pointer">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span><strong className="text-destructive">Message urgent</strong> — s'affiche en rouge</span>
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Contenu du message</Label>
                    <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Rédigez..." rows={5} />
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <Button variant="outline" onClick={resetForm} disabled={saving}><X className="h-4 w-4 mr-1" /> Annuler</Button>
                    <Button onClick={handleSave} disabled={saving}><Send className="h-4 w-4 mr-2" /> Publier</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Liste In-App */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Messages publiés dans l'application ({communications.length})</CardTitle></CardHeader>
              <CardContent>
                {loading ? <p className="text-muted-foreground text-center py-6">Chargement...</p> : communications.length === 0 ? (
                  <p className="text-muted-foreground italic text-center py-6">Aucun message interne publié.</p>
                ) : (
                  <div className="space-y-4">
                    {communications.map((comm) => (
                      <div key={comm.id} className={`relative rounded-lg p-5 border shadow-sm ${comm.is_urgent ? "bg-destructive/10 border-destructive/40" : "bg-muted/40"}`}>
                        <div className="flex flex-wrap items-center gap-2 mb-3 pr-20">
                          {comm.is_urgent && <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Urgent</Badge>}
                          <Badge variant={comm.target_type === "all" ? "default" : "secondary"}>{groupLabel(comm.target_type, comm.target_id)}</Badge>
                          <span className="text-xs text-muted-foreground ml-auto">{new Date(comm.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap text-sm">{comm.content}</p>
                        <div className="flex gap-1 absolute top-3 right-3">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(comm)}><Pencil className="h-4 w-4 text-primary" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(comm.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ONGLET 2: EMAIL PROGRAMMABLES */}
          <TabsContent value="email">
            <div className="flex justify-end mb-4">
              {!showEmailForm && (
                <Button onClick={() => { resetEmailForm(); setShowEmailForm(true); }} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Planifier un E-mail
                </Button>
              )}
            </div>

            {/* Formulaire Email */}
            {showEmailForm && (
              <Card className="mb-6 border-blue-500/30 bg-blue-500/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-500" /> Programmer une campagne e-mail
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Destinataires e-mail</Label>
                      <Select value={emailTargetType} onValueChange={(val: any) => { setEmailTargetType(val); setEmailTargetId(""); }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">🌐 Tous les adhérents</SelectItem>
                          <SelectItem value="group">👥 Un groupe spécifique</SelectItem>
                          <SelectItem value="user">👤 Un adhérent spécifique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {emailTargetType === "group" && (
                      <div className="space-y-2">
                        <Label>Séléctionner le groupe</Label>
                        <Select value={emailTargetId} onValueChange={setEmailTargetId}>
                          <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                          <SelectContent>
                            {groups.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {emailTargetType === "user" && (
                      <div className="space-y-2">
                        <Label>Sélectionner l'adhérent</Label>
                        <Select value={emailTargetId} onValueChange={setEmailTargetId}>
                          <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                          <SelectContent>
                            {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sujet de l'e-mail</Label>
                      <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Ex: Informations sur la rentrée..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Date d'envoi programmée</Label>
                      <Input type="datetime-local" value={emailScheduledAt} onChange={e => setEmailScheduledAt(e.target.value)} />
                      <p className="text-xs text-muted-foreground">Une fois cette date atteinte, l'e-mail sera envoyé dans l'heure.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Contenu de l'e-mail</Label>
                    <Textarea value={emailContent} onChange={e => setEmailContent(e.target.value)} placeholder="Rédigez le contenu de votre email ici..." rows={7} />
                    <p className="text-xs text-muted-foreground italic">
                      L'e-mail démarrera automatiquement par "Bonjour Prénom," et se terminera par la signature "L'équipe AGheal".
                    </p>
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <Button variant="outline" onClick={resetEmailForm} disabled={savingEmail}><X className="h-4 w-4 mr-1" /> Annuler</Button>
                    <Button onClick={handleSaveEmail} disabled={savingEmail}><Send className="h-4 w-4 mr-2" /> Programmer l'envoi</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Liste Email Campaigns */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Historique et E-mails en attente ({emailCampaigns.length})</CardTitle></CardHeader>
              <CardContent>
                {loading ? <p className="text-muted-foreground text-center py-6">Chargement...</p> : emailCampaigns.length === 0 ? (
                  <p className="text-muted-foreground italic text-center py-6">Aucune campagne d'e-mail existante.</p>
                ) : (
                  <div className="space-y-4">
                    {emailCampaigns.map((camp) => (
                      <div key={camp.id} className={`relative rounded-lg p-5 border shadow-sm ${camp.status === 'sent' ? "bg-green-500/5 border-green-500/20" : camp.status === 'failed' ? "bg-destructive/10 border-destructive/30" : "bg-blue-500/5 border-blue-500/20"}`}>
                        <div className="flex flex-wrap items-center gap-2 mb-3 pr-10">
                          {camp.status === 'pending' && <Badge className="bg-blue-500 hover:bg-blue-600"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>}
                          {camp.status === 'sent' && <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Envoyé</Badge>}
                          {camp.status === 'failed' && <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Échec</Badge>}
                          
                          <Badge variant="outline">{groupLabel(camp.target_type, camp.target_id)}</Badge>
                          
                          <span className="text-xs text-muted-foreground ml-auto">
                            Prévu le : {new Date(camp.scheduled_at).toLocaleString("fr-FR")}
                          </span>
                        </div>
                        <h4 className="font-semibold mb-1">Sujet : {camp.subject}</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap text-sm line-clamp-3">{camp.content}</p>
                        
                        {camp.status === 'pending' && (
                          <div className="flex gap-1 absolute top-3 right-3">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteEmail(camp.id)} title="Annuler et supprimer">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
