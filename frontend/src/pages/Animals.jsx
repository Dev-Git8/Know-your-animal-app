import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1600&h=900&fit=crop"
            alt="Animals in nature"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/60" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {t.title}
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl">
              {t.subtitle}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {animals.map((animal) => (
                <Link
                  key={animal._id}
                  to={`/animals/${animal.slug}`}
                  className="group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
                    <div className="relative w-full h-full">
                      <img
                        src={animal.image}
                        alt={animalNames[animal.slug] || animal.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                        <h3 className="font-semibold text-white text-sm md:text-base">
                          {animalNames[animal.slug] || animal.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Animals;
