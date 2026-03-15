import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, Mail, MapPin, Calendar, Award, Briefcase, 
  Hospital, CheckCircle2, XCircle, Search, Filter, 
  Star, Clock, ChevronRight, UserPlus
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const doctors = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200",
    qualification: "BVSc & AH, MVSc (Surgery)",
    experience: 12,
    specialization: "Large Animal Surgery",
    clinic: "City Veterinary Hospital",
    location: "Mumbai, Maharashtra",
    contact: "+91 98765 43210",
    availability: "Available",
    rating: 4.9,
    reviews: 124,
    tags: ["Surgery", "Cattle", "Buffalo"]
  },
  {
    id: 2,
    name: "Dr. Sneha Patil",
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200",
    qualification: "BVSc, PhD (Avian Medicine)",
    experience: 8,
    specialization: "Avian & Exotic Birds",
    clinic: "Paws & Wings Clinic",
    location: "Pune, Maharashtra",
    contact: "+91 91234 56789",
    availability: "In Surgery",
    rating: 4.8,
    reviews: 89,
    tags: ["Birds", "Exotic", "Emergency"]
  },
  {
    id: 3,
    name: "Dr. Amit Sharma",
    photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200",
    qualification: "BVSc & AH",
    experience: 15,
    specialization: "Cattle Health & Nutrition",
    clinic: "Rural Wellness Center",
    location: "Nagpur, Maharashtra",
    contact: "+91 88888 77777",
    availability: "Available",
    rating: 4.7,
    reviews: 210,
    tags: ["Nutrition", "Dairy", "Prevention"]
  },
  {
    id: 4,
    name: "Dr. Priya Mehta",
    photo: "https://images.unsplash.com/photo-1559839734-2b71f1e59816?auto=format&fit=crop&q=80&w=200&h=200",
    qualification: "MVSc (Medicine), Canine Specialist",
    experience: 10,
    specialization: "Small Animal Internal Medicine",
    clinic: "The Pet Care Point",
    location: "Bangalore, Karnataka",
    contact: "+91 77777 66666",
    availability: "Offline",
    rating: 4.9,
    reviews: 156,
    tags: ["Dogs", "Cats", "Internal Medicine"]
  }
];

const DoctorProfiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  const allTags = ["All", ...new Set(doctors.flatMap(d => d.tags))];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === "All" || doc.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="relative mb-16">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full bg-primary/5 text-primary border-primary/20 font-semibold tracking-wider uppercase text-[10px]">
                Expert Consultations
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 font-display italic">
                Our Expert <span className="text-primary not-italic">Veterinarians</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Connect with highly qualified animal health professionals dedicated to the wellness of your pets and livestock.
              </p>
            </motion.div>
          </div>

          {/* Filters & Search */}
          <div className="max-w-4xl mx-auto mb-12 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search by name, specialization, or clinic..."
                  className="pl-12 pr-4 py-6 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20 transition-all text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <Button variant="outline" className="rounded-xl border-slate-200 bg-white flex shrink-0">
                  <Filter className="h-4 w-4 mr-2" /> Filters
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTag === tag 
                    ? "bg-slate-900 text-white shadow-md scale-105" 
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Doctor Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredDoctors.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="group relative h-full bg-white border-slate-200/60 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-[2rem]">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem] group-hover:w-full group-hover:h-32 group-hover:rounded-none transition-all duration-500" />
                    
                    <CardHeader className="relative pt-8 px-8 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <Avatar className="h-20 w-20 ring-4 ring-white shadow-xl transition-transform duration-500 group-hover:scale-110">
                          <AvatarImage src={doc.photo} alt={doc.name} className="object-cover" />
                          <AvatarFallback className="bg-slate-100 text-slate-400 font-bold">{doc.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-end gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`px-3 py-1 rounded-full border shadow-sm ${
                              doc.availability === "Available" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : doc.availability === "In Surgery"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : "bg-slate-50 text-slate-500 border-slate-100"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                              doc.availability === "Available" ? "bg-emerald-500" : doc.availability === "In Surgery" ? "bg-amber-500" : "bg-slate-400"
                            } animate-pulse`} />
                            {doc.availability}
                          </Badge>
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50/50 px-2 py-0.5 rounded-lg border border-amber-100">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {doc.rating}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">{doc.name}</h3>
                        <p className="text-sm font-semibold text-primary/80 uppercase tracking-wide">{doc.qualification}</p>
                      </div>
                    </CardHeader>

                    <CardContent className="px-8 pb-8 space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="bg-slate-100 p-2 rounded-lg"><Briefcase className="h-4 w-4" /></div>
                          <span className="text-sm"><span className="font-bold text-slate-900">{doc.experience}+ Years</span> Experience</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="bg-slate-100 p-2 rounded-lg"><Hospital className="h-4 w-4" /></div>
                          <span className="text-sm truncate font-medium">{doc.clinic}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="bg-slate-100 p-2 rounded-lg"><MapPin className="h-4 w-4" /></div>
                          <span className="text-sm font-medium">{doc.location}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {doc.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md uppercase tracking-tight">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                        <a 
                          href={`tel:${doc.contact}`} 
                          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 hover:bg-primary/10 hover:text-primary transition-all border border-slate-100"
                          title="Call Doctor"
                        >
                          <Phone className="h-5 w-5" />
                        </a>
                        <Button className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold group/btn shadow-lg shadow-slate-200">
                          Book Visit
                          <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredDoctors.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 space-y-4"
            >
              <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <Search className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No doctors found</h3>
              <p className="text-slate-500">Try adjusting your filters or search terms.</p>
              <Button onClick={() => {setSearchTerm(""); setSelectedTag("All");}} variant="link" className="text-primary font-bold">
                Clear all filters
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorProfiles;

