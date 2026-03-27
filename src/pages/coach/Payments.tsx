import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, CreditCard, Banknote, Building2, Filter, BarChart3, TrendingUp, Users, Calendar, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  payment_method: "espece" | "cheque" | "virement" | null;
  renewal_date: string | null;
  received_by: string | null;
  comment: string | null;
  created_at: string;
  adherent_name: string;
  adherent_email: string;
  coach_name: string | null;
}

interface PaymentSummary {
  total: number;
  month_total: number;
  count: number;
  by_method: { payment_method: string; count: number; total: number }[];
  by_coach: { received_by: string; coach_name: string; count: number; total: number }[];
  by_month: { month: string; count: number; total: number }[];
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const METHOD_LABELS: Record<string, string> = {
  espece: "Espèce",
  cheque: "Chèque",
  virement: "Virement",
};

const METHOD_COLORS: Record<string, string> = {
  espece: "bg-green-500/15 text-green-600 border-green-500/30",
  cheque: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  virement: "bg-purple-500/15 text-purple-600 border-purple-500/30",
};

export default function Payments() {
  const navigate = useNavigate();
  const { role } = useAuth();

  // ─── State: lists ──────────────────────────────────────────────
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [coaches, setCoaches] = useState<Client[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── State: filters ────────────────────────────────────────────
  const [filterUser, setFilterUser] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterCoach, setFilterCoach] = useState("");

  // ─── State: form ───────────────────────────────────────────────
  const [formUserId, setFormUserId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formMethod, setFormMethod] = useState("");
  const [formCoach, setFormCoach] = useState("");
  const [formRenewalDate, setFormRenewalDate] = useState("");
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch data ────────────────────────────────────────────────
  const fetchPayments = async () => {
    const filters: Record<string, string> = {};
    if (filterUser && filterUser !== "__all__") filters.user_id = filterUser;
    if (filterMethod && filterMethod !== "__all__") filters.method = filterMethod;
    if (filterCoach && filterCoach !== "__all__") filters.received_by = filterCoach;

    const { data, error } = await apiClient.getPayments(filters);
    if (error) {
      toast.error(error.message);
    } else if (data?.data) {
      setPayments(data.data);
    }
  };

  const fetchSummary = async () => {
    const { data, error } = await apiClient.getPaymentsSummary();
    if (!error && data) {
      setSummary(data);
    }
  };

  const fetchClients = async () => {
    const { data } = await apiClient.getClients();
    if (data) {
      const all = Array.isArray(data) ? data : (data as any).clients || [];
      setClients(all.map((c: any) => ({ id: c.id, first_name: c.first_name, last_name: c.last_name, email: c.email })));
    }
  };

  const fetchCoaches = async () => {
    const { data } = await apiClient.getCoaches();
    if (data?.coaches) {
      setCoaches(data.coaches.map((c: any) => ({ id: c.id, first_name: c.first_name, last_name: c.last_name, email: c.email })));
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPayments(), fetchSummary(), fetchClients(), fetchCoaches()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [filterUser, filterMethod, filterCoach]);

  // ─── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserId || !formAmount || !formDate) {
      toast.error("Veuillez remplir les champs obligatoires (adhérent, montant, date).");
      return;
    }
    setSubmitting(true);
    const { error } = await apiClient.createPayment({
      user_id: formUserId,
      amount: parseFloat(formAmount),
      payment_date: formDate,
      payment_method: formMethod || null,
      renewal_date: formRenewalDate || null,
      received_by: formCoach || null,
      comment: formComment || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Règlement enregistré !");
      setFormUserId("");
      setFormAmount("");
      setFormDate(new Date().toISOString().split("T")[0]);
      setFormMethod("");
      setFormCoach("");
      setFormRenewalDate("");
      setFormComment("");
      fetchPayments();
      fetchSummary();
    }
  };

  // ─── Delete ────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce règlement ?")) return;
    const { error } = await apiClient.deletePayment(id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Règlement supprimé");
      fetchPayments();
      fetchSummary();
    }
  };

