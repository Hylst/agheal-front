import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, User, Shield, Stethoscope, Rocket, BookOpen, HeartPulse, Send, Calendar, Users, Database } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@/assets/agheal-logo.png";

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: string;
}

export function InfoModal({ open, onOpenChange }: InfoModalProps) {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const isCoach = role === "coach" || role === "admin";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <img src={logoImage} alt="AGHeal Logo" className="w-12 h-12 object-contain" />
            <div>
              <DialogTitle className="text-2xl text-primary font-bold">À propos d'AGHeal</DialogTitle>
              <DialogDescription>
                Découvrez votre application, son fonctionnement et ses nouveautés.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="creator" className="flex-1 overflow-hidden flex flex-col mt-4">
          <TabsList className="w-full flex justify-start overflow-x-auto hide-scrollbar bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="creator" className="flex items-center gap-2 rounded-lg"><Info className="w-4 h-4" /> Genèse & Créateur</TabsTrigger>
            <TabsTrigger value="guide_user" className="flex items-center gap-2 rounded-lg"><BookOpen className="w-4 h-4" /> Mode d'Emploi</TabsTrigger>
            {isCoach && <TabsTrigger value="guide_coach" className="flex items-center gap-2 rounded-lg"><Stethoscope className="w-4 h-4" /> Guide Coach</TabsTrigger>}
            {isAdmin && <TabsTrigger value="guide_admin" className="flex items-center gap-2 rounded-lg"><Shield className="w-4 h-4" /> Guide Admin</TabsTrigger>}
          </TabsList>

          <ScrollArea className="flex-1 mt-4 border rounded-xl bg-card">
            <div className="p-6">
              
              {/* ONGLET 1 : CRÉATEUR */}
              <TabsContent value="creator" className="m-0 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">L'Initiative d'un Passionné</h3>
                    <p className="text-foreground leading-relaxed">
                      L'application <strong>AGHeal</strong> a été pensée, conçue et développée de A à Z par <strong>Geoffroy Streit</strong>. 
                      Son objectif ? Créer une plateforme moderne, bienveillante et accessible à tous pour faciliter l'encadrement des activités sportives (et particulièrement l'AntiGravity) axées sur la santé et le bien-être.
                    </p>
                    <p className="text-foreground leading-relaxed mt-2">
                      Fini les fichiers Excel compliqués et les discussions dispersées. AGHeal rassemble au même endroit le planning des séances, le suivi de santé des adhérents et les communications importantes, tout cela avec une interface simple et claire.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* ONGLET 2 : GUIDE USER */}
              <TabsContent value="guide_user" className="m-0 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-semibold mb-4 text-primary">Comment utiliser AGHeal ?</h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 text-lg font-medium mb-2">
                      <HeartPulse className="w-5 h-5 text-destructive" />
                      <span>Votre Profil et Santé</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      Votre profil est votre carte d'identité sur l'application. Vous pouvez y renseigner vos coordonnées.
                    </p>
                    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20 mt-2">
                      <p className="text-sm font-medium text-destructive-foreground">
                        💡 Information Très Importante
                      </p>
                      <p className="text-sm mt-1">
                        Nous vous invitons chaleureusement à remplir la section <strong>Informations de Santé</strong> et <strong>Précisions Utiles</strong> dans votre profil. Ces informations, strictement confidentielles, permettent à nos coachs de personnaliser les exercices, d'adapter leurs conseils et d'exercer une vigilance toute particulière sur votre bien-être lors des cours.
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 text-lg font-medium mb-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span>Les Séances</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      L'onglet <strong>Planning</strong> vous permet de voir toutes les activités proposées et de vous y inscrire en un clic.
                      Si une séance est complète, vous ne pourrez plus vous y inscrire. Vous pouvez y voir aussi le matériel éventuel requis. 
                      N'oubliez pas de vous désinscrire si vous avez un empêchement pour libérer la place !
                    </p>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 text-lg font-medium mb-2">
                      <Send className="w-5 h-5 text-green-500" />
                      <span>Communications</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      L'onglet <strong>Informations</strong> regroupe les messages de vos coachs. 
                      Si un message est marqué comme "Urgent" (ex: Coach malade, annulation exceptionnelle), il s'affichera directement en rouge sur votre tableau de bord dès votre connexion.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* ONGLET 3 : GUIDE COACH */}
              {isCoach && (
                <TabsContent value="guide_coach" className="m-0 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="text-xl font-semibold mb-4 text-primary">Les outils du Coach</h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <Calendar className="w-5 h-5 min-w-5 mt-0.5 text-blue-500" />
                      <div>
                        <strong>Création de séances :</strong> Vous pouvez planifier des séances, choisir une récurrence (semaines, mois), et fixer des limites de participants (bloquantes ou simplement indicatives).
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <Users className="w-5 h-5 min-w-5 mt-0.5 text-purple-500" />
                      <div>
                        <strong>Suivi des présences & Santé :</strong> Vérifiez qui participe à vos cours. Pensez à vérifier les petites icônes médicales de chaque adhérent pour adapter votre cours en fonction des éventuelles blessures ou particularités.
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <Send className="w-5 h-5 min-w-5 mt-0.5 text-green-500" />
                      <div>
                        <strong>Messagerie Ciblée :</strong> Publiez des messages globaux, à des groupes, ou un message confidentiel à un seul adhérent depuis la page "Informations". Les messages urgents forcent l'affichage sur la page d'accueil de l'adhérent.
                      </div>
                    </li>
                  </ul>
                </TabsContent>
              )}

              {/* ONGLET 4 : GUIDE ADMIN */}
              {isAdmin && (
                <TabsContent value="guide_admin" className="m-0 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="text-xl font-semibold mb-4 text-primary">Outils Administrateurs</h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <Shield className="w-5 h-5 min-w-5 mt-0.5 text-blue-500" />
                      <div>
                        <strong>Gestion des Droits :</strong> Via l'onglet Clients, vous maîtrisez totalement l'attribution des rôles (Admin, Coach) en toute sécurité sans risque de vous auto-bloquer.
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <Database className="w-5 h-5 min-w-5 mt-0.5 text-destructive" />
                      <div>
                        <strong>Règlements & Sécurité :</strong> Vous pouvez suivre l'historique des paiements des adhérents (qui apparaitront automatiquement en rouge s'ils n'ont pas payé) et bannir des utilisateurs si nécessaire.
                      </div>
                    </li>
                  </ul>
                </TabsContent>
              )}

            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
