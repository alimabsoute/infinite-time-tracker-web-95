import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="text-lg text-muted-foreground">Page not found</p>
        <Link to="/" className="text-primary hover:text-primary/80 underline underline-offset-4 text-sm">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
