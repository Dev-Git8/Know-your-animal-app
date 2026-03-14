import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart, ChevronDown, LogOut, User, LayoutDashboard } from "lucide-react";
import LanguageDropdown from "./LanguageDropdown";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import { useAuth } from "@/contexts/AuthContext";

// ── Nav link with active detection + Framer Motion ───────────
const NavItem = ({ to, label, onClick }) => {
  const { pathname } = useLocation();
  const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative px-1 py-1 text-sm font-semibold transition-colors duration-300 ${
        isActive ? "text-primary" : "text-slate-500 hover:text-slate-900"
      }`}
    >
      <span className="relative z-10">{label}</span>
      {isActive && (
        <motion.span
          layoutId="underline"
          className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-primary"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
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
        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold
        transition-all duration-200
        ${isActive
          ? "bg-primary text-white shadow-lg shadow-primary/20"
          : "text-slate-600 hover:bg-slate-100"
        }
      `}
    >
      {label}
    </Link>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = translations[language] || translations.en;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    { to: "/doctor-profiles", label: t.nav.doctorProfiles || "Experts" },
  ];

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-500
        ${scrolled 
          ? "bg-white/80 backdrop-blur-2xl py-3 shadow-[0_8px_32px_rgba(0,0,0,0.04)]" 
          : "bg-transparent py-5"
        }
      `}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/10"
            >
              <Heart className="h-5 w-5 fill-current text-primary" />
            </motion.div>
            <span className="font-display text-xl font-black text-slate-900 tracking-tight italic">
              KnowYour<span className="text-primary not-italic">Animal</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavItem key={link.to} to={link.to} label={link.label} />
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageDropdown selectedLanguage={language} onLanguageChange={setLanguage} />

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`
                    flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full
                    transition-all duration-300 border
                    ${isDropdownOpen
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }
                  `}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full font-bold text-xs ${isDropdownOpen ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold truncate max-w-[80px]">{user.username}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 rounded-[1.5rem] bg-white border border-slate-100 shadow-2xl overflow-hidden py-1.5"
                    >
                      <div className="px-5 py-4 border-b border-slate-50">
                        <p className="text-sm font-black text-slate-900 truncate">{user.username}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate uppercase mt-0.5 tracking-tight">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        My Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-6 h-10 flex items-center justify-center rounded-full bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden mt-4 overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-xl"
            >
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <MobileNavItem
                      key={link.to}
                      to={link.to}
                      label={link.label}
                      onClick={() => setIsMenuOpen(false)}
                    />
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <div className="px-4 pb-4">
                    <LanguageDropdown selectedLanguage={language} onLanguageChange={setLanguage} />
                  </div>
                  
                  {user ? (
                    <div className="bg-slate-50 p-4 rounded-[1.5rem] space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-slate-900 shadow-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate leading-none mb-1">{user.username}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase truncate tracking-tight">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white shadow-sm border border-slate-100"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="px-4 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full py-4 rounded-3xl bg-slate-900 text-white font-bold text-sm text-center shadow-lg"
                    >
                      Login to Account
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;

