
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="bg-background/60 backdrop-blur-md sticky top-0 z-30 w-full border-b border-border">
      <div className="container flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">TimeKeeper</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-4">
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "secondary" : "ghost"} 
              className="gap-2"
            >
              <Clock size={18} />
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
