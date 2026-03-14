import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        <li className="flex gap-3"><Calendar className="w-5 h-5 text-blue-500 shrink-0" /><div><strong>Planning interactif :</strong> Consultez les séances, le matériel requis et inscrivez-vous en un clic.</div></li>
        <li className="flex gap-3"><HeartPulse className="w-5 h-5 text-destructive shrink-0" /><div><strong>Profil Santé confidentiel :</strong> Renseignez vos spécificités de santé pour permettre à vos coachs d'adapter les exercices, en toute confidentialité.</div></li>
        <li className="flex gap-3"><Send className="w-5 h-5 text-green-500 shrink-0" /><div><strong>Communications :</strong> Restez informé grâce aux messages de vos coachs (urgences, alertes).</div></li>
        <li className="flex gap-3"><Stethoscope className="w-5 h-5 text-purple-500 shrink-0" /><div><strong>Suivi de certificat :</strong> Soyez alerté avant l'expiration de votre certificat médical.</div></li>
      </ul>
    </div>
  );

  const FeaturesCoach = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary">Vos Fonctionnalités (Coach)</h3>
      <p className="text-muted-foreground leading-relaxed">Découvrez les outils à votre disposition pour animer vos séances et suivre vos groupes.</p>
      <ul className="space-y-3 mt-4">
        <li className="flex gap-3"><Calendar className="w-5 h-5 text-blue-500 shrink-0" /><div><strong>Planification avancée :</strong> Création de séances récurrentes, capacités bloquantes ou indicatives, et presets de matériel.</div></li>
        <li className="flex gap-3"><Users className="w-5 h-5 text-purple-500 shrink-0" /><div><strong>Suivi Santé & Présences :</strong> Visualisez d'un coup d'œil les inscrits et leurs spécificités physiques pour adapter vos cours.</div></li>
        <li className="flex gap-3"><Send className="w-5 h-5 text-green-500 shrink-0" /><div><strong>Messagerie :</strong> Envoyez des consignes globales, par groupe ou directement à un adhérent, avec gestion des alertes urgentes.</div></li>
      </ul>
    </div>
  );

  const FeaturesAdmin = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary">Vos Fonctionnalités (Administrateur)</h3>
      <p className="text-muted-foreground leading-relaxed">Vous disposez d'un contrôle total sur la plateforme en plus de toutes les fonctions d'un coach.</p>
      <ul className="space-y-3 mt-4">
        <li className="flex gap-3"><Shield className="w-5 h-5 text-blue-500 shrink-0" /><div><strong>Gestion des utilisateurs :</strong> Attribution des rôles (Admin, Coach, Adhérent) en toute sécurité.</div></li>
        <li className="flex gap-3"><Database className="w-5 h-5 text-destructive shrink-0" /><div><strong>Suivi Administratif :</strong> Historisation des paiements et alertes pour les abonnements en défaut.</div></li>
        <li className="flex gap-3"><Rocket className="w-5 h-5 text-orange-500 shrink-0" /><div><strong>Configuration :</strong> Gestion des lieux et des types d'activités proposés par la structure.</div></li>
      </ul>
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
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Send className="w-5 h-5 text-green-500" />
          <span>Informations & Messages</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• Un espace <strong>Messages de vos coachs</strong> est présent sur votre Dashboard pour vous tenir informé.</li>
          <li>• Les messages peuvent être généraux, pour votre groupe, ou personnels.</li>
          <li>• Les alertes urgentes s'afficheront clairement pour que vous ne les manquiez pas (ex: annulation de cours).</li>
        </ul>
      </div>
      
      <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Rocket className="w-5 h-5 text-primary" />
          <span>Fonctionnalités à venir</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-1">
          <li>🏋️ <strong>Suivi de progression</strong> — historique et bilan de vos séances.</li>
          <li>📲 <strong>Notifications push</strong> — directement sur votre smartphone.</li>
          <li>📅 <strong>Liste d'attente</strong> — pour les séances complètes.</li>
        </ul>
      </div>
    </div>
  );

  const GuideCoach = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">Mode d'emploi détaillé — Coach</h3>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>Création & Gestion des Séances</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• Depuis le <strong>Planning</strong>, ajoutez des séances simples ou récurrentes (jours, semaines, mois).</li>
          <li>• Utilisez les <strong>Presets de matériel</strong> (Pilates, Muscu, etc.) pour gagner du temps.</li>
          <li>• Vous pouvez définir si la <strong>limite de participants</strong> est stricte (bloquante) ou simplement indicative.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Users className="w-5 h-5 text-purple-500" />
          <span>Suivi des Adhérents & Santé</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• Dans le détail d'une séance, visualisez les inscrits et leurs <strong>remarques de santé (icône 🩺)</strong>. Ces informations sont cruciales pour adapter le cours.</li>
          <li>• Vérifiez la validité des certificats médicaux directement depuis la liste des participants.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Send className="w-5 h-5 text-green-500" />
          <span>Communication Efficace</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• L'onglet <strong>Communications</strong> vous permet de diffuser des messages d'information, qu'ils soient globaux, restreints à un groupe, ou individuels.</li>
          <li>• Utilisez le statut <strong>Urgent</strong> avec modération pour les annulations exceptionnelles ou changements de dernière minute.</li>
        </ul>
      </div>
    </div>
  );

  const GuideAdmin = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">Mode d'emploi détaillé — Administrateur</h3>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Shield className="w-5 h-5 text-blue-500" />
          <span>Gestion des Utilisateurs</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• Depuis l'espace <strong>Clients</strong>, supervisez l'ensemble des membres inscrits.</li>
          <li>• Vous pouvez attribuer les rôles avec des sécurités pour éviter les blocages de compte.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Database className="w-5 h-5 text-destructive" />
          <span>Suivi de l'Abonnement (Facturation)</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• Indiquez rapidement depuis la liste des utilisateurs si un adhérent est à jour de ses cotisations (Switch Facturation).</li>
          <li>• Les membres en défaut verront un bandeau rouge sur leur Dashboard pour les inviter à régulariser leur situation.</li>
        </ul>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Calendar className="w-5 h-5 text-orange-500" />
          <span>Paramétrage du système</span>
        </div>
        <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <li>• Gardez la main sur les référentiels : les différents <strong>Types d'activités</strong> et les <strong>Lieux</strong> se gèrent depuis vos menus administrateur.</li>
          <li>• Vous avez, bien sûr, les mêmes droits de planification et de communication qu'un coach.</li>
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

        <Tabs defaultValue="features" className="flex-1 overflow-hidden flex flex-col mt-4">
          <TabsList className="w-full flex justify-start overflow-x-auto hide-scrollbar bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="features" className="flex items-center gap-2 rounded-lg">
              <Info className="w-4 h-4" /> Fonctionnalités
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2 rounded-lg">
              <BookOpen className="w-4 h-4" /> Mode d'emploi
            </TabsTrigger>
            <TabsTrigger value="creator" className="flex items-center gap-2 rounded-lg">
              <User className="w-4 h-4" /> Génèse & Créateur
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2 rounded-lg">
              <Scale className="w-4 h-4" /> Mentions légales
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4 border rounded-xl bg-card">
            <div className="p-6">

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

              {/* ---- ONGLET : CRÉATEUR & CONTACT ---- */}
              <TabsContent value="creator" className="m-0 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Geoffroy Streit</h3>
                    <p className="text-sm text-muted-foreground mb-4">Développeur d'applications web, mobile et bureau.</p>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      L'objectif de cette application a été de remplacer les fichiers Excel et les échanges
                      disparates par une plateforme centralisée, moderne et bienveillante, pensée spécialement pour
                      les activités sportives orientées santé et bien-être.
                    </p>
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
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
