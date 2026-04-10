
import Navigation from '@shared/components/layout/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs';
import { User, Settings as SettingsIcon, Activity, Shield, LogOut } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { supabase } from '@shared/lib/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import EmailChangeForm from '@features/settings/components/EmailChangeForm';
import PasswordChangeForm from '@features/settings/components/PasswordChangeForm';
import SubscriptionStatusCard from '@features/settings/components/SubscriptionStatusCard';
import AccountSecurityCard from '@features/settings/components/AccountSecurityCard';
import ActivityOverviewCard from '@features/settings/components/ActivityOverviewCard';
import DeleteAccountModal from '@features/settings/components/DeleteAccountModal';
import NotificationSettings from '@features/settings/components/NotificationSettings';

const Settings = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Error signing out: ' + error.message);
      } else {
        toast.success('Signed out successfully');
        navigate('/');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account, subscription, and preferences
            </p>
          </div>

          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <EmailChangeForm />
                <PasswordChangeForm />
              </div>

              <NotificationSettings />

              <div className="border border-destructive/20 rounded-lg p-6 bg-destructive/5">
                <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <DeleteAccountModal />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              <SubscriptionStatusCard />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <ActivityOverviewCard />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <AccountSecurityCard />

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Session Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign out of your account on this device.
                </p>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
