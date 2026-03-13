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
import { Bell, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/integrations/api/client';
import { useAuth } from '@/hooks/useAuth';

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
        }
        : {
          notify_session_reminder_email: sessionReminderEmail,
          notify_session_reminder_push: sessionReminderPush,
          notify_new_sessions_email: newSessionsEmail,
          notify_new_sessions_push: newSessionsPush,
        };

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
