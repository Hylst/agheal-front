import { Link, useLocation } from 'react-router-dom';
import { Calendar, Users, History, Home, CalendarPlus, UserCheck, Settings, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { SettingsModal } from '@/components/SettingsModal';
import { InfoModal } from '@/components/InfoModal';

/**
 * Barre de navigation mobile — visible uniquement sur mobile (sm:hidden).
 * Affiche les raccourcis principaux selon le rôle de l'utilisateur.
 */
export function MobileNav() {
  const { role } = useAuth();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItem = (to: string, icon: React.ReactNode, label: string) => (
    <Link
      to={to}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs transition-colors',
        isActive(to)
          ? 'text-primary font-semibold'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      <span className="truncate max-w-[56px] text-center">{label}</span>
    </Link>
  );

  return (
    <>
      {/* Spacer pour éviter que le contenu soit caché derrière la nav */}
      <div className="h-16 sm:hidden" />

      {/* Barre de navigation fixe en bas */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t flex items-stretch sm:hidden">
        {navItem('/dashboard', <Home className="w-5 h-5" />, 'Accueil')}
        {navItem('/sessions', <Calendar className="w-5 h-5" />, 'Séances')}
        {navItem('/profile', <Users className="w-5 h-5" />, 'Profil')}
        {navItem('/history', <History className="w-5 h-5" />, 'Historique')}

        {(role === 'coach' || role === 'admin') && (
          navItem('/coach/clients', <UserCheck className="w-5 h-5" />, 'Clients')
        )}

        {(role === 'coach' || role === 'admin') && (
          navItem('/coach/sessions', <CalendarPlus className="w-5 h-5" />, 'Planning')
        )}

        {/* Bouton Info */}
        <button
          onClick={() => setInfoOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs transition-colors',
            infoOpen ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Info className="w-5 h-5" />
          <span>Info</span>
        </button>

        {/* Bouton Paramètres */}
        <button
          onClick={() => setSettingsOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs transition-colors',
            settingsOpen ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Settings className="w-5 h-5" />
          <span>Réglages</span>
        </button>
      </nav>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} role={role} />
      <InfoModal open={infoOpen} onOpenChange={setInfoOpen} role={role} />
    </>
  );
}

