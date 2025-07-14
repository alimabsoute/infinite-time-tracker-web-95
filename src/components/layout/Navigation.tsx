
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Timer, 
  BarChart3, 
  Calendar, 
  FileText, 
  Play,
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
    { path: '/active-timers', label: 'Active Timers', icon: Play },
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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo and Brand - Far Left */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <PhynxTimerLogo className="h-8 w-8" width={32} height={32} />
              <span className="text-xl font-bold text-gray-900">PhynxTimer</span>
            </Link>
          </div>
          
          {/* Navigation Items - Center */}
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Actions - Far Right */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Upgrade to Pro Button */}
            {!subscribed && (
              <Button 
                onClick={handleUpgradeClick}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade to Pro</span>
              </Button>
            )}
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-500 text-white text-sm">
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
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto py-2 px-4 space-x-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {/* Mobile Upgrade Button */}
          {!subscribed && (
            <Button 
              onClick={handleUpgradeClick}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-1"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
