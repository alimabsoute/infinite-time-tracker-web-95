
import React from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <Clock className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-semibold">TimeKeeper</span>
          </div>
          
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/calendar" className="text-muted-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link to="/signup" className="text-muted-foreground hover:text-primary transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TimeKeeper. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
