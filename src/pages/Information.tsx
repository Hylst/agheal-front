import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Facebook, Instagram, Globe, Edit, Save, X, Dumbbell, TreePine, RefreshCw, Home, Armchair, ExternalLink, MessageSquare, Trash2, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";
import teamImage from "@/assets/agheal-team.png";
import logoImage from "@/assets/agheal-logo.png";
import { ContactForm } from "@/components/ContactForm";

interface Communication {
  id: number;
  author_id: string;
  target_type: "all" | "group" | "user";
  target_id: string | null;
  content: string;
  is_urgent: boolean;
  created_at: string;
  first_name?: string;
  last_name?: string;
}

const Information = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isCoachOrAdmin = role === "coach" || role === "admin";

  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire d'édition (Admin/Coach)
  const [isEditing, setIsEditing] = useState(false);
  const [targetType, setTargetType] = useState<"all" | "group" | "user">("all");
  const [targetId, setTargetId] = useState<string>("");
  const [content, setContent] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  // Données de ciblage
  const [groups, setGroups] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    fetchCommunications();
    if (isCoachOrAdmin) {
      fetchTargets();
    }
  }, [isCoachOrAdmin]);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const { data, error } = isCoachOrAdmin 
        ? await apiClient.getCommunicationsTargets()
        : await apiClient.getMyCommunications();

      if (error) throw error;
      setCommunications((data as any)?.data || []);
    } catch (error) {
      console.error("Error fetching communications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTargets = async () => {
    try {
      const [{ data: gData }, { data: cData }] = await Promise.all([
        apiClient.getGroups(),
        apiClient.getClients()
      ]);
      setGroups((gData as any)?.groups || []);
      setClients((cData as any)?.clients || []);
    } catch (err) {
      console.error("Error loading groups/clients:", err);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Le message ne peut pas être vide");
      return;
    }
    if (targetType !== "all" && !targetId) {
      toast.error("Veuillez sélectionner une cible (groupe ou adhérent)");
      return;
    }

    try {
      const { error } = await apiClient.saveCommunication({
        target_type: targetType,
        target_id: targetType === "all" ? null : targetId,
        content,
        is_urgent: isUrgent ? 1 : 0
      });

      if (error) throw error;

      toast.success("Communication publiée avec succès");
      setIsEditing(false);
      resetForm();
      fetchCommunications(); // Recharger la liste
    } catch (error) {
      console.error("Error saving communication:", error);
      toast.error("Erreur lors de la sauvegarde, la cible peut déjà avoir un message.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;
    
    try {
      const { error } = await apiClient.deleteCommunication(id);
      if (error) throw error;
      
      toast.success("Message supprimé");
      fetchCommunications();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setTargetType("all");
    setTargetId("");
    setContent("");
    setIsUrgent(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    resetForm();
  };

  const hasContent = (field: string) => field && field.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Informations</h1>
        </div>

        <div className="space-y-8">
          {/* Section 1: Qui sommes-nous */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center gap-2">
                <img src={logoImage} alt="AGHeal Logo" className="h-10 w-auto" />
                Qui sommes-nous ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <img
                  src={teamImage}
                  alt="Amandine et Guillaume"
                  className="w-full md:w-64 rounded-lg shadow-md"
                />
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Nous sommes <strong>Amandine</strong> et <strong>Guillaume</strong>, enseignants en activité physique adaptée,
                    diplômés et engagés pour le bien-être et la santé de chacun.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Avec <strong>AGheal</strong>, nous vous proposons des séances d'activités physiques adaptées,
                    conçues pour tous les niveaux et pensées pour améliorer votre bien-être, votre mobilité
                    et votre condition physique, quelles que soient vos capacités.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Amandine */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="amandine">
                  <AccordionTrigger className="text-lg font-semibold">Amandine</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Diplômes et Formations :</h4>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Master 2 STAPS – Activité Physique Adaptée et Santé</li>
                        <li>Licence STAPS APA-S</li>
                        <li>Éducation thérapeutique du patient (ETP)</li>
                        <li>Formée aux gestes de premiers secours</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Expérience professionnelle :</h4>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Enseignante en activité physique adaptée à la Maison Sport Santé Nord Alsace</li>
                        <li>Effecteur Prescri' Mouv</li>
                        <li>Enseignante en activité physique adaptée au centre de rééducation de Morsbronn-les-Bains</li>
                        <li>Coach de gymnastique acrobatique à Brumath</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="guillaume">
                  <AccordionTrigger className="text-lg font-semibold">Guillaume</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Diplômes et Formations :</h4>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Master 2 STAPS – Activité Physique Adaptée et Santé</li>
                        <li>Licence STAPS APA-S</li>
                        <li>Licence Sociologie de l'intervention sociale, du conflit et de la médiation</li>
                        <li>Éducation thérapeutique du patient (ETP)</li>
                        <li>Brevet Fédéral 2 moniteur Haltérophilie (BF2)</li>
                        <li>Titulaire du PSE1 et du BNSSA</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Expérience professionnelle :</h4>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Enseignant en activité physique adaptée à la Maison Sport Santé Nord Alsace</li>
                        <li>Effecteur Prescri' Mouv</li>
                        <li>Moniteur haltérophilie et musculation</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Separator />

              <div className="space-y-3">
                <p className="font-semibold text-foreground">Nous mettons notre expertise à votre service pour vous aider à :</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✔️ Retrouver confiance en votre corps grâce à des exercices adaptés.</li>
                  <li>✔️ Préserver et améliorer votre santé à travers des séances motivantes et bienveillantes.</li>
                  <li>✔️ Atteindre vos objectifs personnels en toute sécurité à travers des séances collectives ou personnalisées.</li>
                </ul>
                <a
                  href="https://www.agheal.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  <Globe className="h-4 w-4" />
                  Pour en savoir plus : www.agheal.fr
                </a>
              </div>

              <Separator />

              {/* Notre mission */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Notre mission</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>Permettre à chacun — quel que soit l'âge, la forme physique ou les limitations — de bouger en toute sécurité, à son rythme.</p>
                  <p>Offrir un cadre bienveillant, convivial, respectueux et à l'écoute, pour accompagner chacun vers ses objectifs.</p>
                  <p>Proposer une approche globale : redonner confiance en son corps, améliorer la santé, la mobilité, favoriser un équilibre physique, mental et social.</p>
                </div>
              </div>

              <Separator />

              {/* Nos valeurs */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Nos valeurs</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-muted/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-muted/80 hover:border-primary/30">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2">Accessible à tous</h4>
                      <p className="text-sm text-muted-foreground">
                        Nous adaptons nos séances à tous les profils, quel que soit votre âge, votre condition physique ou vos limitations.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-muted/80 hover:border-primary/30">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2">Bienveillance</h4>
                      <p className="text-sm text-muted-foreground">
                        Nous créons un cadre convivial et à l'écoute, où chacun se sent accompagné, respecté et encouragé.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-muted/80 hover:border-primary/30">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2">Plaisir et progression</h4>
                      <p className="text-sm text-muted-foreground">
                        Le sport doit rester un moment de plaisir. C'est en prenant du plaisir que les bienfaits apparaissent naturellement.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* AGheal signification */}
              <div className="bg-primary/5 rounded-lg p-4 space-y-3">
                <h3 className="text-lg font-semibold text-primary">AGheal : un nom qui a du sens !</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  AGheal est né de notre vision de l'accompagnement : <strong>A</strong> pour Amandine, <strong>G</strong> pour Guillaume,
                  et <strong>heal</strong>, « guérir » en anglais. Mais pour nous, guérir, c'est bien plus que réparer un corps.
                  C'est retrouver un équilibre global — physique, psychique et social.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Nous croyons en une agilité propre à chacun, loin des normes. Nos séances visent à redonner confiance en son corps
                  à travers des mouvements qui ont du sens, procurent du plaisir et révèlent ses propres ressources.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Nos séances & offres */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary">Nos séances & offres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">
                Voici les activités proposées par AGheal, adaptées à différents besoins et niveaux.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-l-4 border-l-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-l-8">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Musculation Santé</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Des séances de renforcement musculaire adaptées — pour améliorer la force, la tonicité,
                      la posture, la mobilité, tout en respectant les capacités et les limites de chacun.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-l-8">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TreePine className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Marche Nordique</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Une forme d'activité douce mais efficace : marche dynamique, renforcement musculaire global,
                      cardio, respiration. Accessible à tous.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-l-8">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Renforcement "conscientisé"</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Des séances centrées sur l'écoute du corps, la qualité du mouvement, le respect de soi —
                      pour redonner de la mobilité et renforcer doucement.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-l-8">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Séance à domicile</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pour celles et ceux qui ne peuvent pas se déplacer — des séances à domicile,
                      en adaptant les exercices selon l'espace, les besoins et les contraintes.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary md:col-span-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-l-8">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Armchair className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Gym sur chaise</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Une option douce : idéal pour personnes avec mobilité réduite, seniors, ou en reprise —
                      des mouvements adaptatifs pour maintenir ou améliorer la mobilité, la posture, l'autonomie.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <p className="text-sm text-muted-foreground italic mt-4">
                Pour chaque type de séance, AGheal adapte l'intensité, le rythme et la structure selon le profil —
                débutant, sédentaire, en reprise, senior, etc.
              </p>
            </CardContent>
          </Card>

          {/* Section 3: Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary">Contact et prise de rendez-vous</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Si vous souhaitez en savoir plus, réserver une séance ou échanger avec nous, voici comment nous joindre :
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <a href="tel:0638013843" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>06 38 01 38 43</span>
                  </a>
                  <a href="mailto:ag.heal67@gmail.com" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                    <span>ag.heal67@gmail.com</span>
                  </a>
                </div>
                <div className="space-y-3">
                  <a href="mailto:guillaume.trautmann@agheal.fr" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>guillaume.trautmann@agheal.fr</span>
                  </a>
                  <a href="mailto:amandine.motsch@agheal.fr" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>amandine.motsch@agheal.fr</span>
                  </a>
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-4">
                <a
                  href="https://www.facebook.com/people/AG-Heal/61573821635137/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Facebook className="h-5 w-5" />
                  Facebook
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://www.instagram.com/ag_heal_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Instagram className="h-5 w-5" />
                  Instagram
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <Separator />

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-muted-foreground text-sm italic">
                  "Contactez-nous dès maintenant pour discuter de vos attentes, poser vos questions ou planifier
                  une première séance — nous adapterons notre approche à votre profil, en toute bienveillance."
                </p>
              </div>

              <Separator />

              {/* Formulaire de contact */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">Nous contacter</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Remplissez le formulaire ci-dessous pour nous envoyer un message directement.
                  Nous vous répondrons dans les plus brefs délais.
                </p>
                <ContactForm />
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Communications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-primary">Communications & Informations</CardTitle>
              {isCoachOrAdmin && !isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau message
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <p className="text-muted-foreground">Chargement des messages...</p>
              ) : isCoachOrAdmin && isEditing ? (
                <div className="space-y-6 border rounded-lg p-6 bg-muted/30">
                  <h3 className="text-lg font-semibold">Publier un message</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Cible</label>
                      <Select 
                        value={targetType} 
                        onValueChange={(val: any) => { setTargetType(val); setTargetId(""); }}
                      >
                        <SelectTrigger bg-background>
                          <SelectValue placeholder="Sélectionnez une cible" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les adhérents</SelectItem>
                          <SelectItem value="group">Un groupe spécifique</SelectItem>
                          <SelectItem value="user">Un adhérent spécifique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {targetType === "group" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Groupe destinataire</label>
                        <Select value={targetId} onValueChange={setTargetId}>
                          <SelectTrigger bg-background>
                            <SelectValue placeholder="Choisir le groupe..." />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map(g => (
                              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {targetType === "user" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Adhérent destinataire</label>
                        <Select value={targetId} onValueChange={setTargetId}>
                          <SelectTrigger bg-background>
                            <SelectValue placeholder="Choisir l'adhérent..." />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="urgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
                    <label htmlFor="urgent" className="text-sm font-medium text-destructive flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Marquer comme Urgent (S'affichera sur le tableau de bord des adhérents ciblés)
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Contenu du message</label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Texte du message à transmettre..."
                      rows={5}
                      className="resize-y min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button variant="outline" onClick={handleCancel}>Annuler</Button>
                    <Button onClick={handleSave}>Publier le message</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {communications.length === 0 ? (
                    <p className="text-muted-foreground italic text-center py-4">
                      Aucune communication en cours.
                    </p>
                  ) : (
                    communications.map((comm) => (
                      <div 
                        key={comm.id} 
                        className={`relative rounded-lg p-5 border shadow-sm transition-all
                          ${comm.is_urgent ? 'bg-destructive/10 border-destructive/50' : 'bg-muted/50 border-border'}`}
                      >
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <div className="flex flex-wrap gap-2 items-center">
                            {comm.is_urgent && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Urgent
                              </Badge>
                            )}
                            <Badge variant={comm.target_type === 'all' ? "default" : comm.target_type === 'group' ? "secondary" : "outline"}>
                              {comm.target_type === 'all' && "Message Général"}
                              {comm.target_type === 'group' && "Message de Groupe"}
                              {comm.target_type === 'user' && "Message Personnel"}
                            </Badge>
                            {isCoachOrAdmin && (
                              <span className="text-xs text-muted-foreground ml-2">
                                Par {comm.first_name || 'Coach'} • le {new Date(comm.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {isCoachOrAdmin && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive opacity-70 hover:opacity-100 absolute top-3 right-3"
                              onClick={() => handleDelete(comm.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <p className="text-foreground whitespace-pre-wrap mt-2 leading-relaxed">
                          {comm.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 mb-8 flex justify-center">
          <img 
            src="/assets/AGHEAL_logo.webp" 
            alt="AGHeal Logo" 
            className="w-48 h-48 object-contain opacity-80 hover:opacity-100 transition-opacity duration-500 hover:scale-110 drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Information;
