import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Heart, ChevronDown, LogOut, User } from "lucide-react";
import LanguageDropdown from "./LanguageDropdown";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import { useAuth } from "@/contexts/AuthContext";

// ── Nav link with active detection + hover micro-animation ───────────
const NavItem = ({ to, label, onClick }) => {
  const { pathname } = useLocation();
  const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className="group relative px-1 py-1 text-sm font-medium transition-colors duration-200"
      style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
    >
      <span className="relative z-10 transition-colors duration-200 group-hover:text-[hsl(var(--foreground))]">
        {label}
      </span>
      {/* Animated underline */}
      <span
        className="absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300 ease-out"
        style={{
          width: isActive ? "100%" : "0%",
          background: "hsl(var(--primary))",
        }}
      />
      {/* Hover underline (grows from center) */}
      {!isActive && (
        <span className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-[hsl(var(--foreground)/0.3)] transition-all duration-300 ease-out group-hover:w-full" />
      )}
    </Link>
  );
};

// ── Mobile nav link ──────────────────────────────────────────────────
const MobileNavItem = ({ to, label, onClick }) => {
  const { pathname } = useLocation();
  const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-200
        ${isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }
      `}
    >
      {isActive && <span className="w-1 h-1 rounded-full bg-primary" />}
      {label}
    </Link>
  );
};

// ═════════════════════════════════════════════════════════════════════
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = translations[language] || translations.en;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Track scroll for subtle shadow effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  const { pathname } = useLocation();
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    await logout();
    navigate("/auth");
  };

  const navLinks = [
    { to: "/", label: t.nav.home },
    { to: "/animals", label: t.nav.animals },
    { to: "/about", label: t.nav.about },
    { to: "/vets", label: t.nav.vets },
  ];

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        bg-background/80 backdrop-blur-xl
        transition-all duration-300
        ${scrolled ? "shadow-[0_1px_3px_rgba(0,0,0,0.06)]" : ""}
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* ── Logo ──────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform duration-300 group-hover:scale-105">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground tracking-tight">
              Know Your Animal
            </span>
          </Link>

          {/* ── Desktop nav links ─────────────────── */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <NavItem key={link.to} to={link.to} label={link.label} />
            ))}
          </div>

          {/* ── Desktop right side ────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageDropdown selectedLanguage={language} onLanguageChange={setLanguage} />

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                    transition-all duration-200 border
                    ${isDropdownOpen
                      ? "bg-muted border-border text-foreground"
                      : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }
                  `}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="max-w-[100px] truncate">{user.username}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-card border border-border shadow-lg py-1 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-border/60">
                      <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-1.5 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Login
              </Link>
            )}
          </div>

          {/* ── Mobile hamburger ──────────────────── */}
          <button
            className="md:hidden p-2 -mr-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="relative h-5 w-5">
              <Menu className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${isMenuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`} />
              <X className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`} />
            </div>
          </button>
        </div>

        {/* ── Mobile menu ─────────────────────────── */}
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${isMenuOpen ? "max-h-[400px] opacity-100 pb-4" : "max-h-0 opacity-0"}
          `}
        >
          <div className="pt-2 border-t border-border/50">
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <MobileNavItem
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  onClick={() => setIsMenuOpen(false)}
                />
              ))}
            </div>

            <div className="px-4 py-3 mt-2 border-t border-border/50">
              <LanguageDropdown selectedLanguage={language} onLanguageChange={setLanguage} />
            </div>

            {user ? (
              <div className="px-4 pt-2 border-t border-border/50 mt-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="px-4 pt-2 border-t border-border/50 mt-1">
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-2 rounded-lg bg-foreground text-background font-medium text-sm text-center hover:opacity-90 transition-opacity"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
