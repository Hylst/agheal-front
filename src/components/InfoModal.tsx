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
        <li className="flex gap-3"><Calendar className="w-5 h-5 text-blue-500 shrink-0" /><div><strong>Planning interactif :</strong> Consultez les séances, le matériel requis et inscrivez-vous en un clic. Recevez un rappel par e-mail la veille de votre séance.</div></li>
        <li className="flex gap-3"><HeartPulse className="w-5 h-5 text-destructive shrink-0" /><div><strong>Profil Santé confidentiel :</strong> Renseignez vos spécificités de santé pour permettre à vos coachs d'adapter les exercices, en toute confidentialité. Soyez alerté 1 mois avant l'expiration de votre certificat.</div></li>
        <li className="flex gap-3"><Send className="w-5 h-5 text-green-500 shrink-0" /><div><strong>Communications :</strong> Restez informé grâce aux messages de vos coachs (urgences, alertes) sur le Dashboard et recevez des e-mails informatifs selon votre activité professionnelle ou de groupe.</div></li>
        <li className="flex gap-3"><Database className="w-5 h-5 text-purple-500 shrink-0" /><div><strong>Suivi d'Abonnement :</strong> Gardez un œil visuel sur la validité de votre abonnement (indicateurs sur le Dashboard) et recevez des rappels avant échéance.</div></li>
      </ul>
    </div>
  );

  const FeaturesCoach = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary">Vos Fonctionnalités exclusives (Coach)</h3>
      <p className="text-muted-foreground leading-relaxed">Découvrez l'arsenal complet des outils à votre disposition pour animer vos séances, gérer l'administratif léger et assurer un suivi personnalisé et sécuritaire de vos groupes.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-blue-600 dark:text-blue-400"><Calendar className="w-5 h-5" /> Planification experte</div>
            <p className="text-sm text-muted-foreground">Création de séances à l'unité ou en série (jours, semaines, mois). Définissez des limites de participants strictes (liste d'attente) ou flexibles. Utilisez les presets de matériel (Pilates, Musculation...) pour gagner du temps lors de la rédaction.</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-purple-600 dark:text-purple-400"><Users className="w-5 h-5" /> Contrôle des présences</div>
            <p className="text-sm text-muted-foreground">Pilotez les inscriptions : pointez les présents, visualisez les absents. Accédez instantanément au taux de remplissage de vos cours et intervenez manuellement sur la liste si un adhérent rencontre des difficultés avec l'application.</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-destructive"><HeartPulse className="w-5 h-5" /> Vigilance Santé Proactive</div>
            <p className="text-sm text-muted-foreground">Un système d'icônes médicales (🩺) vous alerte instantanément sur la liste d'inscrits. Accédez aux détails confidentiels (blessures, pathologies) pour adapter vos exercices. Gardez l'œil ouvert sur la validité des certificats médicaux.</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-green-600 dark:text-green-400"><Send className="w-5 h-5" /> Communication multicanale</div>
            <p className="text-sm text-muted-foreground">Remplacez définitivement WhatsApp et les mails désordonnés. Rédigez des messages applicatifs rapides ("Urgents" ou standards), ou créez des <strong>campagnes d'e-mails programmables</strong> pour un envoi différé ciblé.</p>
        </div>
      </div>
    </div>
  );

  const FeaturesAdmin = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary">Le Hub Administrateur</h3>
      <p className="text-muted-foreground leading-relaxed">Supervisez la globalité. Le rôle Admin hérite des pouvoirs Coach (planification, santé, messages, e-mails programmés) et y ajoute le contrôle structurel, financier et sécuritaire de toute la plateforme AGHeal.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-primary"><Shield className="w-5 h-5" /> Supervision & Sécurité</div>
            <p className="text-sm text-muted-foreground leading-relaxed">Consultez l'annuaire complet. Promouvez un adhérent en Coach, ou nommez un co-Admin. Le système vous protège (auto-blocage impossible). Gérez le statut des membres depuis leur fiche détaillée, activez ou désactivez les accès avec des dialogues de vérification.</p>
        </div>
        <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-destructive"><Database className="w-5 h-5" /> Règlements & Cotisations</div>
            <p className="text-sm text-muted-foreground leading-relaxed">AGHeal vous signale les adhérents en défaut de paiement. D'un simple interrupteur (Switch), vous pouvez appliquer ou lever l'anomalie financière et générer une alerte rouge non intrusive sur le tableau de bord des concernés (avec l'historique gardé en base).</p>
        </div>
        <div className="col-span-1 md:col-span-2 p-4 bg-orange-500/5 rounded-xl border border-orange-500/20 flex flex-col gap-2">
            <div className="flex gap-2 items-center font-semibold text-orange-600"><Rocket className="w-5 h-5" /> Ingénierie du Référentiel</div>
            <p className="text-sm text-muted-foreground leading-relaxed">Standardisez votre modèle d'entreprise. Définissez les "Types d'activités" (Yoga, Cardio, HIIT...) avec leurs couleurs personnalisées pour le planning. Créez les "Lieux" de pratique pour un calendrier professionnel sans saisie redondante.</p>
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*  Contenu du guide adapté au rôle                                    */
  /* ------------------------------------------------------------------ */
  const GuideAdherent = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">Mode d'emploi détaillé — Adhérent</h3>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <HeartPulse className="w-5 h-5 text-destructive" />
          <span>Votre Profil & Santé</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Rendez-vous dans l'onglet <strong>Profil</strong> pour mettre à jour vos coordonnées,
          votre photo et votre date de certificat médical.
        </p>
        <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">
            💡 Informations de santé — Facultatives mais précieuses
          </p>
          <p className="text-sm leading-relaxed">
            Vous pouvez préciser si vous le souhaitez les champs <strong>Informations de santé</strong> et{" "}
            <strong>Précisions utiles</strong>. Ces données sont strictement confidentielles envers les autres adhérents, 
            seuls vos coachs y ont accès. Cela leur permet de mieux adapter les exercices, de cibler leurs conseils, 
            et d'accroître leur vigilance (en cas de blessure antérieure, de limitation physique particulière...).
          </p>
        </div>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>Planning & Inscriptions</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• Consultez l'onglet <strong>Planning</strong> pour voir les prochaines séances.</li>
          <li>• Chaque séance indique le matériel requis et le nombre de places disponibles.</li>
          <li>• Un simple clic suffit pour s'inscrire ou se désinscrire (merci de le faire à l'avance pour libérer votre place).</li>
          <li>• Des rappels de confirmation de vos prochaines séances vous seront envoyés par e-mail la veille du cours.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Send className="w-5 h-5 text-green-500" />
          <span>Informations & Messages</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• Un espace <strong>Messages de vos coachs</strong> est présent sur votre Dashboard pour vous tenir informé.</li>
          <li>• Vous êtes susceptible de recevoir des messages <strong>généraux</strong> (pour tous), de <strong>groupe</strong>, ou <strong>personnalisés</strong>.</li>
          <li>• Les alertes urgentes s'afficheront clairement (en rouge) pour que vous ne les manquiez pas (ex: annulation de cours).</li>
          <li>• Vous recevrez également plusieurs types d'informations <strong>par courriel (e-mail)</strong> concernant votre pratique sportive avec AGHeal : alertes différées de vos coachs, rappels système concernant vos abonnements à renouveler, et rappels 1 mois avant l'expiration de votre certificat médical obligatoire.</li>
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
          <span>Gestion fine du Planning</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <strong>Création à la chaîne :</strong> Utilisez la récurrence (jours, semaines, mois) pour préparer la saison de tous les cours en une minute.</li>
          <li>• <strong>Jauges et files actives :</strong> Réglez la capacité sur stricte (personne d'autre ne peut venir) ou sur indicative, et utilisez les presets "Musculation", "Pilates" pour afficher instantanément la liste du bon matériel à apporter par les élèves.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Users className="w-5 h-5 text-purple-500" />
          <span>Feuille d'Appel & Secret Médical</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <strong>Radar Santé 🩺 :</strong> Sur chaque liste d'inscrits à un cours, l'apparition d'un stéthoscope vous prévient si un élève a une contrainte physique. Cliquez sur sa fiche pour lire sa condition et adapter son échauffement en tout secret.</li>
          <li>• <strong>Certificats & Administratif :</strong> Repérez en couleur les certificats manquants directement dans votre feuille d'appel connectée sur le terrain. AGHeal relance automatiquement les adhérents 30 jours avant péremption !</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Send className="w-5 h-5 text-green-500" />
          <span>Stratégie de Communication</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <strong>Dites adieu à WhatsApp :</strong> Le module Communications vous propose désormais de rédiger des messages applicatifs internes ou de programmer l'envoi de campagnes d'e-mails. Cochez "Global", "Groupe A" ou "Individuel" pour un meilleur ciblage.</li>
          <li>• <strong>Alerte Rouge :</strong> Si vous activez le bouton "Urgent" sur un message In-app, alors celui-ci devient une bannière rouge agressive qui envahira le Dashboard du ou des membres la prochaine fois qu'ils lanceront l'App.</li>
          <li>• <strong>Planification d'E-mails :</strong> Anticipez les alertes ou annonces commerciales en programmant la date et de l'heure d'envoi de l'e-mail. Le script de tâche gèrera son routage automatique.</li>
        </ul>
      </div>
    </div>
  );

  const GuideAdmin = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">Manuel de Supervision — Administrateur</h3>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Shield className="w-5 h-5 text-blue-500" />
          <span>Tour de Contrôle - Clients</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <strong>Promotions des grades :</strong> Naviguez dans la liste Clients pour coopter instantanément de nouveaux coachs via les menus options sans délai, les nouveaux droits s'activent pour la prochaine vue.</li>
          <li>• <strong>Filet de sécurité :</strong> Le système vous prévient des erreurs humaines. Bannissez ceux qui partent, ne craignez pas de bloquer votre propre login et rappelez-vous que le rôle initial 'adhérent' est vital et indélébile dans l'application.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Database className="w-5 h-5 text-destructive" />
          <span>Surveillance des Abonnements & Factures</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <strong>Tri Automatique :</strong> Fini de retenir qui doit une mensualité. L'onglet affiche tous ceux "En défaut". Faites sauter la sanction en un claquement de doigt, cela supprimera l'avertissement permanent de leur page d'accueil d'abonnés.</li>
          <li>• <strong>Alertes Programmées :</strong> AGHeal se charge de lancer les protocoles de relance automatiques à J-7 de l'expiration d'un abonnement ainsi qu'à sa date de péremption, en utilisant les tâches planifiées du serveur.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Calendar className="w-5 h-5 text-orange-500" />
          <span>La structure des Données</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <strong>Nomenclature Globale :</strong> Verrouillez vos 'Types de cours' en leur assignant des pastilles colorées propres à votre club pour éviter le chaos dans l'affichage du calendrier par vos coachs indépendants, même chose pour adresser correctement les 'Lieux'.</li>
          <li>• <strong>Totalité des pouvoirs :</strong> Avoir ce rôle vous garantit que vous pourrez assister vos propres coachs et pallier une crise car l'Admin hérite de la rédaction des séances, des e-mails programmés et de la liste santé confidentielle.</li>
        </ul>
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /* Roadmap et Nouveautés                                              */
  /* ------------------------------------------------------------------ */
  const RoadmapContent = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">Nouveautés & Roadmap</h3>
      
      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium text-green-600 dark:text-green-400">
          <Sparkles className="w-5 h-5" />
          <span>Nouveautés Récentes</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• <span className="font-semibold px-2 py-0.5 rounded text-xs bg-muted border">NOUVEAU</span> <strong>Campagnes d'E-mails Programmables</strong> : Les coachs et admins peuvent désormais planifier l'envoi de courriels informatifs ciblés à l'avance.</li>
          <li>• <span className="font-semibold px-2 py-0.5 rounded text-xs bg-muted border">NOUVEAU</span> <strong>Alertes Auto</strong> : Automatisation des e-mails pour le renouvellement des abonnements (J-7) et des certificats (M-1).</li>
          <li>• <strong>Communications ciblées (App)</strong> : L'espace d'affichage "Messages de vos coachs" propose des messages de groupe, personnels, ou globaux, dont les urgences sont en rouge vif.</li>
          <li>• <strong>Sécurité Renforcée</strong> : Protection totale de l'Admin contre les fautes de frappe de bannissement. Ajout d'audit logs invisibles pour sécuriser la supervision système.</li>
        </ul>
      </div>

      <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Rocket className="w-5 h-5 text-primary" />
          <span>En préparation (Roadmap)</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• 🏋️ <strong>Suivi de progression personnel</strong> : Accès au bilan, historique et évolution concrète de vos performances (Pour sportifs).</li>
          <li>• 📲 <strong>Application Mobile PWA</strong> : Installation pure et simple sur l'écran d'accueil avec icône Apple/Android et cache performant.</li>
          <li>• 📅 <strong>Liste d'attente</strong> : Inscriptions secondaires automatiques lors des désistements sur des séances pleines.</li>
          <li>• 📊 <strong>Tableau de Bord Statistiques</strong> : Export CSV direct et analyse de l'évolution financière pour les clubs (Admins).</li>
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
