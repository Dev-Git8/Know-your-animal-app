import { useState } from "react";
import { Send, MessageCircle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroAnimals from "@/assets/hero-animals.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";

const HeroSection = () => {
  const { language } = useLanguage();
  const t = translations[language]?.hero || translations.en.hero;
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const handleAsk = () => {
    const msg = input.trim();
    if (!msg) return;
    navigate("/chat", { state: { question: msg } });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const quickQuestions = [
    "My cow has fever, what should I do?",
    "How to prevent diseases in chickens?",
    "Common dog diseases in India",
    "Goat care tips for beginners",
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroAnimals}
          alt="Indian countryside"
          className="w-full h-full object-cover scale-105"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Vignette edges */}
      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: 'inset 0 0 150px 60px hsl(142 20% 5% / 0.6)',
      }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center justify-center min-h-screen pt-16">
        <div className="max-w-4xl mx-auto animate-slide-up">
          <p className="uppercase tracking-[0.35em] text-sm md:text-base font-medium text-primary-foreground/70 mb-6">
            {t.subtitle || "Your trusted companion for animal health"}
          </p>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-10 leading-[0.95] tracking-tight">
            {t.title}
          </h1>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mt-4">
            <div className="search-glass rounded-full p-2 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-4">
                <MessageCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about animal health..."
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground py-3"
                />
              </div>
              <button
                type="button"
                onClick={handleAsk}
                disabled={!input.trim()}
                className="btn-hero disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Ask</span>
              </button>
            </div>

            {/* Quick questions */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => navigate("/chat", { state: { question: q } })}
                  className="px-4 py-2 rounded-full border border-primary-foreground/20 text-primary-foreground/80 text-sm font-medium hover:bg-primary-foreground/10 transition-colors backdrop-blur-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <ChevronDown className="h-6 w-6 text-primary-foreground/50" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
