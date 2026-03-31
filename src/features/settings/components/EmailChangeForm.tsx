import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Mail, Check } from 'lucide-react';
import { supabase } from '@shared/lib/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@features/auth/context/AuthContext';

const EmailChangeForm: React.FC = () => {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === user?.email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail 
      });
      
      if (error) throw error;
      
      toast.success('Email update requested', {
        description: 'Please check both your old and new email for confirmation links.',
      });
      setNewEmail('');
    } catch (error: any) {
      toast.error('Failed to update email', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Change Email
        </CardTitle>
        <CardDescription>
          Update your email address. You'll need to verify both your old and new email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-email">Current Email</Label>
          <div className="flex items-center gap-2">
            <Input
              id="current-email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
            <Check className="h-4 w-4 text-green-500" />
          </div>
        </div>
        
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-email">New Email</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading || !newEmail || newEmail === user?.email}
            className="w-full"
          >
            {loading ? 'Updating...' : 'Update Email'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmailChangeForm;