import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function CookieSettings() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors text-xs whitespace-nowrap">
          Gérer mes préférences
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Préférences de confidentialité</DialogTitle>
          <DialogDescription>
            Gérez la façon dont nous utilisons les cookies sur cette application. 
            Conformément au RGPD, seuls les cookies techniques (nécessaires au fonctionnement) sont utilisés par défaut.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-start flex-col gap-2">
            <div className="flex items-center justify-between w-full">
              <Label htmlFor="necessary" className="font-bold flex flex-col gap-1">
                <span>Cookies strictement nécessaires</span>
                <span className="font-normal text-muted-foreground text-xs">Ces cookies sont essentiels pour vous permettre de vous connecter et d'utiliser l'application (ex: jetons d'authentification).</span>
              </Label>
              <Switch id="necessary" checked disabled />
            </div>
          </div>
          <div className="flex items-start flex-col gap-2 opacity-50">
            <div className="flex items-center justify-between w-full">
              <Label htmlFor="analytics" className="font-bold flex flex-col gap-1">
                <span>Cookies de statistiques</span>
                <span className="font-normal text-muted-foreground text-xs">Actuellement, aucun cookie de statistiques n'est utilisé sur l'application.</span>
              </Label>
              <Switch id="analytics" disabled />
            </div>
          </div>
           <div className="flex items-start flex-col gap-2 opacity-50">
            <div className="flex items-center justify-between w-full">
              <Label htmlFor="marketing" className="font-bold flex flex-col gap-1">
                <span>Cookies Marketing</span>
                <span className="font-normal text-muted-foreground text-xs">Actuellement, aucun cookie marketing n'est utilisé sur l'application.</span>
              </Label>
              <Switch id="marketing" disabled />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
