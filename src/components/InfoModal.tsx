import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Info, BookOpen, Scale, Shield, Mail, Phone, ExternalLink } from 'lucide-react';

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: 'admin' | 'coach' | 'adherent' | null;
}

export function InfoModal({ open, onOpenChange, role }: InfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Informations
          </DialogTitle>
          <DialogDescription>
            Tout savoir sur AGHeal &amp; Adapt'Movement
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="contact" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="contact" className="text-xs sm:text-sm gap-1">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="text-xs sm:text-sm gap-1">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">À propos</span>
            </TabsTrigger>
            <TabsTrigger value="guide" className="text-xs sm:text-sm gap-1">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Guide</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="text-xs sm:text-sm gap-1">
              <Scale className="w-4 h-4" />
              <span className="hidden sm:inline">Légal</span>
            </TabsTrigger>
            <TabsTrigger value="rgpd" className="text-xs sm:text-sm gap-1">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">RGPD</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            {/* ========================= */}
            {/* ONGLET 1 — CONTACT        */}
            {/* ========================= */}
            <TabsContent value="contact" className="mt-0 space-y-4">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Geoffroy Streit</h3>
                    <p className="text-sm text-muted-foreground">Créateur &amp; Administrateur de l'application</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Développeur d'applications web, mobile et desktop. Conception, réalisation et maintenance de l'écosystème numérique AGHeal.
                </p>
                <div className="space-y-3">
                  <a
                    href="mailto:geoffroy.streit.dev@gmail.com"
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/60 hover:bg-background transition-colors"
                  >
                    <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Email (questions techniques)</p>
                      <p className="text-xs text-muted-foreground">geoffroy.streit.dev@gmail.com</p>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
                  </a>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Téléphone (urgences uniquement)</p>
                      <p className="text-xs text-muted-foreground">06 77 13 75 38</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-muted/30">
                <h4 className="font-semibold mb-3">📋 Contacts pour les séances &amp; l'activité</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span><strong>Amandine</strong> — amandine.motsch@agheal.fr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span><strong>Guillaume</strong> — guillaume.trautmann@agheal.fr</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4 text-center text-sm text-muted-foreground">
                💡 Pour toute question sur <strong>votre compte, votre abonnement ou une séance</strong>, contactez directement votre coach.
              </div>
            </TabsContent>

            {/* ========================= */}
            {/* ONGLET 2 — À PROPOS       */}
            {/* ========================= */}
            <TabsContent value="about" className="mt-0 space-y-4">
              <div className="rounded-xl border p-5 bg-gradient-to-br from-primary/5 to-transparent">
                <h3 className="font-bold text-lg mb-2">🏋️ AGHeal &amp; Adapt'Movement</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  AGHeal est une application de gestion dédiée aux séances de <strong>sport adapté et de coaching sportif santé</strong>.
                  Elle permet à une association ou un coach de gérer ses adhérents, ses séances et ses communications,
                  le tout de manière centralisée et automatisée.
                </p>
              </div>

              {/* Fonctionnalités Adhérents */}
              <div className="rounded-lg border p-4">
                <h4 className="font-semibold text-sm mb-3 text-primary">👤 Pour les Adhérents</h4>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>✅ Consultation du planning des séances à venir</li>
                  <li>✅ Inscription et désinscription aux séances en un clic</li>
                  <li>✅ Accès à son profil personnel (nom, email, avatar)</li>
                  <li>✅ Visualisation du statut de règlement et de la date de renouvellement</li>
                  <li>✅ Suivi de la date de validité du certificat médical</li>
                  <li>✅ Historique complet des séances passées</li>
                  <li>✅ Rappel automatique par email la veille des séances</li>
                  <li>✅ Rappel automatique avant le renouvellement de l'abonnement</li>
                  <li>✅ Rappel automatique 1 mois avant l'expiration du certificat médical</li>
                  <li>✅ Personnalisation des préférences de notification</li>
                </ul>
              </div>

              {/* Fonctionnalités Coachs */}
              <div className="rounded-lg border p-4">
                <h4 className="font-semibold text-sm mb-3 text-primary">🏅 Pour les Coachs</h4>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>✅ Création et gestion des séances (titre, lieu, horaires, matériel)</li>
                  <li>✅ Presets de matériel rapides (Fitness, Cardio, Muscu, Relax, Mobilité, Ballon...)</li>
                  <li>✅ Duplication de séances sur plusieurs jours, semaines ou mois</li>
                  <li>✅ Nombre min/max de participants, bloquant ou indicatif</li>
                  <li>✅ Gestion des fiches clients (statut, notes privées, groupes)</li>
                  <li>✅ Mise à jour du statut paiement et de la date de renouvellement</li>
                  <li>✅ Saisie et suivi de la date du certificat médical des adhérents</li>
                  <li>✅ Filtres et recherche dans la liste des adhérents</li>
                  <li>✅ Gestion des groupes d'adhérents (jusqu'à 3 par adhérent)</li>
                  <li>✅ Création et gestion des types d'activité (avec lieu par défaut)</li>
                  <li>✅ Création et gestion des lieux de séance</li>
                  <li>✅ Blocage d'un adhérent (empêche toute inscription)</li>
                  <li>✅ Notification automatique des adhérents lors de nouvelles séances (BCC)</li>
                  <li>✅ Récapitulatif des séances du lendemain par email (J-1)</li>
                  <li>✅ Alerte email si un abonnement adhérent expire</li>
                  <li>✅ Passage automatique du statut paiement en "En attente" à expiration</li>
                  <li>✅ Modification des textes de communication affichés sur la page Infos</li>
                </ul>
              </div>

              {/* Fonctionnalités Admin */}
              <div className="rounded-lg border p-4">
                <h4 className="font-semibold text-sm mb-3 text-primary">🛡️ Pour les Administrateurs</h4>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>✅ Toutes les fonctionnalités coachs</li>
                  <li>✅ Gestion des rôles utilisateurs (Admin, Coach, Adhérent)</li>
                  <li>✅ Sécurité anti-blocage : impossibilité de se retirer son propre rôle admin</li>
                  <li>✅ Confirmation obligatoire pour tout changement de rôle sensible</li>
                  <li>✅ Journal d'audit : historique de toutes les actions sensibles</li>
                  <li>✅ Accès complet à la liste des utilisateurs et à leurs profils</li>
                </ul>
              </div>

              {/* Automatisations */}
              <div className="rounded-lg border p-4">
                <h4 className="font-semibold text-sm mb-3 text-primary">⚡ Automatisations (quotidiennes à 7h)</h4>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>🔔 Email de rappel de séance (J-1) aux adhérents inscrits</li>
                  <li>🔔 Email de rappel de renouvellement d'abonnement (J-1)</li>
                  <li>🔔 Email de rappel de certificat médical (M-1)</li>
                  <li>🔔 Email d'alerte coach si abonnement expiré (J+1)</li>
                  <li>🔄 Mise à jour automatique du statut paiement à "En attente" si date dépassée</li>
                  <li>📧 Envoi BCC aux adhérents à la création de nouvelles séances</li>
                </ul>
              </div>

              {/* Tech */}
              <div className="rounded-lg border p-4 bg-muted/20">
                <h4 className="font-semibold text-sm mb-2">⚙️ Stack technique</h4>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span>Frontend : React + Vite</span>
                  <span>UI : shadcn/ui + Tailwind</span>
                  <span>Backend : PHP 8.1 (API REST)</span>
                  <span>Base de données : MariaDB</span>
                  <span>Emails : PHPMailer / Gmail SMTP</span>
                  <span>Hébergement : Docker / Coolify / VPS</span>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                © {new Date().getFullYear()} Geoffroy Streit — Tous droits réservés.
              </p>
            </TabsContent>

            {/* ========================= */}
            {/* ONGLET 3 — GUIDE          */}
            {/* ========================= */}
            <TabsContent value="guide" className="mt-0 space-y-4">
              <div className="rounded-xl border p-4 bg-primary/5">
                <p className="text-sm font-medium text-primary">
                  📖 Guide adapté à votre profil :{' '}
                  <strong>
                    {role === 'admin' ? 'Administrateur' : role === 'coach' ? 'Coach' : 'Adhérent'}
                  </strong>
                </p>
              </div>

              {/* ─── CONTENU ADHÉRENT ─── */}
              {(role === 'adherent' || !role) && (
                <>
                  <Section title="🔑 Comment me connecter ?">
                    <p>Rendez-vous sur le site AGHeal depuis votre téléphone ou ordinateur. Entrez votre <strong>adresse email</strong> et votre <strong>mot de passe</strong>. C'est tout !</p>
                    <p className="mt-2">Mot de passe oublié ? Cliquez sur <em>"Mot de passe oublié ?"</em> sur la page de connexion, et vous recevrez un lien par email pour en créer un nouveau.</p>
                  </Section>

                  <Section title="🏠 La page d'accueil (Tableau de bord)">
                    <p>Dès la connexion, vous arrivez sur votre <strong>tableau de bord</strong>. Vous y voyez en un coup d'œil :</p>
                    <ul className="mt-2 space-y-1">
                      <li>📅 Vos prochaines séances auxquelles vous êtes inscrit(e)</li>
                      <li>⚠️ Un bandeau orange si votre <strong>règlement est en attente</strong></li>
                      <li>🔗 Des raccourcis vers les différentes sections de l'application</li>
                    </ul>
                  </Section>

                  <Section title="📅 Voir et s'inscrire aux séances">
                    <p>Allez dans <strong>"Séances"</strong> pour voir toutes les séances disponibles. Vous pouvez :</p>
                    <ul className="mt-2 space-y-1">
                      <li>Filtrer par date, activité ou lieu</li>
                      <li>Cliquer sur une séance pour voir ses détails (heure, lieu, matériel à apporter, places restantes)</li>
                      <li>Cliquer sur <strong>"S'inscrire"</strong> pour réserver votre place</li>
                      <li>Cliquer sur <strong>"Se désinscrire"</strong> si vous ne pouvez finalement pas venir</li>
                    </ul>
                    <p className="mt-2 text-xs bg-muted/50 rounded p-2">
                      ⚠️ Si une séance est <strong>complète</strong> ou si votre compte est <strong>bloqué</strong>, vous ne pourrez pas vous inscrire. Contactez votre coach.
                    </p>
                  </Section>

                  <Section title="👤 Mon Profil">
                    <p>Cliquez sur <strong>"Profil"</strong> pour :</p>
                    <ul className="mt-2 space-y-1">
                      <li>Modifier votre nom, prénom ou email</li>
                      <li>Ajouter ou changer votre photo (avatar)</li>
                      <li>Consulter votre <strong>statut de règlement</strong> (À jour ou En attente)</li>
                      <li>Voir la date de votre prochain <strong>renouvellement d'abonnement</strong></li>
                      <li>Voir la date de validité de votre <strong>certificat médical</strong></li>
                    </ul>
                  </Section>

                  <Section title="📜 Mon Historique">
                    <p>La section <strong>"Historique"</strong> liste toutes les séances passées auxquelles vous avez participé. Pratique pour vérifier votre assiduité !</p>
                  </Section>

                  <Section title="🔔 Recevoir des rappels par email">
                    <p>Cliquez sur l'icône <strong>⚙️ Réglages</strong> (en haut à droite ou dans le menu du bas) pour activer ou désactiver les rappels :</p>
                    <ul className="mt-2 space-y-1">
                      <li>📩 Rappel la <strong>veille d'une séance</strong> à laquelle vous êtes inscrit(e)</li>
                      <li>📩 Rappel <strong>avant la date de renouvellement</strong> de votre abonnement</li>
                      <li>📩 Rappel <strong>1 mois avant l'expiration</strong> de votre certificat médical</li>
                    </ul>
                  </Section>
                </>
              )}

              {/* ─── CONTENU COACH ─── */}
              {(role === 'coach' || role === 'admin') && (
                <>
                  <Section title="🔑 Connexion et navigation">
                    <p>Connectez-vous avec votre email et mot de passe. En tant que coach, vous avez accès à des sections supplémentaires dans la barre de navigation : <strong>Clients</strong> et <strong>Planning</strong>.</p>
                  </Section>

                  <Section title="📋 Créer une séance">
                    <p>Allez dans <strong>"Planification"</strong> puis remplissez le formulaire :</p>
                    <ul className="mt-2 space-y-1">
                      <li><strong>Activité</strong> : choisissez parmi vos activités créées (ex : Marche Nordique)</li>
                      <li><strong>Titre, Description</strong> : se remplissent automatiquement, modifiables</li>
                      <li><strong>Lieu</strong> : choisissez parmi vos lieux enregistrés</li>
                      <li><strong>Date, Heure de début/fin</strong> (17h00 et 18h00 par défaut)</li>
                      <li><strong>Participants</strong> : min/max, bloquant ou indicatif</li>
                      <li><strong>Matériel</strong> : utilisez les <em>presets</em> (Fitness, Cardio, Muscu, Relax, Mobilité...) ou rédigez librement</li>
                    </ul>
                    <p className="mt-2"><strong>Répéter la séance :</strong> cochez "Répéter cette séance" pour la dupliquer sur plusieurs jours, semaines ou mois d'un coup.</p>
                  </Section>

                  <Section title="🏃 Gérer les Activités et les Lieux">
                    <p>Avant de créer des séances, créez d'abord vos <strong>Activités</strong> (Musculation, Stretching...) et vos <strong>Lieux</strong> (Salle A, Parc...). Cela vous fera gagner du temps à chaque création de séance.</p>
                  </Section>

                  <Section title="👥 Gérer les Clients">
                    <p>Dans <strong>"Clients"</strong>, vous accédez à la fiche de chaque adhérent. Vous pouvez :</p>
                    <ul className="mt-2 space-y-1">
                      <li>Modifier le <strong>statut de règlement</strong> (À jour / En attente)</li>
                      <li>Mettre à jour la <strong>date de renouvellement d'abonnement</strong></li>
                      <li>Renseigner la <strong>date du certificat médical</strong></li>
                      <li>Attribuer jusqu'à <strong>3 groupes</strong></li>
                      <li>Rédiger des <strong>remarques privées</strong> (invisibles pour l'adhérent)</li>
                      <li><strong>Bloquer</strong> un adhérent (il ne peut plus s'inscrire)</li>
                      <li><strong>Supprimer</strong> un compte définitivement</li>
                    </ul>
                  </Section>

                  <Section title="💳 Paiements et alertes automatiques">
                    <ul className="space-y-1">
                      <li>Si la date de renouvellement est dépassée, le statut passe automatiquement à <strong>"En attente"</strong> et vous recevez un email d'alerte (si l'option est activée dans vos réglages).</li>
                      <li>Les adhérents reçoivent un rappel automatique <strong>la veille</strong> de leur renouvellement.</li>
                      <li>Un email de rappel est envoyé <strong>1 mois avant</strong> l'expiration du certificat médical de chaque adhérent concerné.</li>
                    </ul>
                  </Section>

                  <Section title="📝 Page Informations">
                    <p>Dans la page <strong>"Informations"</strong>, vous pouvez modifier 3 champs de communication visibles par tous les utilisateurs : Informations complémentaires, Précisions, et Communication spéciale (pour les messages urgents).</p>
                  </Section>

                  <Section title="🔔 Vos notifications (Réglages ⚙️)">
                    <ul className="space-y-1">
                      <li>Rappel de planning : email récapitulatif de vos séances du lendemain</li>
                      <li>Alerte expiration : email si un abonnement adhérent expire</li>
                    </ul>
                  </Section>
                </>
              )}

              {/* ─── CONTENU ADMIN UNIQUEMENT ─── */}
              {role === 'admin' && (
                <>
                  <div className="border-t pt-4 mt-2">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                      🛡️ Fonctions Administrateur uniquement
                    </p>
                  </div>

                  <Section title="Gestion des rôles utilisateurs">
                    <p>Dans <strong>"Utilisateurs" (Admin)</strong>, vous pouvez attribuer ou retirer les rôles <em>Coach</em> et <em>Admin</em>. Une confirmation est requise pour tout changement. Vous ne pouvez pas vous retirer votre propre rôle Admin (sécurité).</p>
                  </Section>

                  <Section title="Journal d'audit">
                    <p>L'onglet <strong>"Logs"</strong> enregistre toutes les actions sensibles (changements de rôle, modifications de profil, suppressions). Idéal pour retracer une action ou identifier un problème.</p>
                  </Section>

                  <Section title="Paramètres globaux">
                    <p>Via l'icône ⚙️ vous accédez aux paramètres de notification globaux et pouvez vérifier l'état du serveur d'emails (PHPMailer / SMTP).</p>
                  </Section>
                </>
              )}
            </TabsContent>

            {/* ========================= */}
            {/* ONGLET 4 — MENTIONS LÉGALES */}
            {/* ========================= */}
            <TabsContent value="legal" className="mt-0 space-y-4">
              <Section title="Éditeur de l'application">
                <p>
                  <strong>AGHeal &amp; Adapt'Movement</strong><br />
                  Application conçue et développée par <strong>Geoffroy Streit</strong>, développeur indépendant.<br />
                  Contact : geoffroy.streit.dev@gmail.com
                </p>
              </Section>

              <Section title="Hébergement">
                <p>
                  L'application est hébergée sur un serveur privé virtuel (VPS) situé en Europe chez <strong>Hostinger</strong>,
                  administré via la plateforme <strong>Coolify</strong> (conteneurs Docker).
                  Les données sont stockées exclusivement en Union Européenne.
                </p>
              </Section>

              <Section title="Propriété intellectuelle">
                <p>
                  L'ensemble du code source, des interfaces graphiques, des textes et du contenu de l'application AGHeal
                  sont la propriété exclusive de <strong>Geoffroy Streit</strong>.
                  Toute reproduction, copie, distribution ou utilisation non expressément autorisée par écrit est strictement interdite.
                </p>
                <p className="mt-2">
                  Ce logiciel est distribué sous <strong>licence propriétaire</strong>. Aucune licence libre (MIT, GPL, Apache, etc.) ne s'applique.
                </p>
              </Section>

              <Section title="Limitation de responsabilité">
                <p>
                  L'éditeur s'engage à mettre en œuvre tous les moyens raisonnables pour assurer la disponibilité et la sécurité de l'application.
                  Il ne saurait cependant être tenu responsable de toute interruption de service, perte de données ou dommage indirect résultant de
                  l'utilisation de l'application ou d'une défaillance technique extérieure à son contrôle.
                </p>
              </Section>

              <Section title="Droit applicable">
                <p>
                  Les présentes mentions légales sont régies par le <strong>droit français</strong>.
                  Tout litige relatif à l'utilisation de l'application sera soumis aux tribunaux compétents du ressort de Strasbourg (67).
                </p>
              </Section>

              <p className="text-xs text-center text-muted-foreground">Mentions légales mises à jour le 14 mars 2026.</p>
            </TabsContent>

            {/* ========================= */}
            {/* ONGLET 5 — RGPD           */}
            {/* ========================= */}
            <TabsContent value="rgpd" className="mt-0 space-y-4">
              <div className="rounded-xl border p-4 bg-primary/5">
                <p className="text-sm">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Conformément au <strong>Règlement Général sur la Protection des Données (RGPD — UE 2016/679)</strong>,
                  vos données personnelles sont traitées avec soin et vous disposez de droits sur celles-ci.
                </p>
              </div>

              <Section title="📦 Données collectées">
                <ul className="space-y-1">
                  <li><strong>Identité</strong> : Nom, prénom, adresse email</li>
                  <li><strong>Contact</strong> : Numéro de téléphone (facultatif)</li>
                  <li><strong>Santé</strong> : Date de validité du certificat médical d'aptitude à la pratique sportive</li>
                  <li><strong>Administratif</strong> : Statut de paiement, date de renouvellement d'abonnement</li>
                  <li><strong>Participation</strong> : Inscriptions aux séances, historique de présence</li>
                  <li><strong>Technique</strong> : Photo de profil (avatar compressé, stocké en base de données)</li>
                  <li><strong>Préférences</strong> : Paramètres de notification (email activé ou non)</li>
                </ul>
              </Section>

              <Section title="🎯 Pourquoi ces données sont-elles utilisées ?">
                <ul className="space-y-1">
                  <li>Permettre votre inscription aux séances et la gestion de votre compte</li>
                  <li>Assurer le suivi administratif de votre abonnement et de votre certificat médical</li>
                  <li>Vous envoyer des rappels et notifications par email (si vous l'avez autorisé)</li>
                  <li>Permettre aux coachs de gérer leurs groupes et leurs planning</li>
                </ul>
              </Section>

              <Section title="⚖️ Base légale">
                <p>
                  Le traitement de vos données est fondé sur l'<strong>exécution du contrat d'adhésion</strong> (inscription aux séances, gestion d'abonnement)
                  et votre <strong>consentement</strong> pour les éléments optionnels (notifications email, photo de profil).
                </p>
              </Section>

              <Section title="⏱️ Durée de conservation">
                <ul className="space-y-1">
                  <li><strong>Compte actif</strong> : Données conservées pendant toute la durée de l'adhésion</li>
                  <li><strong>Compte inactif</strong> : Données supprimées après <strong>24 mois</strong> d'inactivité</li>
                  <li><strong>Historique de paiement</strong> : Conservé <strong>5 ans</strong> (obligation légale comptable)</li>
                  <li><strong>Logs d'audit</strong> : Conservés <strong>12 mois</strong></li>
                </ul>
              </Section>

              <Section title="🔐 Comment vos données sont-elles protégées ?">
                <ul className="space-y-1">
                  <li>Mots de passe chiffrés (algorithme bcrypt, non lisibles même par l'admin)</li>
                  <li>Connexions sécurisées en HTTPS (chiffrement TLS)</li>
                  <li>Authentification par jetons sécurisés (JWT)</li>
                  <li>Serveur hébergé en Europe, accès restreint aux seuls administrateurs</li>
                  <li>Aucun partage de vos données avec des tiers ni à des fins publicitaires</li>
                </ul>
              </Section>

              <Section title="✊ Vos droits">
                <ul className="space-y-1">
                  <li><strong>Accès</strong> — Obtenir une copie de toutes vos données personnelles</li>
                  <li><strong>Rectification</strong> — Corriger des informations inexactes ou incomplètes</li>
                  <li><strong>Suppression</strong> — Demander l'effacement de votre compte et de vos données</li>
                  <li><strong>Portabilité</strong> — Recevoir vos données dans un format standard (CSV/JSON)</li>
                  <li><strong>Opposition</strong> — Vous opposer à certains traitements (ex: notifications)</li>
                  <li><strong>Limitation</strong> — Demander la suspension temporaire du traitement</li>
                </ul>
                <p className="mt-3 text-sm">
                  Pour exercer l'un de ces droits :{' '}
                  <a href="mailto:geoffroy.streit.dev@gmail.com" className="text-primary underline">
                    geoffroy.streit.dev@gmail.com
                  </a>
                  <br />
                  Délai de réponse : <strong>30 jours maximum</strong>.
                </p>
              </Section>

              <Section title="🍪 Cookies">
                <p>
                  L'application utilise uniquement des <strong>cookies techniques strictement nécessaires</strong> à son fonctionnement
                  (jeton d'authentification pour maintenir votre session). Elle n'utilise aucun cookie publicitaire, de traçage ou d'analyse tiers.
                </p>
              </Section>

              <Section title="📢 Plainte">
                <p>
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation auprès de la{' '}
                  <a
                    href="https://www.cnil.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    CNIL (Commission Nationale de l'Informatique et des Libertés)
                  </a>.
                </p>
              </Section>

              <p className="text-xs text-center text-muted-foreground">Politique RGPD mise à jour le 14 mars 2026.</p>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/** Composant utilitaire pour les sections de contenu */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4">
      <h4 className="font-semibold text-sm mb-2">{title}</h4>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
        {children}
      </div>
    </div>
  );
}
