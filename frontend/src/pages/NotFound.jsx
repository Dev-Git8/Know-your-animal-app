import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="font-display text-7xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Oops! This page seems to have wandered off.</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Home className="h-5 w-5" />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
