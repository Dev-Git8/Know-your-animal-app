import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, AlertTriangle, Pill, Shield, ChevronDown, ChevronUp, 
  Loader2, Search, Bot, PhoneCall, Stethoscope, CheckCircle2, AlertCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAnimalBySlug } from "@/integrations/animalApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import { animalData } from "@/data/animalDiseases";

const AnimalDetail = () => {
  const { animalName } = useParams();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDisease, setExpandedDisease] = useState(null);
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const { language } = useLanguage();

  const t = translations[language]?.animalDetail || translations.en.animalDetail;
  const animalNames = translations[language]?.animals?.animalNames || translations.en.animals.animalNames;

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const data = await getAnimalBySlug(animalName);
        if (data && data.animal && data.animal.diseases && data.animal.diseases.length > 0) {
          setAnimal(data.animal);
          // Default first disease expanded
          setExpandedDisease(data.animal.diseases[0]._id || data.animal.diseases[0].id || 1);
        } else if (animalData[animalName]) {
          const local = animalData[animalName];
          setAnimal({
            _id: animalName,
            slug: animalName,
            name: local.name,
            nameHi: local.nameHi,
            image: local.image,
            description: local.description,
            diseases: local.diseases.map((d, i) => ({ ...d, _id: d.id || i + 1 }))
          });
          setExpandedDisease(local.diseases[0]?.id || 1);
        } else {
          setAnimal(null);
        }
      } catch (err) {
        console.error("Failed to load animal from API, using rich local dataset:", err);
        if (animalData[animalName]) {
          const local = animalData[animalName];
          setAnimal({
            _id: animalName,
            slug: animalName,
            name: local.name,
            nameHi: local.nameHi,
            image: local.image,
            description: local.description,
            diseases: local.diseases.map((d, i) => ({ ...d, _id: d.id || i + 1 }))
          });
          setExpandedDisease(local.diseases[0]?.id || 1);
        } else {
          setAnimal(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnimal();
  }, [animalName]);

  const toggleDisease = (diseaseId) => {
    setExpandedDisease(expandedDisease === diseaseId ? null : diseaseId);
  };

  const translatedAnimalName = animal ? (animalNames[animal.slug] || animal.name) : "";

  // Filter diseases by symptom or disease name
  const filteredDiseases = useMemo(() => {
    if (!animal || !animal.diseases) return [];
    if (!diseaseSearch.trim()) return animal.diseases;

    const q = diseaseSearch.toLowerCase().trim();
    return animal.diseases.filter((d) => {
      const name = (d.name || "").toLowerCase();
      const nameHi = (d.nameHi || "").toLowerCase();
      const causes = (d.causes || "").toLowerCase();
      const treatment = (d.treatment || "").toLowerCase();
      const symptoms = (Array.isArray(d.symptoms) ? d.symptoms : []).join(" ").toLowerCase();

      return name.includes(q) || nameHi.includes(q) || symptoms.includes(q) || causes.includes(q) || treatment.includes(q);
    });
  }, [animal, diseaseSearch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col justify-center items-center pt-40 pb-20">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading veterinary guide & disease records...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="pt-28 pb-20">
          <div className="container mx-auto px-4 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{t.notFound}</h1>
            <p className="text-sm text-slate-500 mb-6">
              The requested animal record does not exist or has been moved.
            </p>
            <Link 
              to="/animals" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.backToAnimals}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Top Breadcrumb */}
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/animals"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.backToAnimals}
            </Link>

            <Link
              to="/chat"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Bot className="h-4 w-4" />
              Ask AI Vet About {translatedAnimalName}
            </Link>
          </div>

          {/* Hero Banner Card */}
          <div className="relative rounded-2xl overflow-hidden mb-8 shadow-md border border-slate-200">
            <img
              src={animal.image || "https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&q=80&w=800"}
              alt={translatedAnimalName}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&q=80&w=800";
              }}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500/80 text-white mb-2 backdrop-blur-md">
                Veterinary Medical Dossier
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                {translatedAnimalName}
                {animal.nameHi && animal.nameHi !== translatedAnimalName && (
                  <span className="text-xl md:text-2xl font-normal text-emerald-300 ml-3">
                    ({animal.nameHi})
                  </span>
                )}
              </h1>
              <p className="text-slate-200 text-sm md:text-base max-w-3xl leading-relaxed">
                {animal.description}
              </p>
            </div>
          </div>

          {/* Disease Search & Stats Header */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                {t.commonDiseases}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed symptoms, immediate first aid, medical cures, and prevention protocols.
              </p>
            </div>

            {/* Quick symptom / disease search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={diseaseSearch}
                onChange={(e) => setDiseaseSearch(e.target.value)}
                placeholder="Search symptom or disease..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
              />
            </div>
          </div>

          {/* Disease List */}
          <div className="space-y-4 mb-10">
            {filteredDiseases.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                <p className="text-sm font-medium">No disease matches "{diseaseSearch}".</p>
                <button
                  onClick={() => setDiseaseSearch("")}
                  className="mt-2 text-xs text-emerald-600 font-semibold hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredDiseases.map((disease) => {
                const diseaseId = disease._id || disease.id;
                const isExpanded = expandedDisease === diseaseId;

                return (
                  <div
                    key={diseaseId}
                    className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleDisease(diseaseId)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                          <h3 className="font-bold text-slate-900 text-base md:text-lg">
                            {disease.name}
                          </h3>
                        </div>
                        {disease.nameHi && (
                          <p className="text-xs font-semibold text-emerald-700 ml-4.5 mt-0.5">
                            {disease.nameHi}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                          {isExpanded ? "Hide Details" : "View Symptoms & Cure"}
                        </span>
                        <div className={`p-1.5 rounded-lg bg-slate-100 text-slate-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-6 pt-2 border-t border-slate-100 bg-white">
                        {/* 1. Symptoms Section */}
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                              Recognizable Symptoms
                            </span>
                            <span className="text-xs text-slate-400">({(disease.symptoms || []).length} Indicators)</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(Array.isArray(disease.symptoms) ? disease.symptoms : []).map((symptom, idx) => (
                              <div 
                                key={idx} 
                                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/40 border border-rose-100 text-slate-800 text-xs font-medium"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                <span>{symptom}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. Medical Cure & Treatment Section */}
                        <div className="mt-5 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                          <div className="flex items-center gap-2 mb-2 text-emerald-900 font-bold text-sm">
                            <Pill className="h-4 w-4 text-emerald-700" />
                            <span>Medical Cure & Treatment Protocol</span>
                          </div>
                          <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-normal">
                            {disease.treatment}
                          </p>
                        </div>

                        {/* 3. Causes & Transmission Section */}
                        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="flex items-center gap-2 mb-1.5 text-slate-800 font-bold text-xs uppercase tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Underlying Causes & Transmission</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {disease.causes}
                          </p>
                        </div>

                        {/* 4. Prevention & Biosecurity Checklist */}
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-emerald-700" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              Prevention & Biosecurity Guidelines
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(Array.isArray(disease.prevention) ? disease.prevention : []).map((tip, idx) => (
                              <div 
                                key={idx} 
                                className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 text-xs"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* AI Vet Consultation Callout Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md mb-8 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Need Live Help with your {translatedAnimalName}?</h3>
                <p className="text-emerald-100 text-xs md:text-sm">
                  Our AI Veterinary Assistant is trained on Indian animal health, dosages, and emergency first aid.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <Link
                to="/chat"
                className="w-full md:w-auto text-center px-5 py-2.5 bg-white text-emerald-800 rounded-xl font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm"
              >
                Chat with AI Vet Now
              </Link>
            </div>
          </div>

          {/* Emergency SOS & Veterinary Disclaimer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SOS Emergency Helpline */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
              <PhoneCall className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-rose-900 text-sm mb-0.5">Emergency Animal Ambulance (Govt 1962)</h4>
                <p className="text-rose-700 text-xs leading-relaxed">
                  For critical emergencies in India, dial the nationwide 24/7 Mobile Veterinary Unit helpline at <strong className="font-black text-rose-950">1962</strong> for emergency on-site assistance.
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm mb-0.5">{t.disclaimer}</h4>
                <p className="text-amber-800 text-xs leading-relaxed">
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