  // ─── Export CSV ────────────────────────────────────────────────
  const exportCsv = () => {
    if (payments.length === 0) {
      toast.info("Aucun règlement à exporter.");
      return;
    }
    const headers = ["Date", "Adhérent", "Email", "Montant (€)", "Mode", "Reçu par", "Date renouvellement", "Commentaire"];
    const rows = payments.map((p) => [
      formatDate(p.payment_date),
      p.adherent_name,
      p.adherent_email,
      p.amount ? Number(p.amount).toFixed(2) : "",
      p.payment_method ? METHOD_LABELS[p.payment_method] || p.payment_method : "",
      p.coach_name || "",
      p.renewal_date ? formatDate(p.renewal_date) : "",
      p.comment || "",
    ]);
    const bom = "\uFEFF";
    const csv = bom + [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reglements_agheal_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${payments.length} règlement(s) exporté(s) en CSV.`);
  };

  // ─── Helpers ───────────────────────────────────────────────────
  const formatCurrency = (v: number | string) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(v));

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR");

  const formatMonth = (m: string) => {
    const [y, mo] = m.split("-");
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    return `${months[parseInt(mo) - 1]} ${y}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 sm:p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Gestion des Règlements</h1>
              <p className="text-sm text-muted-foreground">Saisie, suivi et analyse des paiements</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Banknote className="w-4 h-4" />
              <span className="hidden sm:inline">Saisie & Historique</span>
              <span className="sm:hidden">Saisie</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Tableau de bord</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════ TAB 1: Saisie & Historique ═══════════════════ */}
          <TabsContent value="payments" className="space-y-6">
            {/* ─── Formulaire de saisie ──────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Enregistrer un règlement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Adhérent */}
                  <div className="space-y-2">
                    <Label htmlFor="pay-user">Adhérent *</Label>
                    <Select value={formUserId} onValueChange={setFormUserId}>
                      <SelectTrigger id="pay-user"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.last_name} {c.first_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Montant */}
                  <div className="space-y-2">
                    <Label htmlFor="pay-amount">Montant (€) *</Label>
                    <Input
                      id="pay-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                    />
                  </div>

                  {/* Date de réception */}
                  <div className="space-y-2">
                    <Label htmlFor="pay-date">Date de réception *</Label>
                    <Input
                      id="pay-date"
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                    />
                  </div>

