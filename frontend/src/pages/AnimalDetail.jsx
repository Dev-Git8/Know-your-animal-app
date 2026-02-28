import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Pill, Shield, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAnimalBySlug } from "@/integrations/animalApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";

const AnimalDetail = () => {
  const { animalName } = useParams();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDisease, setExpandedDisease] = useState(null);
  const { language } = useLanguage();

  const t = translations[language]?.animalDetail || translations.en.animalDetail;
  const animalNames = translations[language]?.animals?.animalNames || translations.en.animals.animalNames;

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const data = await getAnimalBySlug(animalName);
        setAnimal(data.animal);
      } catch (err) {
        console.error("Failed to load animal:", err);
        setAnimal(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimal();
  }, [animalName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">{t.notFound}</h1>
            <Link to="/animals" className="text-primary hover:underline">
              ← {t.backToAnimals}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const toggleDisease = (diseaseId) => {
    setExpandedDisease(expandedDisease === diseaseId ? null : diseaseId);
  };

  const translatedAnimalName = animalNames[animal.slug] || animal.name;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link
            to="/animals"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToAnimals}
          </Link>

          <div className="relative rounded-2xl overflow-hidden mb-8">
            <img
              src={animal.image}
              alt={translatedAnimalName}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                {translatedAnimalName}
              </h1>
              <p className="text-white/70 max-w-2xl">{animal.description}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              {t.commonDiseases}
            </h2>

            <div className="space-y-4">
              {animal.diseases.map((disease) => (
                <div
                  key={disease._id}
                  className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleDisease(disease._id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground text-lg">
                        {disease.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">{disease.nameHi}</p>
                    </div>
                    {expandedDisease === disease._id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {expandedDisease === disease._id && (
                    <div className="px-6 pb-6 border-t border-border animate-fade-in">
                      <div className="mt-4">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-destructive" />
                          {t.symptoms}
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {disease.symptoms.map((symptom, index) => (
                            <li key={index} className="text-muted-foreground text-sm flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                              {symptom}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          {t.causes}
                        </h4>
                        <p className="text-muted-foreground text-sm">{disease.causes}</p>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Pill className="h-4 w-4 text-primary" />
                          {t.treatment}
                        </h4>
                        <p className="text-muted-foreground text-sm">{disease.treatment}</p>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          {t.prevention}
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {disease.prevention.map((tip, index) => (
                            <li key={index} className="text-muted-foreground text-sm flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-600/50" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 md:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  {t.disclaimer}
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  {t.disclaimerText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnimalDetail;
