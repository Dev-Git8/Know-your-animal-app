import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Loader2, Search, Filter, ShieldCheck, HeartPulse, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import { getAllAnimals } from "@/integrations/animalApi";
import { animalData } from "@/data/animalDiseases";

const CATEGORIES = [
  { id: "all", label: "All Animals", labelHi: "सभी जानवर" },
  { id: "livestock", label: "Livestock & Dairy", labelHi: "दुधारू व पशुधन", slugs: ["cow", "buffalo", "goat", "sheep", "pig"] },
  { id: "pets", label: "Pets & Companions", labelHi: "पालतू जानवर", slugs: ["dog", "cat", "rabbit"] },
  { id: "birds", label: "Birds & Poultry", labelHi: "पक्षी व कुक्कुट", slugs: ["chicken", "duck", "parrot", "pigeon"] },
  { id: "working", label: "Working & Equine", labelHi: "कार्यकारी पशु", slugs: ["horse", "donkey", "camel"] },
  { id: "wildlife", label: "Wildlife", labelHi: "वन्यजीव", slugs: ["bengal-tiger", "elephant"] },
];

const getCategoryMeta = (slug) => {
  if (['cow', 'buffalo', 'goat', 'sheep', 'pig'].includes(slug)) {
    return { label: 'Livestock & Dairy', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  }
  if (['dog', 'cat', 'rabbit'].includes(slug)) {
    return { label: 'Pet Care', color: 'bg-amber-50 text-amber-800 border-amber-200' };
  }
  if (['chicken', 'duck', 'parrot', 'pigeon'].includes(slug)) {
    return { label: 'Birds & Poultry', color: 'bg-sky-50 text-sky-800 border-sky-200' };
  }
  if (['horse', 'donkey', 'camel'].includes(slug)) {
    return { label: 'Equine & Working', color: 'bg-orange-50 text-orange-800 border-orange-200' };
  }
  if (['bengal-tiger', 'tiger', 'elephant'].includes(slug)) {
    return { label: 'Wildlife', color: 'bg-purple-50 text-purple-800 border-purple-200' };
  }
  return { label: 'Animal Care', color: 'bg-blue-50 text-blue-800 border-blue-200' };
};

const Animals = () => {
  const { language } = useLanguage();
  const t = translations[language]?.animals || translations.en.animals;
  const animalNames = t.animalNames || {};

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const data = await getAllAnimals();
        if (data && data.animals && data.animals.length > 0) {
          setAnimals(data.animals);
        } else {
          // Fallback to local full dataset
          const fallbackList = Object.keys(animalData).map((slug) => ({
            _id: slug,
            slug,
            name: animalData[slug].name,
            nameHi: animalData[slug].nameHi,
            image: animalData[slug].image,
            description: animalData[slug].description,
          }));
          setAnimals(fallbackList);
        }
      } catch (err) {
        console.error("Failed to load animals, using rich local dataset:", err);
        const fallbackList = Object.keys(animalData).map((slug) => ({
          _id: slug,
          slug,
          name: animalData[slug].name,
          nameHi: animalData[slug].nameHi,
          image: animalData[slug].image,
          description: animalData[slug].description,
        }));
        setAnimals(fallbackList);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, []);

  // Filtered animals based on Category and Search
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      // 1. Category Filter
      if (selectedCategory !== "all") {
        const cat = CATEGORIES.find((c) => c.id === selectedCategory);
        if (cat && cat.slugs && !cat.slugs.includes(animal.slug)) {
          return false;
        }
      }

      // 2. Search Filter (by Animal Name, Hindi Name, or Symptoms / Diseases)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const primaryName = (animalNames[animal.slug] || animal.name || "").toLowerCase();
        const hindiName = (animal.nameHi || "").toLowerCase();
        const slug = (animal.slug || "").toLowerCase();
        
        // Also check if any diseases or symptoms match
        const diseases = animalData[animal.slug]?.diseases || [];
        const matchesDisease = diseases.some((d) => {
          const dName = (d.name || "").toLowerCase();
          const dNameHi = (d.nameHi || "").toLowerCase();
          const dSymptoms = (d.symptoms || []).map((s) => s.toLowerCase()).join(" ");
          return dName.includes(query) || dNameHi.includes(query) || dSymptoms.includes(query);
        });

        if (
          !primaryName.includes(query) &&
          !hindiName.includes(query) &&
          !slug.includes(query) &&
          !matchesDisease
        ) {
          return false;
        }
      }

      return true;
    });
  }, [animals, selectedCategory, searchQuery, animalNames]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Hero Banner */}
        <section className="relative h-[38vh] min-h-[290px] overflow-hidden">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1600&h=900&fit=crop"
            alt="Animals in nature"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-slate-900/50" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              17 Animals &bull; 60+ Disease & Cure Protocols
            </span>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-3xl md:text-5xl font-extrabold text-white mb-3 tracking-tight"
            >
              {t.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-slate-200 text-sm md:text-base max-w-2xl font-normal leading-relaxed"
            >
              {t.subtitle}
            </motion.p>
          </div>
        </section>

        {/* Filter and Search Bar Section */}
        <div className="container mx-auto px-4 -mt-7 relative z-20">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-4 md:p-6 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search animal, disease, or symptom (e.g., cow, bloat, rabies, colic, fever)..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Quick Popular Keywords */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-600">Quick:</span>
                {["Fever", "Bloat", "Mastitis", "Parvo", "Colic"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-2 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-medium transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-3 border-t border-slate-100 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                <Filter className="h-3.5 w-3.5" /> Category:
              </span>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const count = cat.id === "all" 
                  ? animals.length 
                  : animals.filter((a) => cat.slugs.includes(a.slug)).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20"
                        : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                    }`}
                  >
                    <span>{language === 'hi' ? cat.labelHi : cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-emerald-700/60 text-emerald-100" : "bg-slate-200 text-slate-600"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Animals Grid */}
        <div className="container mx-auto px-4 py-10">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white border border-slate-200/80 p-3 shadow-sm animate-pulse">
                  <div className="aspect-square rounded-xl bg-slate-200 mb-3" />
                  <div className="h-4 bg-slate-200 rounded-md w-3/4 mx-auto mb-2" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : filteredAnimals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
              <HeartPulse className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No animals found</h3>
              <p className="text-sm text-slate-500 mb-4">
                No animal or documented disease matches "{searchQuery}". Try searching for another symptom or animal name.
              </p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Showing {filteredAnimals.length} of {animals.length} Animals
                </p>
                {searchQuery && (
                  <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Filter: "{searchQuery}"
                  </span>
                )}
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
              >
                {filteredAnimals.map((animal) => {
                  const meta = getCategoryMeta(animal.slug);
                  const diseases = animalData[animal.slug]?.diseases || [];
                  const diseaseCount = diseases.length;
                  const sampleDiseases = diseases.slice(0, 2).map((d) => d.name).join(", ");

                  return (
                    <motion.div key={animal._id || animal.slug} variants={itemVariants}>
                      <Link
                        to={`/animals/${animal.slug}`}
                        className="group block h-full"
                      >
                        <div className="h-full rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
                          {/* Image section with Category Badge */}
                          <div className="aspect-[4/3] sm:aspect-square overflow-hidden bg-slate-100 relative">
                            {/* Category Badge */}
                            <div className="absolute top-2 left-2 z-10">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm ${meta.color}`}>
                                {meta.label}
                              </span>
                            </div>

                            {/* Disease count pill */}
                            <div className="absolute bottom-2 right-2 z-10">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/75 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
                                <HeartPulse className="h-2.5 w-2.5 text-emerald-400" />
                                {diseaseCount > 0 ? `${diseaseCount} Diseases` : "Care Guide"}
                              </span>
                            </div>

                            <img
                              src={animal.image || "https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&q=80&w=800"}
                              alt={animalNames[animal.slug] || animal.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&q=80&w=800";
                              }}
                              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                            />
                          </div>

                          {/* Details Section */}
                          <div className="p-3.5 flex-1 flex flex-col justify-between text-left">
                            <div>
                              <h3 className="font-display text-base font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors line-clamp-1">
                                {animalNames[animal.slug] || animal.name}
                              </h3>
                              {animal.nameHi && (
                                <p className="text-xs text-slate-400 font-medium mt-0.5">{animal.nameHi}</p>
                              )}

                              {sampleDiseases && (
                                <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
                                  <span className="font-semibold text-slate-600">Includes:</span> {sampleDiseases}
                                </p>
                              )}
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800">
                              <span>Symptoms & Cures</span>
                              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Animals;
