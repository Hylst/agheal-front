import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, AlertCircle, Send, MessageSquare, Pencil, X, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";

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

interface Group { id: number; name: string; }
interface Client { id: string; first_name: string; last_name: string; }

export default function Communications() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [communications, setCommunications] = useState<Communication[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // État du formulaire
  const [editingId, setEditingId] = useState<number | null>(null);
  const [targetType, setTargetType] = useState<"all" | "group" | "user">("all");
  const [targetId, setTargetId] = useState<string>("");
  const [content, setContent] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);

      // Appels parallèles et indépendants
      const [commsRes, groupsRes, clientsRes] = await Promise.all([
        apiClient.getCommunicationsTargets(),
        apiClient.getGroups(),
        apiClient.getClients(),
      ]);

      if (!commsRes.error) {
        const raw = (commsRes.data as any)?.data ?? [];
        setCommunications(raw);
      }

      if (!groupsRes.error) {
        const data = groupsRes.data as any;
        const raw = Array.isArray(data) ? data : (data?.groups ?? []);
        setGroups(raw);
      } else {
        console.warn("Groupes : ", groupsRes.error.message);
      }

      if (!clientsRes.error) {
        const data = clientsRes.data as any;
        const raw = Array.isArray(data) ? data : (data?.clients ?? []);
        setClients(raw);
      } else {
        console.warn("Clients : ", clientsRes.error.message);
      }
    } catch (error) {
      console.error("Erreur fetchAll:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTargetType("all");
    setTargetId("");
    setContent("");
    setIsUrgent(false);
    setShowForm(false);
  };

  const startEdit = (comm: Communication) => {
    setEditingId(comm.id);
    setTargetType(comm.target_type);
    setTargetId(comm.target_id ?? "");
    setContent(comm.content);
    setIsUrgent(comm.is_urgent);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Le message ne peut pas être vide");
      return;
    }
    if (targetType !== "all" && !targetId) {
      toast.error("Veuillez sélectionner une cible (groupe ou adhérent)");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        target_type: targetType,
        target_id: targetType === "all" ? null : targetId,
        content,
        is_urgent: isUrgent ? 1 : 0,
      };

      let res;
      if (editingId !== null) {
        // Mise à jour (PUT)
        res = await apiClient.updateCommunication(editingId, payload);
      } else {
        // Création (POST)
        res = await apiClient.saveCommunication(payload);
      }

      if (res.error) {
        toast.error(`Erreur : ${res.error.message}`);
        return;
      }

      toast.success(editingId ? "Message mis à jour !" : "Message publié avec succès !");
      resetForm();
      fetchAll();
    } catch (error) {
      console.error("Erreur handleSave:", error);
      toast.error("Erreur réseau lors de la publication");
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
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression");
    }
  };

  const groupLabel = (comm: Communication) => {
    if (comm.target_type === "all") return "🌐 Tous les adhérents";
    if (comm.target_type === "group") {
      const g = groups.find((x) => String(x.id) === String(comm.target_id));
      return `👥 Groupe : ${g ? g.name : comm.target_id}`;
    }
    if (comm.target_type === "user") {
      const c = clients.find((x) => x.id === comm.target_id);
      return `👤 ${c ? `${c.first_name} ${c.last_name}` : (comm.first_name ? `${comm.first_name} ${comm.last_name}` : "Adhérent")}`;
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
                {role === "admin" ? "Gestion des messages (Administrateur)" : "Gestion des messages (Coach)"}
              </p>
            </div>
          </div>
          {!showForm && (
            <Button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouveau message
            </Button>
          )}
        </div>

        {/* Formulaire (création ou édition) */}
        {showForm && (
          <Card className="mb-6 border-primary/30 bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {editingId ? <Pencil className="h-5 w-5 text-primary" /> : <Send className="h-5 w-5 text-primary" />}
                {editingId ? "Modifier le message" : "Rédiger un message"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Ciblage — désactivé en mode édition (la cible ne change pas) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destinataire</label>
                  <Select
                    value={targetType}
                    onValueChange={(val: any) => { setTargetType(val); setTargetId(""); }}
                    disabled={editingId !== null}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🌐 Tous les adhérents</SelectItem>
                      <SelectItem value="group">👥 Un groupe spécifique</SelectItem>
                      <SelectItem value="user">👤 Un adhérent spécifique</SelectItem>
                    </SelectContent>
                  </Select>
                  {editingId !== null && (
                    <p className="text-xs text-muted-foreground italic">
                      La cible ne peut pas être modifiée. Supprimez et recréez si besoin.
                    </p>
                  )}
                </div>

                {targetType === "group" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Groupe destinataire</label>
                    <Select value={targetId} onValueChange={setTargetId} disabled={editingId !== null}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir le groupe..." />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.length === 0 ? (
                          <SelectItem value="_none" disabled>Aucun groupe disponible</SelectItem>
                        ) : (
                          groups.map((g) => (
                            <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {targetType === "user" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Adhérent destinataire</label>
                    <Select value={targetId} onValueChange={setTargetId} disabled={editingId !== null}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir l'adhérent..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.length === 0 ? (
                          <SelectItem value="_none" disabled>Aucun adhérent disponible</SelectItem>
                        ) : (
                          clients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.first_name} {c.last_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Urgence */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                <Switch id="urgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
                <label htmlFor="urgent" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span>
                    <strong className="text-destructive">Message urgent</strong>
                    {" "}— s'affiche en rouge sur le tableau de bord des destinataires
                  </span>
                </label>
              </div>

              {/* Contenu */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Contenu du message</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Rédigez votre message ici..."
                  rows={5}
                  className="resize-y min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">{content.length} caractère{content.length !== 1 ? "s" : ""}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={resetForm} disabled={saving}>
                  <X className="h-4 w-4 mr-1" /> Annuler
                </Button>
                <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                  {editingId ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  {saving ? "Enregistrement..." : editingId ? "Enregistrer les modifications" : "Publier le message"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des messages publiés */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Messages publiés ({communications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-6">Chargement...</p>
            ) : communications.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground italic">Aucun message publié pour le moment.</p>
                <Button variant="outline" onClick={() => { resetForm(); setShowForm(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Rédiger le premier message
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {communications.map((comm) => (
                  <div
                    key={comm.id}
                    className={`relative rounded-lg p-5 border shadow-sm transition-all
                      ${comm.is_urgent
                        ? "bg-destructive/10 border-destructive/40"
                        : "bg-muted/40 border-border"
                      }
                      ${editingId === comm.id ? "ring-2 ring-primary" : ""}
                    `}
                  >
                    {/* En-tête */}
                    <div className="flex flex-wrap items-center gap-2 mb-3 pr-20">
                      {comm.is_urgent && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Urgent
                        </Badge>
                      )}
                      <Badge variant={comm.target_type === "all" ? "default" : comm.target_type === "group" ? "secondary" : "outline"}>
                        {groupLabel(comm)}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                        {new Date(comm.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit", month: "long", year: "numeric"
                        })}
                      </span>
                    </div>

                    {/* Contenu */}
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm">{comm.content}</p>

                    {/* Actions */}
                    <div className="flex gap-1 absolute top-3 right-3">
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-primary opacity-70 hover:opacity-100"
                        title="Modifier"
                        onClick={() => startEdit(comm)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-destructive opacity-70 hover:opacity-100"
                        title="Supprimer"
                        onClick={() => handleDelete(comm.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
