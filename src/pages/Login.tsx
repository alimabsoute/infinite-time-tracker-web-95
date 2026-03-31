import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { Timer as TimerIcon } from 'lucide-react';
import ErrorBoundaryAuth from '@/components/ErrorBoundaryAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in the AuthContext
      setIsLoading(false);
    }
  };

  const handleSendReset = async () => {
    try {
      setIsResetting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent', {
        description: 'Check your inbox for the reset link.',
      });
      setForgotOpen(false);
      setResetEmail('');
    } catch (err: any) {
      toast.error('Could not send reset email', {
        description: err?.message || 'Please try again.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <ErrorBoundaryAuth>
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-background to-background/90">
        <Card className="w-[350px] shadow-lg border-muted bg-background/95 backdrop-blur">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TimerIcon width={24} height={24} className="text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">PhynxTimer</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to access your timers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="password"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="text-right -mt-2 mb-2">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setForgotOpen(true)}
                >
                  Forgot your password?
                </button>
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>
          </CardContent>
          <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset your password</DialogTitle>
                <DialogDescription>Enter your account email to receive a reset link.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={isResetting}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setForgotOpen(false)} disabled={isResetting}>Cancel</Button>
                  <Button onClick={handleSendReset} disabled={!resetEmail || isResetting}>
                    {isResetting ? 'Sending...' : 'Send reset link'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <CardFooter>
            <div className="text-center w-full text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </ErrorBoundaryAuth>
  );
};

export default Login;
