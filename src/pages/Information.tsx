import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Facebook, Instagram, Globe, Dumbbell, TreePine, RefreshCw, Home, Armchair, ExternalLink, MessageSquare, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    fetchCommunications();
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

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce message ?")) return;
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
              <CardTitle className="text-xl text-primary">Qui sommes-nous ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <Separator />

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
                  <li>✔️ Atteindre vos objectifs personnels en toute sécurité.</li>
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

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-muted/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-muted/80">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">Accessible à tous</h4>
                    <p className="text-sm text-muted-foreground">Nous adaptons nos séances à tous les profils.</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-muted/80">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">Bienveillance</h4>
                    <p className="text-sm text-muted-foreground">Un cadre convivial, à l'écoute et respectueux.</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-muted/80">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">Plaisir et progression</h4>
                    <p className="text-sm text-muted-foreground">Le sport doit rester un moment de plaisir.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Nos séances & offres */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary">Nos séances & offres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-l-4 border-l-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Musculation Santé</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Renforcement musculaire adapté — force, tonicité, posture, mobilité.</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TreePine className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Marche Nordique</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Marche dynamique, renforcement global, cardio, respiration. Accessible à tous.</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Renforcement "conscientisé"</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Écoute du corps, qualité du mouvement, mobilité retrouvée.</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Séance à domicile</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Séances à domicile, adaptées à l'espace et aux besoins.</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary md:col-span-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Armchair className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Gym sur chaise</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Idéal pour personnes avec mobilité réduite, seniors, ou en reprise d'activité.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-primary">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <a href="https://www.facebook.com/people/AG-Heal/61573821635137/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity">
                  <Facebook className="h-5 w-5" /> Facebook <ExternalLink className="h-4 w-4" />
                </a>
                <a href="https://www.instagram.com/ag_heal_/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white rounded-lg hover:opacity-90 transition-opacity">
                  <Instagram className="h-5 w-5" /> Instagram <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <Separator />
              <ContactForm />
            </CardContent>
          </Card>

          {/* Section 4: Messages reçus (lecture seule — formulaire dans /coach/communications) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-primary flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {isCoachOrAdmin ? "Communications publiées" : "Messages de vos coachs"}
              </CardTitle>
              {isCoachOrAdmin && (
                <Link to="/coach/communications">
                  <Button size="sm" variant="outline">
                    Gérer les messages →
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-center py-4">Chargement...</p>
              ) : communications.length === 0 ? (
                <p className="text-muted-foreground italic text-center py-6">
                  {isCoachOrAdmin
                    ? "Aucun message publié pour le moment."
                    : "Aucune communication en cours de la part de vos coachs."}
                </p>
              ) : (
                <div className="space-y-4">
                  {communications.map((comm) => (
                    <div
                      key={comm.id}
                      className={`relative rounded-lg p-5 border shadow-sm transition-all
                        ${comm.is_urgent ? "bg-destructive/10 border-destructive/50" : "bg-muted/50 border-border"}`}
                    >
                      <div className="flex flex-wrap gap-2 items-center mb-3 pr-10">
                        {comm.is_urgent && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Urgent
                          </Badge>
                        )}
                        <Badge variant={comm.target_type === "all" ? "default" : comm.target_type === "group" ? "secondary" : "outline"}>
                          {comm.target_type === "all" && "Message Général"}
                          {comm.target_type === "group" && "Message de Groupe"}
                          {comm.target_type === "user" && "Message Personnel"}
                        </Badge>
                        {isCoachOrAdmin && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            Par {comm.first_name || "Coach"} &bull; {new Date(comm.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm">{comm.content}</p>
                      {isCoachOrAdmin && (
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-destructive opacity-60 hover:opacity-100 absolute top-3 right-3"
                          onClick={() => handleDelete(comm.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Information;
