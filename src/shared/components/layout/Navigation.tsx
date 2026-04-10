import { Link, useLocation } from 'react-router-dom';
import {
  Timer,
  Calendar,
  FileText,
  LogOut,
  Settings,
  TrendingUp,
  Crown,
} from 'lucide-react';
import { useAuth } from '@features/auth/context/AuthContext';
import { useSubscription } from '@features/billing/context/SubscriptionContext';
import PhynxTimerLogo from '../PhynxTimerLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';

const navItems = [
  { path: '/app/dashboard', label: 'Timers', icon: Timer },
  { path: '/app/analytics', label: 'Analytics', icon: TrendingUp },
  { path: '/app/calendar', label: 'Calendar', icon: Calendar },
  { path: '/app/reports', label: 'Reports', icon: FileText },
];

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { subscribed, createCheckoutSession } = useSubscription();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitial = () =>
    user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  const handleUpgradeClick = async () => {
    try {
      const url = await createCheckoutSession();
      if (url) window.open(url, '_blank');
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <header className="bg-card sticky top-0 z-30 w-full border-b border-border">
      <div className="w-full pl-2 pr-6">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex items-center" style={{ width: '180px', minWidth: '180px' }}>
            <Link to="/app/dashboard" className="flex items-center gap-1">
              <PhynxTimerLogo width={52} height={52} />
              <span className="text-base font-semibold text-foreground whitespace-nowrap">
                PhynxTimer
              </span>
            </Link>
          </div>

          {/* Center nav */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname.startsWith(path);
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 justify-end" style={{ width: '180px', minWidth: '180px' }}>
            {!subscribed && (
              <Button
                onClick={handleUpgradeClick}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 gap-1.5"
              >
                <Crown size={13} />
                <span className="whitespace-nowrap">Go Pro</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium text-sm">
                      {getUserInitial()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {subscribed ? 'Pro Account' : 'Free Account'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="lg:hidden border-t border-border py-2">
          <div className="flex overflow-x-auto gap-1 px-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}

            {!subscribed && (
              <Button
                onClick={handleUpgradeClick}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 gap-1.5 whitespace-nowrap ml-1"
              >
                <Crown size={13} />
                Go Pro
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
