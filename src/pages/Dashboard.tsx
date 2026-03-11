import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, MapPin, LogOut, Settings, Dumbbell, CalendarPlus, FolderOpen, UserCheck, Info, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SettingsModal } from '@/components/SettingsModal';

export default function Dashboard() {
  const { user, role, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AGHeal & Adapt'Movement</h1>
              <p className="text-sm text-muted-foreground">
                {role === 'admin' ? 'Administrateur' : role === 'coach' ? 'Coach' : 'Adhérent'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Bienvenue, {user?.first_name || 'Utilisateur'} !
          </h2>
          <p className="text-muted-foreground">
            Tableau de bord {role === 'admin' ? 'administrateur' : role === 'coach' ? 'coach' : 'adhérent'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Séances */}
          <Card className="hover:shadow-primary transition-all cursor-pointer hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-2">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Séances</CardTitle>
              <CardDescription>
                {role === 'coach' || role === 'admin'
                  ? 'Gérer les séances sportives'
                  : 'Consulter et s\'inscrire aux séances'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/sessions">
                <Button className="w-full shadow-primary">
                  {role === 'coach' || role === 'admin' ? 'Gérer' : 'Voir le planning'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card Profil */}
          <Card className="hover:shadow-secondary transition-all cursor-pointer hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Profil</CardTitle>
              <CardDescription>Gérer vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/profile">
                <Button variant="secondary" className="w-full shadow-secondary">
                  Voir mon profil
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card Informations */}
          <Card className="hover:shadow-accent transition-all cursor-pointer hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-lime-500 to-green-500 rounded-xl flex items-center justify-center mb-2">
                <Info className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Informations</CardTitle>
              <CardDescription>À propos d'AGHeal et nos offres</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/information">
                <Button className="w-full bg-gradient-to-br from-lime-500 to-green-500">
                  En savoir plus
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card Historique */}
          <Card className="hover:shadow-accent transition-all cursor-pointer hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-zinc-600 rounded-xl flex items-center justify-center mb-2">
                <History className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Historique</CardTitle>
              <CardDescription>Consulter mes séances passées</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/history">
                <Button className="w-full bg-gradient-to-br from-slate-500 to-zinc-600">
                  Voir l'historique
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card Lieux (Coach/Admin) */}
          {(role === 'coach' || role === 'admin') && (
            <Card className="hover:shadow-accent transition-all cursor-pointer hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mb-2">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Lieux</CardTitle>
                <CardDescription>Gérer les lieux de séances</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/coach/locations">
                  <Button className="w-full bg-gradient-accent shadow-accent">
                    Gérer les lieux
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Card Activités (Coach/Admin) */}
          {(role === 'coach' || role === 'admin') && (
            <Card className="hover:shadow-accent transition-all cursor-pointer hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-2">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Activités</CardTitle>
                <CardDescription>Gérer les types de séances</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/coach/activities">
                  <Button className="w-full bg-gradient-to-br from-purple-500 to-pink-500">
                    Gérer les activités
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Card Planification (Coach/Admin) */}
          {(role === 'coach' || role === 'admin') && (
            <Card className="hover:shadow-accent transition-all cursor-pointer hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-2">
                  <CalendarPlus className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Planification</CardTitle>
                <CardDescription>Programmer des séances</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/coach/schedule">
                  <Button className="w-full bg-gradient-to-br from-blue-500 to-cyan-500">
                    Planifier
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Card Clients (Coach/Admin) */}
          {(role === 'coach' || role === 'admin') && (
            <Card className="hover:shadow-accent transition-all cursor-pointer hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-2">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Clients</CardTitle>
                <CardDescription>Gérer les adhérents et leurs groupes</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/coach/clients">
                  <Button className="w-full bg-gradient-to-br from-emerald-500 to-teal-500">
                    Voir les clients
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Card Groupes (Coach/Admin) */}
          {(role === 'coach' || role === 'admin') && (
            <Card className="hover:shadow-accent transition-all cursor-pointer hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-2">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Groupes</CardTitle>
                <CardDescription>Gérer les groupes d'adhérents</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/coach/groups">
                  <Button className="w-full bg-gradient-to-br from-orange-500 to-amber-500">
                    Gérer les groupes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Section stats rapides */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">0</p>
                <p className="text-sm text-muted-foreground mt-2">Séances à venir</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-secondary">0</p>
                <p className="text-sm text-muted-foreground mt-2">Inscriptions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-accent">0</p>
                <p className="text-sm text-muted-foreground mt-2">Activités</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        role={role}
      />
    </div>
  );
}
