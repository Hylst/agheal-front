import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft, BarChart3, Users, Calendar, CreditCard,
  ClipboardList, Download, ChevronDown, ChevronUp,
  TrendingUp, AlertTriangle, CheckCircle2,
  UserCheck, FileText, RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Types légers ──────────────────────────────────────────────────────────────
type Tab = 'overview' | 'sessions' | 'attendance' | 'members' | 'payments' | 'logs';

// ─── Composant StatCard ─────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color = 'text-primary', alert = false,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: string; alert?: boolean;
}) {
  return (
    <Card className={`${alert ? 'border-orange-400' : ''}`}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg bg-muted ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Mini bar chart (CSS pur) ───────────────────────────────────────────────────
function MiniBarChart({ data, labelKey, valueKey, colorClass = 'bg-primary' }: {
  data: any[]; labelKey: string; valueKey: string; colorClass?: string;
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-24 shrink-0 text-right truncate">{d[labelKey]}</span>
          <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
            <div
              className={`h-full ${colorClass} rounded-full transition-all`}
              style={{ width: `${Math.max((Number(d[valueKey]) / max) * 100, 2)}%` }}
            />
          </div>
          <span className="text-xs font-semibold w-8 text-right">{d[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function Stats() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState(6);
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState<any>(null);
  const [sessions, setSessions] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [members, setMembers] = useState<any>(null);
  const [payments, setPayments] = useState<any>(null);
  const [logs, setLogs] = useState<any>(null);

  // Session detail expand
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<Record<string, any>>({});

  const load = useCallback(async (t: Tab, p: number) => {
    setLoading(true);
    try {
      switch (t) {
        case 'overview': {
          const { data, error } = await apiClient.getStatsOverview();
          if (error) throw new Error(error.message);
          setOverview(data);
          break;
        }
        case 'sessions': {
          const { data, error } = await apiClient.getStatsSessions(p);
          if (error) throw new Error(error.message);
          setSessions(data);
          break;
        }
        case 'attendance': {
          const { data, error } = await apiClient.getStatsAttendance(p);
          if (error) throw new Error(error.message);
          setAttendance(data);
          break;
        }
        case 'members': {
          const { data, error } = await apiClient.getStatsMembersOverview();
          if (error) throw new Error(error.message);
          setMembers(data);
          break;
        }
        case 'payments': {
          const { data, error } = await apiClient.getStatsPayments(p);
          if (error) throw new Error(error.message);
          setPayments(data);
          break;
        }
        case 'logs': {
          const { data, error } = await apiClient.getStatsLogs(100);
          if (error) throw new Error(error.message);
          setLogs(data);
          break;
        }
      }
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(tab, period); }, [tab, period, load]);

  const switchTab = (t: Tab) => { setTab(t); setExpandedSession(null); };

  const loadSessionDetail = async (sessionId: string) => {
    if (sessionDetail[sessionId]) return; // already loaded
    const { data } = await apiClient.getStatsSessionDetail(sessionId);
    if (data) setSessionDetail((prev) => ({ ...prev, [sessionId]: data }));
  };

  const toggleSession = (id: string) => {
    if (expandedSession === id) {
      setExpandedSession(null);
    } else {
      setExpandedSession(id);
      loadSessionDetail(id);
    }
  };

  const TAB_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview',   label: "Vue d'ensemble",  icon: BarChart3 },
    { id: 'sessions',   label: 'Séances',         icon: Calendar },
    { id: 'attendance', label: 'Présences',        icon: UserCheck },
    { id: 'members',    label: 'Adhérents',        icon: Users },
    { id: 'payments',   label: 'Paiements',        icon: CreditCard },
    { id: 'logs',       label: 'Logs',             icon: ClipboardList },
  ];

  const PERIOD_OPTIONS = [
    { v: 3, l: '3 mois' }, { v: 6, l: '6 mois' }, { v: 12, l: '12 mois' }, { v: 24, l: '24 mois' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-8">

        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />Retour au tableau de bord
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-primary" />
                Statistiques & Historique
              </h1>
              <p className="text-muted-foreground mt-1">Réservé aux coachs et administrateurs</p>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {tab !== 'overview' && tab !== 'logs' && tab !== 'members' && (
                <select
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                  className="text-sm border rounded-md px-3 py-1.5 bg-card"
                >
                  {PERIOD_OPTIONS.map((o) => (
                    <option key={o.v} value={o.v}>{o.l}</option>
                  ))}
                </select>
              )}
              <Button variant="outline" size="sm" onClick={() => load(tab, period)} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button variant="outline" size="sm" onClick={() => apiClient.downloadSessionsCsv(period)}>
                <Download className="w-4 h-4 mr-1" />Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap mb-6 p-1 bg-muted rounded-xl">
          {TAB_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-card shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <>
            {/* ═══ TAB: Overview ═══════════════════════════════════════════════ */}
            {tab === 'overview' && overview && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Adhérents</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label="Total adhérents"   value={overview.members.total}          icon={Users}       color="text-blue-600" />
                  <StatCard label="Comptes actifs"    value={overview.members.active}         icon={CheckCircle2} color="text-green-600" />
                  <StatCard label="Paiements en attente" value={overview.members.pending_payment} icon={AlertTriangle} color="text-orange-500" alert={overview.members.pending_payment > 0} />
                  <StatCard label="Certificats expirés" value={overview.members.expired_certif}  icon={AlertTriangle} color="text-red-500"    alert={overview.members.expired_certif > 0} />
                </div>
                <h2 className="text-lg font-semibold mt-2">Séances</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label="Séances passées"  value={overview.sessions.past}     icon={Calendar}  color="text-slate-600" />
                  <StatCard label="Séances à venir"  value={overview.sessions.upcoming} icon={TrendingUp} color="text-cyan-600" />
                  <StatCard label="Total présences"  value={overview.attendance.total}  icon={UserCheck}  color="text-green-600" />
                  <StatCard label="Taux de présence" value={`${overview.attendance.rate_pct}%`} icon={BarChart3} color="text-primary"
                    sub={overview.attendance.rate_pct >= 70 ? '✓ Bon taux' : '↓ À améliorer'}
                  />
                </div>
                <h2 className="text-lg font-semibold mt-2">Paiements ({overview.payments.current_year})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label={`Revenus ${overview.payments.current_year}`} value={`${Number(overview.payments.year_revenue).toFixed(2)} €`}
                    icon={CreditCard} color="text-emerald-600" />
                  <StatCard label="En attente" value={overview.payments.pending_count} icon={AlertTriangle}
                    color="text-orange-500" alert={overview.payments.pending_count > 0} />
                </div>
              </div>
            )}

            {/* ═══ TAB: Sessions ═══════════════════════════════════════════════ */}
            {tab === 'sessions' && sessions && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {sessions.sessions.length} séances trouvées depuis le {sessions.since}
                </p>
                {sessions.sessions.map((s: any) => (
                  <Card key={s.id} className="overflow-hidden">
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors"
                      onClick={() => toggleSession(s.id)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-foreground">{s.title}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{s.session_type}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge variant="outline">{format(new Date(s.date), 'd MMM yyyy', { locale: fr })}</Badge>
                          <span className="text-muted-foreground">{s.start_time}</span>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {s.count_attended}/{s.count_registered} présents
                          </Badge>
                          {expandedSession === s.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </button>
                    {expandedSession === s.id && (
                      <div className="px-4 pb-4 border-t bg-muted/20">
                        {sessionDetail[s.id] ? (
                          <div className="mt-3 space-y-1">
                            <p className="text-xs text-muted-foreground mb-2">
                              Coach : <span className="font-medium text-foreground">{sessionDetail[s.id].session.coach_name}</span>
                              {'  ·  '}Lieu : {sessionDetail[s.id].session.location ?? '—'}
                            </p>
                            {sessionDetail[s.id].attendees.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Aucun inscrit.</p>
                            ) : (
                              <div className="divide-y">
                                {sessionDetail[s.id].attendees.map((a: any) => (
                                  <div key={a.user_id} className="flex items-center justify-between py-1.5 text-sm">
                                    <span>{a.first_name} {a.last_name}</span>
                                    {a.attended
                                      ? <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Présent</Badge>
                                      : <Badge variant="outline" className="text-xs">Absent</Badge>
                                    }
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-3">Chargement...</p>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
                {sessions.sessions.length === 0 && (
                  <p className="text-center text-muted-foreground py-12">Aucune séance trouvée pour cette période.</p>
                )}
              </div>
            )}

            {/* ═══ TAB: Attendance ═════════════════════════════════════════════ */}
            {tab === 'attendance' && attendance && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Par type de séance</CardTitle></CardHeader>
                    <CardContent>
                      {attendance.by_type.length === 0
                        ? <p className="text-sm text-muted-foreground">Aucune donnée.</p>
                        : <MiniBarChart data={attendance.by_type} labelKey="session_type" valueKey="total_attended" colorClass="bg-green-500" />
                      }
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Par mois</CardTitle></CardHeader>
                    <CardContent>
                      {attendance.by_month.length === 0
                        ? <p className="text-sm text-muted-foreground">Aucune donnée.</p>
                        : <MiniBarChart data={attendance.by_month} labelKey="month" valueKey="total_attended" colorClass="bg-primary" />
                      }
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader><CardTitle className="text-base">🏆 Top 10 membres les plus assidus</CardTitle></CardHeader>
                  <CardContent>
                    {attendance.top_members.length === 0
                      ? <p className="text-sm text-muted-foreground">Aucune donnée.</p>
                      : <MiniBarChart data={attendance.top_members} labelKey="name" valueKey="attended_count" colorClass="bg-amber-500" />
                    }
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Taux de présence par type</CardTitle></CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      {attendance.by_type.map((t: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-2 text-sm">
                          <span>{t.session_type}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground">{t.total_attended}/{t.total_registered} présents</span>
                            <Badge className={Number(t.attendance_rate) >= 70 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                              {t.attendance_rate}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ═══ TAB: Members ════════════════════════════════════════════════ */}
            {tab === 'members' && members && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Répartition par âge</CardTitle></CardHeader>
                    <CardContent>
                      <MiniBarChart data={members.age_brackets} labelKey="age_bracket" valueKey="count" colorClass="bg-blue-500" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Membres par groupe</CardTitle></CardHeader>
                    <CardContent>
                      {members.groups.length === 0
                        ? <p className="text-sm text-muted-foreground">Aucun groupe défini.</p>
                        : <>
                            <MiniBarChart data={members.groups} labelKey="group_name" valueKey="member_count" colorClass="bg-violet-500" />
                            {members.no_group_count > 0 && (
                              <p className="text-xs text-muted-foreground mt-3">{members.no_group_count} adhérent(s) sans groupe</p>
                            )}
                          </>
                      }
                    </CardContent>
                  </Card>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Statut paiement</CardTitle></CardHeader>
                    <CardContent>
                      <div className="divide-y">
                        {members.payment_status.map((r: any, i: number) => (
                          <div key={i} className="flex justify-between py-2 text-sm">
                            <span className="capitalize">{r.payment_status?.replace('_', ' ')}</span>
                            <Badge variant={r.payment_status === 'regle' ? 'default' : 'destructive'}>{r.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Certificats médicaux</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {members.certif && (
                        <>
                          <div className="flex justify-between py-1">
                            <span className="text-green-700">✓ Valides</span>
                            <Badge className="bg-green-100 text-green-800">{members.certif.valid ?? 0}</Badge>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-orange-600">⚠ Expirés</span>
                            <Badge className="bg-orange-100 text-orange-800">{members.certif.expired ?? 0}</Badge>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-red-600">✗ Manquants</span>
                            <Badge className="bg-red-100 text-red-800">{members.certif.missing ?? 0}</Badge>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader><CardTitle className="text-base">Nouvelles inscriptions (12 derniers mois)</CardTitle></CardHeader>
                  <CardContent>
                    {members.new_members_trend.length === 0
                      ? <p className="text-sm text-muted-foreground">Aucune donnée.</p>
                      : <MiniBarChart data={members.new_members_trend} labelKey="month" valueKey="count" colorClass="bg-teal-500" />
                    }
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ═══ TAB: Payments ═══════════════════════════════════════════════ */}
            {tab === 'payments' && payments && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label="Total encaissé" value={`${Number(payments.total).toFixed(2)} €`} icon={CreditCard} color="text-emerald-600" />
                  <StatCard label="Nb règlements" value={payments.count} icon={TrendingUp} color="text-blue-600" />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Par méthode de paiement</CardTitle></CardHeader>
                    <CardContent>
                      {payments.by_method.length === 0
                        ? <p className="text-sm text-muted-foreground">Aucun paiement enregistré.</p>
                        : (
                          <div className="divide-y">
                            {payments.by_method.map((m: any, i: number) => (
                              <div key={i} className="flex justify-between py-2 text-sm">
                                <span className="capitalize">{m.payment_method ?? 'Non défini'}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">{m.count}×</span>
                                  <Badge variant="outline">{Number(m.total).toFixed(2)} €</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Par mois</CardTitle></CardHeader>
                    <CardContent>
                      {payments.by_month.length === 0
                        ? <p className="text-sm text-muted-foreground">Aucune donnée.</p>
                        : <MiniBarChart data={payments.by_month} labelKey="month" valueKey="total" colorClass="bg-emerald-500" />
                      }
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ═══ TAB: Logs ═══════════════════════════════════════════════════ */}
            {tab === 'logs' && logs && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{logs.count} entrée(s) dans les logs de présences</p>
                  <Button variant="outline" size="sm" onClick={() => apiClient.downloadSessionsCsv(12)}>
                    <Download className="w-4 h-4 mr-1" />Export CSV (12 mois)
                  </Button>
                </div>
                {logs.logs.length === 0 && (
                  <p className="text-center text-muted-foreground py-12">Aucun log enregistré pour l'instant.</p>
                )}
                {logs.logs.map((log: any) => {
                  const d = log.details || {};
                  return (
                    <Card key={log.id}>
                      <CardContent className="pt-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-sm">
                              {d.session_title || 'Séance'}{' '}
                              <span className="font-normal text-muted-foreground text-xs">
                                {d.session_date} {d.session_time}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Coach : {d.coach_name || log.author_name || '—'}
                              {'  ·  '}Type : {d.session_type || '—'}
                              {'  ·  '}Lieu : {d.location || '—'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Pointé par {log.author_name} · {new Date(log.created_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              {d.count_attended}/{d.count_registered} présents
                            </Badge>
                            {(d.walk_ins_added > 0) && (
                              <Badge variant="outline" className="text-blue-600 border-blue-300">
                                +{d.walk_ins_added} walk-in
                              </Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => apiClient.downloadStatsLog(log.id)}
                            >
                              <FileText className="w-3 h-3 mr-1" /> JSON
                            </Button>
                          </div>
                        </div>
                        {d.attended && d.attended.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {d.attended.map((a: any, i: number) => (
                              <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                {a.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
