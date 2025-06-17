
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Home, Table, Crown, Lightbulb } from "lucide-react";
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
          <Link to="/" className="flex items-center gap-2">
            <PhynxTimerLogo width={32} height={32} className="text-primary" />
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
          <nav className="flex items-center gap-4">
            <Link to="/">
              <Button 
                variant={location.pathname === "/" ? "secondary" : "ghost"} 
                className="gap-2"
              >
                <Home size={18} />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            
            <Link to="/dashboard">
              <Button 
                variant={location.pathname === "/dashboard" ? "secondary" : "ghost"} 
                className="gap-2"
              >
                <PhynxTimerLogo width={16} height={16} className="text-current opacity-70" />
                <span className="hidden sm:inline">Timers</span>
              </Button>
            </Link>
            
            <Link to="/insights">
              <Button 
                variant={location.pathname === "/insights" ? "secondary" : "ghost"} 
                className="gap-2"
              >
                <Lightbulb size={18} />
                <span className="hidden sm:inline">Insights</span>
              </Button>
            </Link>
            
            <Link to="/calendar">
              <Button 
                variant={location.pathname === "/calendar" ? "secondary" : "ghost"} 
                className="gap-2"
              >
                <Calendar size={18} />
                <span className="hidden sm:inline">Calendar</span>
              </Button>
            </Link>
            
            <Link to="/reports">
              <Button 
                variant={location.pathname === "/reports" ? "secondary" : "ghost"} 
                className="gap-2"
              >
                <Table size={18} />
                <span className="hidden sm:inline">Reports</span>
              </Button>
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
