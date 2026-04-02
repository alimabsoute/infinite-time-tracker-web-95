import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import PhynxTimerLogo from "@shared/components/PhynxTimerLogo";
const LandingHeader = () => {
  return (
    <motion.header 
      className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 w-full border-b border-border/10 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-0.5">
            <PhynxTimerLogo width={84} height={84} />
            <span className="text-xl font-semibold text-foreground">PhynxTimer</span>
          </Link>

          {/* Navigation - centered */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Reviews
            </Link>
            <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">
              Help
            </Link>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
                Get started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default LandingHeader;