import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Dumbbell, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Pour l'instant, en local, on simule l'envoi
      // TODO: Implémenter un endpoint PHP pour envoyer un mail de récupération
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Information',
        description: 'La réinitialisation de mot de passe sera disponible prochainement. Contactez l\'administrateur pour modifier votre mot de passe.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-primary">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-primary">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
          <CardDescription className="text-base">
            Cette fonctionnalité est temporairement désactivée en version locale.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRequestReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full shadow-primary hover:scale-105 transition-transform"
              disabled={loading}
            >
              {loading ? 'Envoi...' : 'Envoyer la demande'}
            </Button>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Retour à la connexion
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
