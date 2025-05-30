
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Home } from "lucide-react";
import PhynxTimerLogo from "./PhynxTimerLogo";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="bg-background/60 backdrop-blur-md sticky top-0 z-30 w-full border-b border-border">
      <div className="container flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <PhynxTimerLogo width={32} height={32} className="text-primary" />
            <span className="text-xl font-semibold">PhynxTimer</span>
          </Link>
        </div>
        
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
          
          <Link to="/calendar">
            <Button 
              variant={location.pathname === "/calendar" ? "secondary" : "ghost"} 
              className="gap-2"
            >
              <Calendar size={18} />
              <span className="hidden sm:inline">Calendar</span>
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
