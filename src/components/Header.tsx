
import { Clock } from "lucide-react";

const Header = () => {
  return (
    <header className="py-6 mb-6 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          <Clock size={24} className="text-primary mr-2" />
          <h1 className="text-2xl font-bold">TimeTrack</h1>
        </div>
        <p className="text-muted-foreground mt-1">Track how you spend your time</p>
      </div>
    </header>
  );
};

export default Header;
