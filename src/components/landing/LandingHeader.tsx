import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhynxTimerLogo from "../PhynxTimerLogo";

const LandingHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 w-full border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <PhynxTimerLogo width={32} height={32} />
            <span className="text-lg font-semibold">PhynxTimer</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">
                Get started
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground px-1 py-2" onClick={() => setMobileOpen(false)}>
              Features
            </a>
            <a href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground px-1 py-2" onClick={() => setMobileOpen(false)}>
              Pricing
            </a>
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Sign in</Button>
              </Link>
              <Link to="/signup" className="flex-1">
                <Button size="sm" className="w-full">Get started</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingHeader;
