
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Table, 
  Crown, 
  BarChart3, 
  Activity, 
  Play,
  User,
  LogOut,
  Settings
} from "lucide-react";
import PhynxTimerLogo from "./PhynxTimerLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { subscribed, createCheckoutSession } = useSubscription();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/active-timers', label: 'Active Timers', icon: Play },
    { path: '/insights', label: 'Insights', icon: BarChart3 },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/advanced-analytics', label: 'Advanced Analytics', icon: Activity },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/reports', label: 'Reports', icon: Table },
  ];
  
  const handleUpgradeClick = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const url = await createCheckoutSession();
    if (url) {
      window.open(url, '_blank');
    }
  };

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

  return (
    <header className="bg-white sticky top-0 z-30 w-full border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo section */}
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <PhynxTimerLogo width={40} height={40} />
              <span className="text-xl font-semibold text-gray-900">PhynxTimer</span>
            </Link>
          </div>
          
          {/* Center Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
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

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Upgrade to Pro Button */}
            {user && !subscribed && (
              <Button 
                onClick={handleUpgradeClick}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-medium"
              >
                <Crown size={16} className="mr-2" />
                Upgrade to Pro
              </Button>
            )}
            
            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-500 text-white font-medium">
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
                    <Link to="/settings" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
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
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <div className="flex overflow-x-auto space-x-1 px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Mobile Upgrade Button */}
            {user && !subscribed && (
              <Button 
                onClick={handleUpgradeClick}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 text-xs font-medium whitespace-nowrap"
              >
                <Crown size={14} className="mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
