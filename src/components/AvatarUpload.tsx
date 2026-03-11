import { useRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onAvatarChange: (base64: string) => void;
  userName?: string;
}

export function AvatarUpload({ currentAvatar, onAvatarChange, userName }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast({
        title: 'Format invalide',
        description: 'Seuls les fichiers JPG et PNG sont acceptés',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La taille maximale est de 5 Mo',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize image to 128x128
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          toast({
            title: 'Erreur',
            description: 'Impossible de traiter l\'image',
            variant: 'destructive',
          });
          return;
        }

        // Calculate dimensions to crop to square
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        // Draw and resize image
        ctx.drawImage(img, x, y, size, size, 0, 0, 128, 128);

        // Convert to base64
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewUrl(base64);
        onAvatarChange(base64);

        toast({
          title: 'Image chargée',
          description: 'Votre photo de profil a été mise à jour',
        });
      };

      img.onerror = () => {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger l\'image',
          variant: 'destructive',
        });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    if (!userName) return 'U';
    const parts = userName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="w-32 h-32">
        {previewUrl ? (
          <AvatarImage src={previewUrl} alt="Avatar" />
        ) : (
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            <User className="w-16 h-16" />
          </AvatarFallback>
        )}
      </Avatar>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleUploadClick}
      >
        <Upload className="w-4 h-4 mr-2" />
        Changer la photo
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        JPG ou PNG, max 5 Mo<br />
        L'image sera recadrée en 128x128
      </p>
    </div>
  );
}
