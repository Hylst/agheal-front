import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const contactFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom est trop long"),
  email: z.string().email("Email invalide").max(255, "L'email est trop long"),
  subject: z.string().min(3, "L'objet doit contenir au moins 3 caractères").max(200, "L'objet est trop long"),
  sessionType: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères").max(2000, "Le message est trop long (max 2000 caractères)"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const sessionTypes = [
  { value: "musculation-sante", label: "Musculation Santé" },
  { value: "marche-nordique", label: "Marche Nordique" },
  { value: "renforcement", label: "Renforcement conscientisé" },
  { value: "domicile", label: "Séance à domicile" },
  { value: "gym-chaise", label: "Gym sur chaise" },
  { value: "autre", label: "Autre / Je ne sais pas" },
];

export const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      subject: "",
      sessionType: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8081/agheal-api/public";
      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: `Objet: ${data.subject}\n\nType de séance: ${data.sessionType ? sessionTypes.find(t => t.value === data.sessionType)?.label : 'Non spécifié'}\n\n${data.message}`,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erreur');

      toast.success("Message envoyé avec succès ! Vous recevrez une confirmation par email.");
      form.reset();
    } catch (error: any) {
      console.error("Error sending contact email:", error);
      toast.error("Erreur lors de l'envoi du message. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet *</FormLabel>
                <FormControl>
                  <Input placeholder="Votre nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="votre@email.fr" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objet *</FormLabel>
                <FormControl>
                  <Input placeholder="Sujet de votre message" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sessionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de séance souhaité</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner (optionnel)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sessionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez vos besoins, vos contraintes éventuelles, vos questions..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                {field.value.length}/2000 caractères
              </p>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Envoyer le message
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};
