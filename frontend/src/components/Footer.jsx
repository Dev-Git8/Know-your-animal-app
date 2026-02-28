import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language]?.footer || translations.en.footer;
  const nav = translations[language]?.nav || translations.en.nav;

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display text-xl font-bold">
                Know Your Animal
              </span>
            </div>
            <p className="text-primary-foreground/80 max-w-md">
              {t.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t.quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {nav.home}
                </Link>
              </li>
              <li>
                <Link to="/animals" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {nav.animals}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t.aboutUs}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t.contact}</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>support@knowyouranimal.in</li>
              <li>+91 1800 XXX XXXX</li>
              <li>Mon - Sat: 9AM - 6PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-center text-primary-foreground/60">
          <p>{t.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
