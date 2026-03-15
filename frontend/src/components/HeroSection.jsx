import { useState } from "react";
import { Search, Send, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Circular image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Subtle ring behind */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.05, 0.1, 0.05]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -inset-8 rounded-full"
                style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }}
              />
              <div className="w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] rounded-full overflow-hidden shadow-2xl border-4 border-background">
                <img
                  src={heroDog}
                  alt="Friendly dog"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
            </div>
          </motion.div>

          {/* Right — Text + Search */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center md:text-left"
          >
            <motion.p 
              variants={itemVariants}
              className="uppercase tracking-[0.25em] text-sm md:text-base font-semibold text-primary/80 mb-5"
            >
              Essential Animal Wellness Guide
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight mb-8 text-slate-900"
            >
              {t.title}
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-muted-foreground text-lg mb-10 max-w-lg md:max-w-none"
            >
              {t.subtitle}
            </motion.p>

            {/* Search bar */}
            <motion.div variants={itemVariants} className="max-w-lg mx-auto md:mx-0">
              <div className="flex items-center gap-2 rounded-full bg-card border border-border p-1.5 shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary/20">
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
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 text-white hover:bg-slate-800 shadow-md active:scale-95"
                >
                  <Send className="h-3.5 w-3.5" />
                  Ask
                </button>
              </div>

              {/* Quick questions */}
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
                {quickQuestions.map((q, idx) => (
                  <motion.button
                    key={q}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                    whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--muted))" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/chat", { state: { question: q } })}
                    className="px-4 py-2 rounded-full border border-border text-muted-foreground text-xs font-semibold hover:text-foreground transition-colors shadow-sm"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-50"
      >
        <ChevronDown className="h-6 w-6 text-primary" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