                  {/* Mode de règlement */}
                  <div className="space-y-2">
                    <Label htmlFor="pay-method">Mode de règlement</Label>
                    <Select value={formMethod} onValueChange={setFormMethod}>
                      <SelectTrigger id="pay-method"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="espece">Espèce</SelectItem>
                        <SelectItem value="cheque">Chèque</SelectItem>
                        <SelectItem value="virement">Virement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Coach destinataire */}
                  <div className="space-y-2">
                    <Label htmlFor="pay-coach">Reçu par (Coach)</Label>
                    <Select value={formCoach} onValueChange={setFormCoach}>
                      <SelectTrigger id="pay-coach"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                      <SelectContent>
                        {coaches.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.first_name} {c.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date de renouvellement */}
                  <div className="space-y-2">
                    <Label htmlFor="pay-renewal">Date renouvellement</Label>
                    <Input
                      id="pay-renewal"
                      type="date"
                      value={formRenewalDate}
                      onChange={(e) => setFormRenewalDate(e.target.value)}
                    />
                  </div>

                  {/* Commentaire */}
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label htmlFor="pay-comment">Commentaire</Label>
                    <Textarea
                      id="pay-comment"
                      placeholder="Notes optionnelles..."
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <Button type="submit" disabled={submitting} className="w-full sm:w-auto bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700">
                      <CreditCard className="w-4 h-4 mr-2" />
                      {submitting ? "Enregistrement..." : "Enregistrer le règlement"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* ─── Filtres ───────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Filter className="w-4 h-4" />
                  Filtrer l'historique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger><SelectValue placeholder="Tous les adhérents" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tous les adhérents</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.last_name} {c.first_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterMethod} onValueChange={setFilterMethod}>
                    <SelectTrigger><SelectValue placeholder="Tous les modes" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tous les modes</SelectItem>
                      <SelectItem value="espece">Espèce</SelectItem>
                      <SelectItem value="cheque">Chèque</SelectItem>
                      <SelectItem value="virement">Virement</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCoach} onValueChange={setFilterCoach}>
                    <SelectTrigger><SelectValue placeholder="Tous les coachs" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tous les coachs</SelectItem>
                      {coaches.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(filterUser || filterMethod || filterCoach) && (
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFilterUser(""); setFilterMethod(""); setFilterCoach(""); }}>
                    Réinitialiser les filtres
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* ─── Liste des règlements ──────────────────────────────── */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Historique ({payments.length} règlement{payments.length !== 1 && "s"})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportCsv}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exporter CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Aucun règlement trouvé.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2 pr-3">Date</th>
                          <th className="pb-2 pr-3">Adhérent</th>
                          <th className="pb-2 pr-3">Montant</th>
                          <th className="pb-2 pr-3">Mode</th>
                          <th className="pb-2 pr-3">Reçu par</th>
                          <th className="pb-2 pr-3 hidden lg:table-cell">Commentaire</th>
                          {role === "admin" && <th className="pb-2"></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="py-2.5 pr-3 whitespace-nowrap">{formatDate(p.payment_date)}</td>
                            <td className="py-2.5 pr-3">
                              <span className="font-medium">{p.adherent_name}</span>
                            </td>
                            <td className="py-2.5 pr-3 font-semibold whitespace-nowrap">{p.amount ? formatCurrency(p.amount) : "—"}</td>
                            <td className="py-2.5 pr-3">
                              {p.payment_method ? (
                                <Badge variant="outline" className={METHOD_COLORS[p.payment_method] || ""}>
                                  {METHOD_LABELS[p.payment_method] || p.payment_method}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="py-2.5 pr-3">{p.coach_name || "—"}</td>
                            <td className="py-2.5 pr-3 hidden lg:table-cell max-w-[200px] truncate text-muted-foreground">
                              {p.comment || "—"}
                            </td>
                            {role === "admin" && (
                              <td className="py-2.5">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════ TAB 2: Tableau de bord ═══════════════════ */}
          <TabsContent value="dashboard" className="space-y-6">
            {summary && (
              <>
                {/* KPIs */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total encaissé</p>
                          <p className="text-2xl font-bold">{formatCurrency(summary.total)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Ce mois-ci</p>
                          <p className="text-2xl font-bold">{formatCurrency(summary.month_total)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Nb. règlements</p>
                          <p className="text-2xl font-bold">{summary.count}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Par mode de règlement */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        Par mode de règlement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {summary.by_method.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Aucune donnée</p>
                      ) : (
                        <div className="space-y-3">
                          {summary.by_method.map((m) => (
                            <div key={m.payment_method} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={METHOD_COLORS[m.payment_method] || ""}>
                                  {METHOD_LABELS[m.payment_method] || m.payment_method}
                                </Badge>
                                <span className="text-sm text-muted-foreground">({m.count})</span>
                              </div>
                              <span className="font-semibold">{formatCurrency(m.total)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Par coach */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Par coach
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {summary.by_coach.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Aucune donnée</p>
                      ) : (
                        <div className="space-y-3">
                          {summary.by_coach.map((c) => (
                            <div key={c.received_by} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{c.coach_name || "Inconnu"}</span>
                                <span className="text-sm text-muted-foreground">({c.count})</span>
                              </div>
                              <span className="font-semibold">{formatCurrency(c.total)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Par mois (6 derniers) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Évolution mensuelle (6 derniers mois)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {summary.by_month.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Aucune donnée</p>
                    ) : (
                      <div className="space-y-2">
                        {summary.by_month.map((m) => {
                          const maxTotal = Math.max(...summary.by_month.map((x) => x.total), 1);
                          const pct = (m.total / maxTotal) * 100;
                          return (
                            <div key={m.month} className="flex items-center gap-3">
                              <span className="w-20 text-sm text-muted-foreground shrink-0">{formatMonth(m.month)}</span>
                              <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold w-24 text-right">{formatCurrency(m.total)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
