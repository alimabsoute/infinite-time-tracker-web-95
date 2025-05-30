
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Home } from "lucide-react";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="bg-background/60 backdrop-blur-md sticky top-0 z-30 w-full border-b border-border">
      <div className="container flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/2d2a4123-86c9-499a-ae22-54e54db1b0df.png" 
              alt="PhynxTimer" 
              className="h-8 w-auto"
            />
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
              <img 
                src="/lovable-uploads/2d2a4123-86c9-499a-ae22-54e54db1b0df.png" 
                alt="" 
                className="h-4 w-auto opacity-70"
              />
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
