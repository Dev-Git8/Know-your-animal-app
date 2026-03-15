import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import { getAllAnimals } from "@/integrations/animalApi";

const Animals = () => {
  const { language } = useLanguage();
  const t = translations[language]?.animals || translations.en.animals;
  const animalNames = t.animalNames;

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const data = await getAllAnimals();
        setAnimals(data.animals);
      } catch (err) {
        console.error("Failed to load animals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1600&h=900&fit=crop"
            alt="Animals in nature"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/60" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
            >
              {t.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/80 text-lg md:text-xl max-w-2xl"
            >
              {t.subtitle}
            </motion.p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            >
              {animals.map((animal) => (
                <motion.div key={animal._id} variants={itemVariants}>
                  <Link
                    to={`/animals/${animal.slug}`}
                    className="group"
                  >
                    <div className="rounded-2xl overflow-hidden bg-white border border-border/40 shadow-sm hover:shadow-xl transition-all duration-300">
                      {/* Image section */}
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={animal.image}
                          alt={animalNames[animal.slug] || animal.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      {/* White name section */}
                      <div className="px-4 py-4 text-center border-t border-border/50">
                        <h3 className="font-display text-base font-bold text-slate-800 tracking-wide group-hover:text-primary transition-colors">
                          {animalNames[animal.slug] || animal.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Animals;
