
import { Clock } from "lucide-react";

const Header = () => {
  return (
    <header className="py-8 mb-6 border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          <div className="bg-accent/20 p-2 rounded-full mr-3">
            <Clock size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            TimeTrack
          </h1>
        </div>
        <p className="text-muted-foreground mt-1 ml-1">Track how you spend your time</p>
      </div>
    </header>
  );
};

export default Header;
