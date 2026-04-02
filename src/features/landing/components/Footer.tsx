import { Link } from "react-router-dom";
import { Github, Twitter, Instagram } from "lucide-react";
import PhynxTimerLogo from "@shared/components/PhynxTimerLogo";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center">
              <PhynxTimerLogo width={48} height={48} className="text-primary mr-2" />
              <span className="text-xl font-semibold">PhynxTimer</span>
            </div>
            <p className="text-muted-foreground">
              Track your time, boost your productivity, and focus on what matters most.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/app/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/app/calendar" className="text-muted-foreground hover:text-primary transition-colors">
                  Calendar
                </Link>
              </li>
              <li>
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} PhynxTimer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
