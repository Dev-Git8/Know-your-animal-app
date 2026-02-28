import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Heart, ChevronDown, LogOut, User } from "lucide-react";
import LanguageDropdown from "./LanguageDropdown";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = translations[language] || translations.en;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    await logout();
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Know Your Animal
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="nav-link active">{t.nav.home}</Link>
            <Link to="/animals" className="nav-link">{t.nav.animals}</Link>
            <Link to="/about" className="nav-link">{t.nav.about}</Link>
            <Link to="/vets" className="nav-link">{t.nav.vets}</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LanguageDropdown selectedLanguage={language} onLanguageChange={setLanguage} />
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-card border border-border shadow-lg py-1 animate-fade-in">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                Login
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link to="/" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>{t.nav.home}</Link>
              <Link to="/animals" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>{t.nav.animals}</Link>
              <Link to="/about" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>{t.nav.about}</Link>
              <Link to="/vets" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>{t.nav.vets}</Link>
              <div className="px-4 py-2">
                <LanguageDropdown selectedLanguage={language} onLanguageChange={setLanguage} />
              </div>
              {user ? (
                <>
                  <div className="px-4 py-2 border-t border-border mt-1">
                    <p className="text-sm font-medium text-foreground">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mx-4 flex items-center justify-center gap-2 py-2 rounded-full bg-destructive/10 text-destructive font-medium text-sm hover:bg-destructive/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="mx-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors text-center"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
