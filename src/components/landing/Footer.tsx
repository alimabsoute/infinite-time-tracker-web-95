import React from "react";
import { Link } from "react-router-dom";
import PhynxTimerLogo from "../PhynxTimerLogo";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <PhynxTimerLogo width={24} height={24} />
              <span className="font-semibold">PhynxTimer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Track your time, understand your habits, own your focus.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
              <li><Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-center text-xs text-muted-foreground">
          &copy; {year} PhynxTimer. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
