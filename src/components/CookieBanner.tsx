import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CookieSettings } from './CookieSettings';

const COOKIE_KEY = 'agheal_cookie_notice_accepted';

/**
 * Bandeau d'information cookies — RGPD
 * Affiché une seule fois (première visite). Cookie JWT = strictement nécessaire,
 * donc AUCUN consentement explicite obligatoire selon ePrivacy / RGPD.
 * Ce bandeau est purement informatif (transparence).
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // N'affiche le bandeau que si l'utilisateur ne l'a pas encore fermé
    const accepted = localStorage.getItem(COOKIE_KEY);
    if (!accepted) {
      // Légère temporisation pour ne pas apparaître avant le rendu de la page
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(COOKIE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-16 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl
                 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg
                 flex flex-col sm:flex-row items-center sm:items-start gap-3 px-4 py-3
                 animate-in slide-in-from-bottom-4 duration-300"
      role="alertdialog"
      aria-label="Information sur l'utilisation des cookies"
    >
      {/* Icône cookie */}
      <span className="text-xl flex-shrink-0 hidden sm:block" aria-hidden="true">🍪</span>

      {/* Texte informatif */}
      <div className="flex-1 flex flex-col gap-2 sm:gap-1 w-full text-center sm:text-left text-xs text-muted-foreground leading-relaxed">
        <p>Cette application utilise uniquement des <strong className="text-foreground">cookies techniques essentiels</strong> pour
        maintenir votre session (authentification). Aucun cookie publicitaire ou de traçage.</p>
        <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 sm:mt-0">
          <CookieSettings />
          <button
            onClick={dismiss}
            className="sm:hidden text-primary underline underline-offset-2 hover:text-primary/80 transition-colors whitespace-nowrap"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Bouton fermer (Desktop) */}
      <button
        onClick={dismiss}
        className="hidden sm:block flex-shrink-0 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
        aria-label="Fermer le bandeau cookies"
      >
        J'ai compris
      </button>

      {/* Croix discrète pour fermer (Desktop) */}
      <button
        onClick={dismiss}
        className="hidden sm:block flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}


