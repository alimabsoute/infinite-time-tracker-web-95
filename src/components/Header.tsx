
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedNavButton } from "@/components/ui/animated-nav-button";
import { Calendar, Home, Table, Crown, BarChart3, Activity, Play } from "lucide-react";
import PhynxTimerLogo from "./PhynxTimerLogo";
import AuthHeader from "./AuthHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { subscribed, createCheckoutSession } = useSubscription();
  
  const handleUpgradeClick = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "/login";
      return;
    }

    const url = await createCheckoutSession();
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <header className="bg-background/60 backdrop-blur-md sticky top-0 z-30 w-full border-b border-border">
      <div className="container flex h-16 items-center px-4 max-w-5xl mx-auto">
        {/* Logo section - moved further left */}
        <div className="flex items-center gap-2 mr-8">
          <Link to="/landing" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <PhynxTimerLogo width={64} height={64} className="text-primary" />
            <span className="text-xl font-semibold">PhynxTimer</span>
          </Link>
        </div>
        
        {/* Navigation and Actions */}
        <div className="flex-1 flex items-center justify-between">
          <nav className="flex items-center gap-3">
            <Link to="/landing">
              <AnimatedNavButton 
                isActive={location.pathname === "/landing"} 
                className="gap-2 px-3 py-2"
              >
                <Home size={18} />
                <span className="hidden sm:inline">Home</span>
              </AnimatedNavButton>
            </Link>
            
            <Link to="/dashboard">
              <AnimatedNavButton 
                isActive={location.pathname === "/dashboard"} 
                className="gap-2 px-3 py-2"
              >
                <PhynxTimerLogo width={32} height={32} className="text-current opacity-70" />
                <span className="hidden sm:inline">Dashboard</span>
              </AnimatedNavButton>
            </Link>
            
            <Link to="/active-timers">
              <AnimatedNavButton 
                isActive={location.pathname === "/active-timers"} 
                className="gap-2 px-3 py-2"
              >
                <Play size={18} />
                <span className="hidden sm:inline">Active</span>
              </AnimatedNavButton>
            </Link>
            
            <Link to="/insights">
              <AnimatedNavButton 
                isActive={location.pathname === "/insights"} 
                className="gap-2 px-3 py-2"
              >
                <BarChart3 size={18} />
                <span className="hidden sm:inline">Insights</span>
              </AnimatedNavButton>
            </Link>
            
            <Link to="/analytics">
              <AnimatedNavButton 
                isActive={location.pathname === "/analytics"} 
                className="gap-2 px-3 py-2"
              >
                <BarChart3 size={18} />
                <span className="hidden sm:inline">Analytics</span>
              </AnimatedNavButton>
            </Link>
            
            <Link to="/advanced-analytics">
              <AnimatedNavButton 
                isActive={location.pathname === "/advanced-analytics"} 
                className="gap-2 px-3 py-2"
              >
                <Activity size={18} />
                <span className="hidden sm:inline">Advanced</span>
              </AnimatedNavButton>
            </Link>
            
            <Link to="/calendar">
              <AnimatedNavButton 
                isActive={location.pathname === "/calendar"} 
                className="gap-2 px-3 py-2"
              >
                <Calendar size={18} />
                <span className="hidden sm:inline">Calendar</span>
              </AnimatedNavButton>
            </Link>
            
            <Link to="/reports">
              <AnimatedNavButton 
                isActive={location.pathname === "/reports"} 
                className="gap-2 px-3 py-2"
              >
                <Table size={18} />
                <span className="hidden sm:inline">Reports</span>
              </AnimatedNavButton>
            </Link>
            
            {/* Orange Upgrade to Pro link - positioned after Reports */}
            {user && !subscribed && (
              <button
                onClick={handleUpgradeClick}
                className="flex items-center gap-2 px-3 py-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors font-medium"
              >
                <Crown size={18} />
                <span className="hidden sm:inline">Upgrade to Pro</span>
                <span className="sm:hidden">Pro</span>
              </button>
            )}
          </nav>
          
          {/* Auth Header with logout functionality */}
          <div className="flex items-center">
            <AuthHeader />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
