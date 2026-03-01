import { useState } from "react";
import { Search, Send, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroDog from "@/assets/hero-dog.png";
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
    <section className="relative min-h-[85vh] flex items-center bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Circular image */}
          <div className="flex justify-center animate-fade-in">
            <div className="relative">
              {/* Subtle ring behind */}
              <div
                className="absolute -inset-3 rounded-full opacity-[0.07]"
                style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }}
              />
              <div className="w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] rounded-full overflow-hidden shadow-xl border-4 border-background">
                <img
                  src={heroDog}
                  alt="Friendly dog"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right — Text + Search */}
          <div className="text-center md:text-left animate-slide-up">
            <p className="uppercase tracking-[0.25em] text-sm md:text-base font-semibold text-muted-foreground mb-5">
              Find information about animal diseases, symptoms,
              and treatments in your preferred language
            </p>

            <h1
              className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight mb-10"
              style={{ color: "#1e293b" }}
            >
              {t.title}
            </h1>

            {/* Search bar */}
            <div className="max-w-lg mx-auto md:mx-0">
              <div className="flex items-center gap-2 rounded-full bg-card border border-border p-1.5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about animal health..."
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 py-2.5 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAsk}
                  disabled={!input.trim()}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#1e293b", color: "#ffffff" }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  <Send className="h-3.5 w-3.5" />
                  Ask
                </button>
              </div>

              {/* Quick questions */}
              <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => navigate("/chat", { state: { question: q } })}
                    className="px-3.5 py-1.5 rounded-full border border-border text-muted-foreground text-xs font-medium hover:bg-muted hover:text-foreground transition-colors duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <ChevronDown className="h-5 w-5 text-muted-foreground/40" />
      </div>
    </section>
  );
};

export default HeroSection;
