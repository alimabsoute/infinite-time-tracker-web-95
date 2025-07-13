
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
      <div className="container flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <PhynxTimerLogo width={64} height={64} className="text-primary" />
            <span className="text-xl font-semibold">PhynxTimer</span>
          </Link>
          
          {/* Upgrade Button - only show if user is logged in and not subscribed */}
          {user && !subscribed && (
            <Button
              onClick={handleUpgradeClick}
              size="sm"
              className="ml-2 upgrade-btn-animated"
            >
              <Crown className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Upgrade to Pro</span>
              <span className="sm:hidden">Pro</span>
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-3">
            <Link to="/">
              <AnimatedNavButton 
                isActive={location.pathname === "/"} 
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
          </nav>
          
          {/* Auth Header with logout functionality */}
          <AuthHeader />
        </div>
      </div>
    </header>
  );
};

export default Header;
