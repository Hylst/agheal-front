import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Info,
  User,
  Shield,
  Stethoscope,
  BookOpen,
  HeartPulse,
  Send,
  Calendar,
  Users,
  Database,
  Scale,
  Rocket,
  Phone,
  Mail,
  Lock,
  Sparkles,
  CreditCard,
  Banknote,
  CheckSquare,
  BarChart2,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@/assets/agheal-logo.png";

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InfoModal({ open, onOpenChange }: InfoModalProps) {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const isCoach = role === "coach";
  // Un adhérent est tout ce qui n'est ni admin ni coach
  const isAdherent = !isAdmin && !isCoach;

  /* ------------------------------------------------------------------ */
  /*  Fonctionnalités (Features) adaptées au rôle                       */
  /* ------------------------------------------------------------------ */
  const FeaturesAdherent = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary">Vos Fonctionnalités (Adhérent)</h3>
      <p className="text-muted-foreground leading-relaxed">En tant qu'adhérent, l'application vous offre un espace personnel et sécurisé pour faciliter votre pratique sportive.</p>
      <ul className="space-y-3 mt-4">
        <li className="flex gap-3"><Calendar className="w-5 h-5 text-blue-500 shrink-0" /><div><strong>Planning interactif :</strong> Consultez les séances futures, le nombre de places disponibles et inscrivez-vous en un clic. Les séances passées disparaissent automatiquement du planning. Recevez un rappel par e-mail la veille de vos séances.</div></li>
        <li className="flex gap-3"><HeartPulse className="w-5 h-5 text-destructive shrink-0" /><div><strong>Profil Santé confidentiel :</strong> Renseignez vos spécificités santé (blessures, pathologies) pour permettre à vos coachs d'adapter les exercices. Soyez alerté <strong>1 mois avant</strong> l'expiration de votre certificat médical obligatoire.</div></li>
        <li className="flex gap-3"><ClipboardList className="w-5 h-5 text-purple-500 shrink-0" /><div><strong>Mon Historique :</strong> Consultez l'ensemble de vos séances passées et à venir, avec votre statut de présence pour chacune (présent / absent).</div></li>
        <li className="flex gap-3"><Send className="w-5 h-5 text-green-500 shrink-0" /><div><strong>Communications :</strong> Restez informé via les messages de vos coachs sur le Dashboard (urgences en rouge, alertes générales). Recevez aussi des e-mails de rappel pour vos abonnements et certificats.</div></li>
        <li className="flex gap-3"><Database className="w-5 h-5 text-amber-500 shrink-0" /><div><strong>Suivi d'Abonnement :</strong> Voyez en un coup d'œil votre statut de règlement et la date de votre prochain renouvellement directement sur votre Dashboard.</div></li>
      </ul>
      <div className="mt-4 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">📅 Fenêtre d'inscription</p>
        <p className="text-sm text-muted-foreground">Vous pouvez vous inscrire uniquement aux séances dans les <strong>7 prochains jours</strong>. Les séances plus éloignées sont visibles mais pas encore ouvertes à l'inscription.</p>
      </div>
    </div>
  );

  const FeaturesCoach = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary">Vos Fonctionnalités exclusives (Coach)</h3>
      <p className="text-muted-foreground leading-relaxed">Découvrez l'arsenal complet des outils à votre disposition pour animer vos séances, gérer l'administratif et assurer un suivi personnalisé de vos groupes.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-blue-600 dark:text-blue-400"><Calendar className="w-5 h-5" /> Planification experte</div>
            <p className="text-sm text-muted-foreground">Création de séances à l'unité ou <strong>en série</strong> (1 à 12 semaines). Capacité min/max configurable. Presets de types (Pilates, Musculation…) avec lieu par défaut. Modification rapide <strong>depuis le planning public</strong>.</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-purple-600 dark:text-purple-400"><CheckSquare className="w-5 h-5" /> Appel &amp; Walk-ins</div>
            <p className="text-sm text-muted-foreground">Pointez les présents en temps réel avec horodatage automatique. Ajoutez des <strong>walk-ins</strong> (adhérents de dernière minute non inscrits) via la barre de recherche. Chaque appel génère un <strong>log traçable</strong>.</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-destructive"><HeartPulse className="w-5 h-5" /> Vigilance Santé 🩺</div>
            <p className="text-sm text-muted-foreground">Icône médicale sur chaque inscrit ayant des contraintes physiques. Accès aux détails confidentiels (blessures, pathologies). Visualisation des certificats médicaux expirés ou manquants.</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-green-600 dark:text-green-400"><Send className="w-5 h-5" /> Communication multicanale</div>
            <p className="text-sm text-muted-foreground">Messages in-app ciblés (tous / groupe / individuel), urgents (rouge) ou standards. Campagnes d'<strong>e-mails programmables</strong> avec envoi différé. Remplacement définitif du groupe WhatsApp.</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-amber-600 dark:text-amber-400"><CreditCard className="w-5 h-5" /> Gestion des Règlements</div>
            <p className="text-sm text-muted-foreground">Enregistrez les règlements (espèces / chèque / virement). Dashboard mensuel des encaissements. Gestion des statuts (<em>À jour / En attente / Bloqué</em>).</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-indigo-600 dark:text-indigo-400"><BarChart2 className="w-5 h-5" /> Statistiques &amp; Exports</div>
            <p className="text-sm text-muted-foreground">Dashboard 6 onglets : KPIs globaux, historique séances, taux de présence, pyramide des âges, paiements, logs d'appel. Export <strong>CSV</strong> global et téléchargement <strong>JSON</strong> par log.</p>
        </div>
      </div>
    </div>
  );

  const FeaturesAdmin = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary">Le Hub Administrateur</h3>
      <p className="text-muted-foreground leading-relaxed">Supervisez la globalité. Le rôle Admin hérite de <strong>tous les pouvoirs Coach</strong> et y ajoute le contrôle structurel, financier et sécuritaire de toute la plateforme AGHeal.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-primary"><Shield className="w-5 h-5" /> Supervision &amp; Sécurité</div>
            <p className="text-sm text-muted-foreground leading-relaxed">Annuaire complet. Promotion de rôles (adhérent → coach → admin). Blocage / déblocage de comptes. Forçage de confirmation e-mail. Protection anti-lockout (impossible de se bloquer soi-même).</p>
        </div>
        <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-destructive"><Banknote className="w-5 h-5" /> Règlements &amp; Comptabilité</div>
            <p className="text-sm text-muted-foreground leading-relaxed">Dashboard analytique complet (total encaissé, taux par méthode). Suppression de règlements (droit exclusif admin). Alertes automatiques à J-7 et à l'expiration.</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-indigo-600 dark:text-indigo-400"><BarChart2 className="w-5 h-5" /> Statistiques globales</div>
            <p className="text-sm text-muted-foreground leading-relaxed">Accès complet au dashboard 6 onglets : vue d'ensemble KPIs, séances historisées, taux présence, pyramide des âges, paiements mensuels, logs d'appels. Export CSV global.</p>
        </div>
        <div className="col-span-1 md:col-span-1 p-4 bg-orange-500/5 rounded-xl border border-orange-500/20 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-orange-600"><Rocket className="w-5 h-5" /> Référentiel Activités &amp; Lieux</div>
            <p className="text-sm text-muted-foreground leading-relaxed">Créez et gérez les types d'activités (Yoga, HIIT…) et les lieux de pratique. Ces référentiels sont partagés par tous les coachs pour un planning cohérent.</p>
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*  Contenu du guide adapté au rôle                                    */
  /* ------------------------------------------------------------------ */
  const GuideAdherent = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">Mode d'emploi — Adhérent</h3>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <HeartPulse className="w-5 h-5 text-destructive" />
          <span>Votre Profil &amp; Santé</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Rendez-vous dans <strong>Profil</strong> pour mettre à jour vos coordonnées, votre photo et votre date de certificat médical.
        </p>
        <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">💡 Informations de santé — Facultatives mais précieuses</p>
          <p className="text-sm leading-relaxed">
            Les champs <strong>Informations de santé</strong> et <strong>Précisions utiles</strong> sont strictement confidentiels. Seuls vos coachs y ont accès. Ils permettent d'adapter les exercices et d'améliorer votre sécurité (blessures antérieures, limitations physiques…).
          </p>
        </div>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>Planning &amp; Inscriptions</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• Consultez <strong>Séances</strong> pour voir uniquement les prochaines séances disponibles (les séances passées sont masquées automatiquement).</li>
          <li>• Chaque fiche séance affiche le lieu, le type d'activité, la capacité et les places restantes.</li>
          <li>• Inscrivez-vous ou désistez-vous en un clic. L'inscription n'est possible que dans un délai de <strong>7 jours</strong> avant la séance.</li>
          <li>• Un e-mail de rappel vous est envoyé automatiquement <strong>la veille</strong> de chaque séance.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <ClipboardList className="w-5 h-5 text-purple-500" />
          <span>Historique</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• La page <strong>Historique</strong> liste toutes vos séances passées et à venir avec votre statut de présence.</li>
          <li>• Consultez-la pour retrouver les séances manquées ou confirmer vos participations.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Send className="w-5 h-5 text-green-500" />
          <span>Informations &amp; Messages</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• L'espace <strong>Messages de vos coachs</strong> sur le Dashboard vous tient informé des actualités du club.</li>
          <li>• Vous pouvez recevoir des messages généraux, de groupe, ou personnalisés.</li>
          <li>• Les alertes urgentes (ex : annulation de cours) apparaissent en <span className="text-red-500 font-semibold">rouge</span> en haut de votre Dashboard.</li>
          <li>• Des e-mails automatiques vous informent des rappels d'abonnement (J-7), des alertes d'expiration de certificat (M-1) et des rappels de séance (J-1).</li>
        </ul>
      </div>
    </div>
  );

  const GuideCoach = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">Guide d'Expertise — Coach</h3>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>Gestion du Planning</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <strong>Création à la chaîne :</strong> Utilisez la récurrence (1 à 12 semaines) pour préparer toute la saison en quelques minutes.</li>
          <li>• <strong>Modification rapide :</strong> Depuis le planning public (Séances), un bouton <em>Modifier</em> ou <em>Supprimer</em> apparaît directement dans la modale d'une séance — sans quitter le planning.</li>
          <li>• <strong>Capacité :</strong> Réglez les limites min/max. La capacité max est bloquante pour les adhérents. Laissez-la vide pour les séances illimitées.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <CheckSquare className="w-5 h-5 text-purple-500" />
          <span>Appel de Présences &amp; Walk-ins</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <strong>Radar Santé 🩺 :</strong> L'icône stéthoscope signale les inscrits ayant des contraintes physiques. Cliquez pour voir leurs informations et adapter vos exercices.</li>
          <li>• <strong>Pointage :</strong> Cochez les présents → l'heure d'arrivée est horodatée automatiquement.</li>
          <li>• <strong>Walk-ins :</strong> Un adhérent arrive sans s'être inscrit ? Recherchez-le dans la barre "Rechercher un adhérent non-inscrit" et ajoutez-le à la séance directement.</li>
          <li>• <strong>Sauvegarde :</strong> Un clic sur "Sauvegarder l'appel" génère un <strong>log permanent</strong> consultable dans les Statistiques (onglet Logs).</li>
          <li>• <strong>Certificats :</strong> Les statuts (valide / expiré / manquant) sont visibles sur la feuille d'appel. AGHeal relance automatiquement les adhérents M-1 avant expiration.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <BarChart2 className="w-5 h-5 text-indigo-500" />
          <span>Statistiques &amp; Exports</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• Accédez au <strong>Dashboard Statistiques</strong> (6 onglets) : Vue d'ensemble, Séances, Présences, Adhérents, Paiements, Logs.</li>
          <li>• Cliquez sur une séance dans l'onglet <em>Séances</em> pour voir la liste détaillée des inscrits et présents.</li>
          <li>• <strong>Export CSV</strong> : Exportez tout l'historique en un clic (compatible Excel).</li>
          <li>• <strong>Téléchargement JSON</strong> : Dans l'onglet Logs, téléchargez le fichier JSON d'un appel pour garder une trace hors-ligne.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Send className="w-5 h-5 text-green-500" />
          <span>Communication &amp; Finance</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <strong>Messages in-app :</strong> Rédigez depuis <em>Informations → onglet Nouveautés</em>. Ciblez tous, un groupe ou un individu. Activez "Urgent" pour un banner rouge sur le Dashboard des destinataires.</li>
          <li>• <strong>Campagnes e-mail :</strong> Planifiez l'envoi à une date/heure précise. Le serveur s'en charge automatiquement.</li>
          <li>• <strong>Règlements :</strong> Saisissez encaissements, mode de paiement et commentaire. Visualisez l'évolution mensuelle depuis le Dashboard Règlements.</li>
        </ul>
      </div>
    </div>
  );

  const GuideAdmin = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">Manuel de Supervision — Administrateur</h3>

      <div className="bg-blue-500/5 p-3 rounded-lg border border-blue-500/20 text-sm text-blue-700 dark:text-blue-400">
        ℹ️ En tant admin, vous avez accès à <strong>toutes les fonctionnalités Coach</strong> en plus des outils de supervision ci-dessous.
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Shield className="w-5 h-5 text-blue-500" />
          <span>Gestion des Utilisateurs</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <strong>Promotions :</strong> Depuis la liste Clients ou la page Admin Utilisateurs, promouvez un adhérent en coach ou un coach en admin. Les droits s'appliquent immédiatement.</li>
          <li>• <strong>Blocage :</strong> Désactivez l'accès d'un utilisateur en un clic. Il ne pourra plus se connecter ni s'inscrire.</li>
          <li>• <strong>Protection anti-lockout :</strong> Vous ne pouvez pas vous bloquer vous-même ni vous retirer vos propres droits admin — le système refuse silencieusement ces actions.</li>
          <li>• <strong>Confirmation e-mail :</strong> Forcez la validation de l'e-mail d'un utilisateur si nécessaire.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Database className="w-5 h-5 text-destructive" />
          <span>Surveillance des Abonnements &amp; Paiements</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <strong>Statuts de règlement :</strong> Passez manuellement un adhérent en "À jour", "En attente" ou "Bloqué" depuis sa fiche client. Cela supprime ou affiche l'alerte sur son Dashboard.</li>
          <li>• <strong>Alertes automatiques :</strong> Le système déclenche des e-mails de relance à J-7 et J+1 de la date d'échéance.</li>
          <li>• <strong>Suppression de règlements :</strong> Seul l'admin peut supprimer une entrée dans l'historique des paiements.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <BarChart2 className="w-5 h-5 text-indigo-500" />
          <span>Statistiques Avancées</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• Dashboard complet 6 onglets : Séances historisées, taux de présence par type, pyramide des âges, statuts paiements et certificats, CA mensuel, logs d'appels.</li>
          <li>• Export CSV global (tout l'historique, compatible Excel) et téléchargement JSON par log d'appel.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Rocket className="w-5 h-5 text-orange-500" />
          <span>Référentiel Activités &amp; Lieux</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <strong>Types d'activités :</strong> Définissez vos activités (Yoga, Pilates, HIIT…) avec un lieu par défaut. Ils apparaissent en preset dans le formulaire de création de séance.</li>
          <li>• <strong>Lieux :</strong> Créez les adresses de vos salles. La suppression d'un lieu met sa référence à NULL dans les séances existantes — l'historique est préservé.</li>
        </ul>
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /* Roadmap et Nouveautés                                              */
  /* ------------------------------------------------------------------ */
  const RoadmapContent = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">Nouveautés &amp; Roadmap</h3>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium text-green-600 dark:text-green-400">
          <Sparkles className="w-5 h-5" />
          <span>Nouveautés récentes (v1.9.1)</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <span className="font-semibold px-2 py-0.5 rounded text-xs bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-300">NOUVEAU</span> <strong>Dashboard Statistiques 6 onglets</strong> : KPIs globaux, séances historisées, présences, adhérents, paiements, logs — avec exports CSV et JSON.</li>
          <li>• <span className="font-semibold px-2 py-0.5 rounded text-xs bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-300">NOUVEAU</span> <strong>Appel Walk-in</strong> : Ajout d'un adhérent non-inscrit directement lors du pointage. Log automatique avec coach, inscrits et présents.</li>
          <li>• <span className="font-semibold px-2 py-0.5 rounded text-xs bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-300">AMÉLIORÉ</span> <strong>Planning public</strong> : Les séances passées sont masquées automatiquement. Modification/Suppression rapide depuis le planning.</li>
          <li>• <span className="font-semibold px-2 py-0.5 rounded text-xs bg-muted border">v1.8.0</span> <strong>Système de Gestion des Règlements</strong> : Saisie, historique complet et dashboard analytique des encaissements.</li>
          <li>• <span className="font-semibold px-2 py-0.5 rounded text-xs bg-muted border">v1.8.0</span> <strong>Notifications Push &amp; Alertes Auto</strong> : Rappels J-1 séance, M-1 certificat, J-7 abonnement — par e-mail et push navigateur.</li>
          <li>• <span className="font-semibold px-2 py-0.5 rounded text-xs bg-muted border">v1.7.0</span> <strong>Campagnes e-mail programmées</strong> et communications in-app ciblées (tous / groupe / individuel).</li>
        </ul>
      </div>

      <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Rocket className="w-5 h-5 text-primary" />
          <span>En préparation (Roadmap)</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• 📲 <strong>PWA hors-ligne avancée</strong> : Faire l'appel sans réseau (zone blanche), synchronisation différée des présences au retour en ligne.</li>
          <li>• 📅 <strong>Synchronisation Calendriers</strong> : Export iCal intégrable dans Google Calendar ou Outlook.</li>
          <li>• 🏋️ <strong>Suivi de progression</strong> : Bilan personnel, historique de performances, courbes d'évolution.</li>
          <li>• 📋 <strong>Liste d'attente</strong> : Inscription automatique à la libération d'une place sur une séance complète.</li>
          <li>• 💳 <strong>Paiement en ligne</strong> : Règlement de cotisation par carte bancaire (Stripe), factures PDF automatiques.</li>
        </ul>
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <img src={logoImage} alt="AGHeal Logo" className="w-12 h-12 object-contain" />
            <div>
              <DialogTitle className="text-2xl text-primary font-bold">À propos de l'app d'AGHeal</DialogTitle>
              <DialogDescription>
                Votre application de gestion sportive et de bien-être.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Le conteneur min-h-0 garantit que la div interne peut scroller au lieu de dépasser */}
        <Tabs defaultValue="features" className="flex-1 min-h-0 flex flex-col mt-4">
          <TabsList className="w-full flex justify-start overflow-x-auto hide-scrollbar bg-muted/50 p-1 rounded-xl shrink-0">
            <TabsTrigger value="features" className="flex items-center gap-2 rounded-lg whitespace-nowrap">
              <Info className="w-4 h-4" /> Fonctionnalités
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2 rounded-lg whitespace-nowrap">
              <BookOpen className="w-4 h-4" /> Mode d'emploi
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2 rounded-lg whitespace-nowrap">
              <Rocket className="w-4 h-4" /> Roadmap & Nouveautés
            </TabsTrigger>
            <TabsTrigger value="creator" className="flex items-center gap-2 rounded-lg whitespace-nowrap">
              <User className="w-4 h-4" /> Génèse & Créateur
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2 rounded-lg whitespace-nowrap">
              <Scale className="w-4 h-4" /> Mentions légales
            </TabsTrigger>
          </TabsList>

          {/* On utilise overflow-y-auto pour forcer l'affichage de l'ascenseur natif et s'assurer que ça scrolle */}
          <div className="flex-1 overflow-y-auto h-[50vh] sm:h-[60vh] mt-4 border rounded-xl bg-card p-4 sm:p-6">

            {/* ---- ONGLET : FONCTIONNALITÉS ---- */}
            <TabsContent value="features" className="m-0 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {isAdmin && <FeaturesAdmin />}
              {isCoach && <FeaturesCoach />}
              {isAdherent && <FeaturesAdherent />}
            </TabsContent>

            {/* ---- ONGLET : MODE D'EMPLOI ---- */}
            <TabsContent value="guide" className="m-0 animate-in fade-in zoom-in-95 duration-200">
              {isAdmin && <GuideAdmin />}
              {isCoach && <GuideCoach />}
              {isAdherent && <GuideAdherent />}
            </TabsContent>

            {/* ---- ONGLET : ROADMAP & NOUVEAUTÉS ---- */}
            <TabsContent value="roadmap" className="m-0 animate-in fade-in zoom-in-95 duration-200">
              <RoadmapContent />
            </TabsContent>

            {/* ---- ONGLET : CRÉATEUR & CONTACT ---- */}
            <TabsContent value="creator" className="m-0 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Geoffroy Streit</h3>
                  <p className="text-sm text-muted-foreground mb-4">Développeur d'applications web/mobile/bureau.</p>
                  <div className="space-y-4 text-sm mt-4">
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      L'objectif de cette application a été de remplacer les fichiers Excel, les échanges
                      disparates, les groupes WhatsApp et les chaînes d'e-mails par une plateforme centralisée,
                      moderne et bienveillante.
                      <br /><br />
                      Pensée spécialement pour les activités sportives orientées santé et bien-être,
                      elle assure un meilleur suivi global : gestion des séances et activités, envois de messages et d'e-mails programmés,
                      suivi des règlements, et prise en compte confidentielle de vos contraintes physiques et de santé.
                    </p>
                  </div>
                  <div className="space-y-4 shadow-sm border p-4 bg-muted/20 rounded-xl mt-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Email :</p>
                        <a href="mailto:geoffroy.streit.dev@gmail.com" className="hover:underline hover:text-primary transition-colors">
                          geoffroy.streit.dev@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Téléphone :</p>
                        <p>06.77.13.75.38 <span className="text-muted-foreground">(En cas de problème ou urgence)</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ---- ONGLET : MENTIONS LÉGALES / RGPD ---- */}
            <TabsContent value="legal" className="m-0 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-xl font-semibold text-primary">Mentions Légales & Confidentialité</h3>

              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    <Scale className="w-4 h-4 text-primary" /> Éditeur de l'application
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Application développée et maintenue par <strong>Geoffroy Streit</strong>, développeur d'applications web/mobile/bureau professionnel.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contact : <a href="mailto:geoffroy.streit.dev@gmail.com" className="text-primary hover:underline">geoffroy.streit.dev@gmail.com</a>
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    <Lock className="w-4 h-4 text-primary" /> Protection des données (RGPD)
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                    <li>• Les données collectées (nom, e-mail, informations de santé) sont utilisées <strong>uniquement</strong> dans le cadre de la gestion des activités sportives.</li>
                    <li>• Les informations de santé sont <strong>strictement confidentielles</strong> et accessibles uniquement aux coachs et administrateurs.</li>
                    <li>• Aucune donnée n'est revendue ni cédée à des tiers.</li>
                    <li>• Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez l'administrateur pour exercer ces droits.</li>
                    <li>• Les mots de passe sont stockés sous forme <strong>chiffrée (hachage bcrypt)</strong>. Ils ne sont jamais lisibles, même par l'administrateur.</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    <Info className="w-4 h-4 text-primary" /> Cookies & Sessions
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    L'application utilise des cookies de session sécurisés pour maintenir votre connexion.
                    Ces cookies sont strictement fonctionnels et ne servent pas au suivi publicitaire.
                    Vous pouvez configurer vos <strong>préférences de cookies</strong> depuis l'icône paramètres en bas de l'application.
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    <HeartPulse className="w-4 h-4 text-primary" /> Responsabilité médicale
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Les informations de santé renseignées dans l'application sont fournies à titre informatif
                    et ne constituent pas un avis médical. Elles permettent aux coachs d'adapter leur
                    accompagnement. Elles ne sauraient remplacer un suivi médical professionnel.
                  </p>
                </div>
              </div>
            </TabsContent>

          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
