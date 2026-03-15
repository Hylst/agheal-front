import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, Sparkles, RefreshCw, FileText, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/integrations/api/client';
import { useAuth } from '@/hooks/useAuth';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function handlePushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("VAPID Key missing from env");
        return false;
      }
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }
    
    await apiClient.subscribeToPush(subscription);
    return true;
  } catch (err) {
    console.error('Push error', err);
    return false;
  }
}

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: 'admin' | 'coach' | 'adherent' | null;
}

export function SettingsModal({ open, onOpenChange, role }: SettingsModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Adherent preferences
  const [sessionReminderEmail, setSessionReminderEmail] = useState(true);
  const [sessionReminderPush, setSessionReminderPush] = useState(false);
  const [newSessionsEmail, setNewSessionsEmail] = useState(true);
  const [newSessionsPush, setNewSessionsPush] = useState(false);

  // Coach/Admin preferences
  const [scheduledSessionsEmail, setScheduledSessionsEmail] = useState(true);
  const [scheduledSessionsPush, setScheduledSessionsPush] = useState(false);
  const [renewalReminderEmail, setRenewalReminderEmail] = useState(true);
  const [renewalReminderPush, setRenewalReminderPush] = useState(false);
  const [expiredPaymentEmail, setExpiredPaymentEmail] = useState(false);

  // Nouvelles préférences Adhérent
  const [medicalCertifEmail, setMedicalCertifEmail] = useState(true);
  const [medicalCertifPush, setMedicalCertifPush] = useState(false);

  // Nouvelles préférences Coach/Admin
  const [renewalVerifyEmail, setRenewalVerifyEmail] = useState(true);
  const [renewalVerifyPush, setRenewalVerifyPush] = useState(false);
  const [expiredPaymentPush, setExpiredPaymentPush] = useState(false);

  const isCoachOrAdmin = role === 'coach' || role === 'admin';

  useEffect(() => {
    if (open && user) {
      loadPreferences();
    }
  }, [open, user]);

  const loadPreferences = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await apiClient.getMyProfile();
      if (error) throw new Error(error.message);

      if (data) {
        // getMyProfile retourne { user: { ... } }
        const profileData = (data as any).user || data;
        setSessionReminderEmail(profileData.notify_session_reminder_email ?? true);
        setSessionReminderPush(profileData.notify_session_reminder_push ?? false);
        setNewSessionsEmail(profileData.notify_new_sessions_email ?? true);
        setNewSessionsPush(profileData.notify_new_sessions_push ?? false);
        setScheduledSessionsEmail(profileData.notify_scheduled_sessions_email ?? true);
        setScheduledSessionsPush(profileData.notify_scheduled_sessions_push ?? false);
        setRenewalReminderEmail(profileData.notify_renewal_reminder_email ?? true);
        setRenewalReminderPush(profileData.notify_renewal_reminder_push ?? false);
        setExpiredPaymentEmail(profileData.notify_expired_payment_email ?? false);
        setExpiredPaymentPush(profileData.notify_expired_payment_push ?? false);
        setRenewalVerifyEmail(profileData.notify_renewal_verify_email ?? true);
        setRenewalVerifyPush(profileData.notify_renewal_verify_push ?? false);
        setMedicalCertifEmail(profileData.notify_medical_certif_email ?? true);
        setMedicalCertifPush(profileData.notify_medical_certif_push ?? false);
      }
    } catch (error: any) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates = isCoachOrAdmin
        ? {
          notify_scheduled_sessions_email: scheduledSessionsEmail,
          notify_scheduled_sessions_push: scheduledSessionsPush,
          notify_renewal_reminder_email: renewalReminderEmail,
          notify_renewal_reminder_push: renewalReminderPush,
          notify_expired_payment_email: expiredPaymentEmail,
          notify_expired_payment_push: expiredPaymentPush,
          notify_renewal_verify_email: renewalVerifyEmail,
          notify_renewal_verify_push: renewalVerifyPush,
        }
        : {
          notify_session_reminder_email: sessionReminderEmail,
          notify_session_reminder_push: sessionReminderPush,
          notify_new_sessions_email: newSessionsEmail,
          notify_new_sessions_push: newSessionsPush,
          notify_medical_certif_email: medicalCertifEmail,
          notify_medical_certif_push: medicalCertifPush,
        };

      const enablePush = isCoachOrAdmin 
        ? (scheduledSessionsPush || renewalReminderPush || expiredPaymentPush || renewalVerifyPush)
        : (sessionReminderPush || newSessionsPush || medicalCertifPush);

      if (enablePush) {
        const success = await handlePushSubscription();
        if (!success) {
           toast({
             title: 'Notifications Push non autorisées',
             description: 'Veuillez autoriser les notifications dans votre navigateur.',
             variant: 'destructive',
           });
           // On continue quand même la sauvegarde, mais le push ne marchera pas
        }
      }

      const { error } = await apiClient.updateMyNotifications(updates);
      if (error) throw new Error(error.message);

      toast({
        title: 'Paramètres enregistrés',
        description: 'Vos préférences de notification ont été mises à jour.',
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les préférences.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md sm:max-w-md mx-auto max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Paramètres
          </DialogTitle>
          <DialogDescription>
            Gérez vos préférences de notification
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Chargement...
          </div>
        ) : (
          <div className="space-y-6 py-4 overflow-y-auto flex-1 pr-1">
            {/* Adherent Notifications */}
            {!isCoachOrAdmin && (
              <>
                {/* Session Reminders */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h3 className="font-medium text-sm">Rappel de mes séances</h3>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">
                    Recevoir un rappel la veille à 7h des séances auxquelles vous êtes inscrit
                  </p>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="session-reminder-email" className="text-sm">
                      Par email
                    </Label>
                    <Switch
                      id="session-reminder-email"
                      checked={sessionReminderEmail}
                      onCheckedChange={setSessionReminderEmail}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="session-reminder-push" className="text-sm">
                      Par notification push
                    </Label>
                    <Switch
                      id="session-reminder-push"
                      checked={sessionReminderPush}
                      onCheckedChange={setSessionReminderPush}
                    />
                  </div>
                </div>

                {/* New Sessions Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <h3 className="font-medium text-sm">Nouvelles séances</h3>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">
                    Être notifié lorsque de nouvelles séances sont proposées par les coachs
                  </p>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-sessions-email" className="text-sm">
                      Par email
                    </Label>
                    <Switch
                      id="new-sessions-email"
                      checked={newSessionsEmail}
                      onCheckedChange={setNewSessionsEmail}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-sessions-push" className="text-sm">
                      Par notification push
                    </Label>
                    <Switch
                      id="new-sessions-push"
                      checked={newSessionsPush}
                      onCheckedChange={setNewSessionsPush}
                    />
                  </div>
                </div>

                {/* Medical Certif Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="font-medium text-sm">Certificat médical</h3>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">
                    Recevoir un rappel par e-mail un mois avant la date d'expiration de mon certificat.
                  </p>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="medical-certif-email" className="text-sm">
                      Par email
                    </Label>
                    <Switch
                      id="medical-certif-email"
                      checked={medicalCertifEmail}
                      onCheckedChange={setMedicalCertifEmail}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="medical-certif-push" className="text-sm">
                      Par notification push
                    </Label>
                    <Switch
                      id="medical-certif-push"
                      checked={medicalCertifPush}
                      onCheckedChange={setMedicalCertifPush}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Coach/Admin Notifications */}
            {isCoachOrAdmin && (
              <>
                {/* Scheduled Sessions Reminders */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h3 className="font-medium text-sm">Rappel des séances programmées</h3>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">
                    Recevoir un rappel la veille des séances que vous avez programmées
                  </p>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="scheduled-sessions-email" className="text-sm">
                      Par email
                    </Label>
                    <Switch
                      id="scheduled-sessions-email"
                      checked={scheduledSessionsEmail}
                      onCheckedChange={setScheduledSessionsEmail}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="scheduled-sessions-push" className="text-sm">
                      Par notification push
                    </Label>
                    <Switch
                      id="scheduled-sessions-push"
                      checked={scheduledSessionsPush}
                      onCheckedChange={setScheduledSessionsPush}
                    />
                  </div>
                </div>

                {/* Renewal Reminders */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <RefreshCw className="w-4 h-4 text-secondary" />
                    <h3 className="font-medium text-sm">Rappel de renouvellement</h3>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">
                    Envoi automatique d'un rappel aux adhérents la veille de leur date de renouvellement (7h)
                  </p>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="renewal-reminder-email" className="text-sm">
                      Par email
                    </Label>
                    <Switch
                      id="renewal-reminder-email"
                      checked={renewalReminderEmail}
                      onCheckedChange={setRenewalReminderEmail}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="renewal-reminder-push" className="text-sm">
                      Par notification push
                    </Label>
                    <Switch
                      id="renewal-reminder-push"
                      checked={renewalReminderPush}
                      onCheckedChange={setRenewalReminderPush}
                    />
                  </div>
                </div>

                {/* Expired Payment Alerts */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <h3 className="font-medium text-sm">Alerte Abonnements Expirés</h3>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">
                    Recevoir différents récapitulatifs par e-mail lorsqu'un statut de paiement bascule en "En attente".
                  </p>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="expired-payment-email" className="text-sm">
                      Par email
                    </Label>
                    <Switch
                      id="expired-payment-email"
                      checked={expiredPaymentEmail}
                      onCheckedChange={setExpiredPaymentEmail}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="expired-payment-push" className="text-sm">
                      Par notification push
                    </Label>
                    <Switch
                      id="expired-payment-push"
                      checked={expiredPaymentPush}
                      onCheckedChange={setExpiredPaymentPush}
                    />
                  </div>
                </div>

                {/* Vérification Coach Renouvellement */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="font-medium text-sm">Vérification Documents & Paiements</h3>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">
                    Être notifié en copie quand l'adhérent doit fournir un justificatif ou réglement, pour validation manuelle.
                  </p>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="renewal-verify-email" className="text-sm">
                      Par email
                    </Label>
                    <Switch
                      id="renewal-verify-email"
                      checked={renewalVerifyEmail}
                      onCheckedChange={setRenewalVerifyEmail}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="renewal-verify-push" className="text-sm">
                      Par notification push
                    </Label>
                    <Switch
                      id="renewal-verify-push"
                      checked={renewalVerifyPush}
                      onCheckedChange={setRenewalVerifyPush}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t mt-auto flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || loading} className="flex-1 sm:flex-none">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
