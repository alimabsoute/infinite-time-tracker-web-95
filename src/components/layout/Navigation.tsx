import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Timer, 
  BarChart3, 
  Calendar, 
  FileText, 
  User,
  LogOut,
  Settings,
  TrendingUp,
  Activity,
  Crown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
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

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { subscribed, createCheckoutSession } = useSubscription();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Timer },
    // REMOVED: Active Timers tab to simplify timer state management
    // { path: '/active-timers', label: 'Active Timers', icon: Play },
    { path: '/insights', label: 'Insights', icon: BarChart3 },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/advanced-analytics', label: 'Advanced Analytics', icon: Activity },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitial = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleUpgradeClick = async () => {
    try {
      const url = await createCheckoutSession();
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <header className="bg-white sticky top-0 z-30 w-full border-b border-gray-200 shadow-sm">
      <div className="w-full px-8">
        <div className="flex items-center h-16" style={{ minHeight: '64px' }}>
          {/* Left: Logo section - EXACT width */}
          <div className="flex items-center space-x-4" style={{ width: '200px', minWidth: '200px' }}>
            <Link to="/dashboard" className="flex items-center space-x-4">
              <PhynxTimerLogo width={28} height={28} />
              <span className="text-xl font-semibold text-gray-900 whitespace-nowrap">PhynxTimer</span>
            </Link>
          </div>
          
          {/* Center: Navigation - PERFECTLY centered with exact spacing */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden lg:flex items-center" style={{ gap: '32px' }}>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 rounded-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions - EXACT width to match left */}
          <div className="flex items-center space-x-3 justify-end" style={{ width: '200px', minWidth: '200px' }}>
            {/* Upgrade to Pro Button */}
            {!subscribed && (
              <Button 
                onClick={handleUpgradeClick}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-medium rounded-md flex items-center space-x-2"
              >
                <Crown size={16} />
                <span className="whitespace-nowrap">Upgrade to Pro</span>
              </Button>
            )}
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-500 text-white font-medium text-sm">
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
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-200 py-3">
          <div className="flex overflow-x-auto space-x-4 px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Mobile Upgrade Button */}
            {!subscribed && (
              <Button 
                onClick={handleUpgradeClick}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 text-sm font-medium whitespace-nowrap rounded-md flex items-center space-x-2"
              >
                <Crown size={16} />
                <span>Upgrade</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
