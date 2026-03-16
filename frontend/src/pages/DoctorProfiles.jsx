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
import { getPublicDoctors } from "@/integrations/authApi";
import { useEffect } from "react";

const DoctorProfiles = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { data } = await getPublicDoctors();
        let docs = data.map(d => ({
          id: d._id,
          name: d.doctorName,
          photo: d.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.doctorName}`,
          qualification: d.qualification,
          experience: d.yearsOfExperience,
          specialization: d.specialization,
          clinic: d.clinicName,
          location: d.location,
          contact: d.contactNumber,
          availability: d.availabilityStatus || "Offline",
          rating: d.rating || 0,
          tags: d.specialization ? [d.specialization] : []
        }));

        if (docs.length === 0) {
          docs = [
            { id: 'f1', name: 'Dr. Ramesh Kumar', specialization: 'Large Animal Specialist', location: 'Bangalore', experience: 12, rating: 4.8, availability: 'Available', clinic: 'Green Valley Vet', qualification: 'MVSc', contact: '9876543210', photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200', tags: ['Livestock'] },
            { id: 'f2', name: 'Dr. Priya Sharma', specialization: 'Pet Surgery Specialist', location: 'Mysore', experience: 8, rating: 4.9, availability: 'Available', clinic: 'Paws & Claws', qualification: 'BVSc', contact: '9876543211', photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200', tags: ['Surgery'] },
            { id: 'f3', name: 'Dr. Arjun Patel', specialization: 'Livestock Health Expert', location: 'Hubli', experience: 10, rating: 4.7, availability: 'Busy', clinic: 'Rural Animal Hospital', qualification: 'MVSc', contact: '9876543212', photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200', tags: ['Cows', 'Goats'] },
            { id: 'f4', name: 'Dr. Sneha Rao', specialization: 'Poultry Disease Specialist', location: 'Mangalore', experience: 7, rating: 4.6, availability: 'Available', clinic: 'Bird Care Center', qualification: 'BVSc', contact: '9876543213', photo: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200&h=200', tags: ['Poultry'] },
            { id: 'f5', name: 'Dr. Karthik Iyer', specialization: 'Small Animal Medicine', location: 'Chennai', experience: 9, rating: 4.5, availability: 'Offline', clinic: 'City Vet Hub', qualification: 'BVSc', contact: '9876543214', photo: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200&h=200', tags: ['Cats', 'Dogs'] },
            { id: 'f6', name: 'Dr. Meera Nair', specialization: 'Dairy Animal Specialist', location: 'Kochi', experience: 11, rating: 4.8, availability: 'Available', clinic: 'Nature Dairy Clinic', qualification: 'MVSc', contact: '9876543215', photo: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200', tags: ['Dairy'] },
          ];
        }
        setDoctors(docs);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const allTags = ["All", ...new Set(doctors.map(d => d.specialization).filter(Boolean))];
  const allLocations = ["All", ...new Set(doctors.map(d => d.location).filter(Boolean))];
  const allStatuses = ["All", "Available", "Busy", "Offline"];

  const filteredDoctors = doctors.filter(doc => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = doc.name.toLowerCase().includes(s) ||
                         (doc.specialization?.toLowerCase().includes(s)) ||
                         (doc.clinic?.toLowerCase().includes(s)) ||
                         (doc.location?.toLowerCase().includes(s));
    
    const matchesTag = selectedTag === "All" || doc.specialization === selectedTag;
    const matchesLocation = selectedLocation === "All" || doc.location === selectedLocation;
    const matchesAvailability = selectedAvailability === "All" || doc.availability === selectedAvailability;

    return matchesSearch && matchesTag && matchesLocation && matchesAvailability;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

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

          {/* Top Rated Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Top Rated Veterinary Experts <span className="text-primary italic">Near You</span></h2>
                <p className="text-slate-500 text-sm">Highly recommended professionals based on user feedback.</p>
              </div>
              <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5">View All</Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
              {doctors.filter(d => d.rating >= 4.5).slice(0, 2).map(doc => (
                <motion.div
                  key={doc.id}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col sm:flex-row gap-8 items-center relative overflow-hidden group/top"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                  <div className="relative">
                    <Avatar className="h-36 w-36 border-4 border-slate-50 shadow-2xl transition-transform duration-500 group-hover/top:scale-105">
                      <AvatarImage src={doc.photo} className="object-cover" />
                      <AvatarFallback className="text-2xl font-black bg-slate-100 text-slate-300">{doc.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-2xl shadow-xl flex items-center gap-1 scale-90 sm:scale-100">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-black">{doc.rating}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 text-center sm:text-left">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-1">{doc.name}</h3>
                      <p className="text-sm font-bold text-primary uppercase tracking-[0.2em]">{doc.specialization}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium justify-center sm:justify-start">
                        <MapPin className="h-4 w-4 text-slate-300" /> {doc.location}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium justify-center sm:justify-start">
                        <Hospital className="h-4 w-4 text-slate-300" /> {doc.clinic}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
                      <Badge className="bg-emerald-500 text-white border-none py-1.5 px-4 rounded-xl shadow-lg shadow-emerald-100">{doc.availability}</Badge>
                      <Badge variant="outline" className="border-slate-200 text-slate-500 bg-slate-50/50 py-1.5 px-4 rounded-xl">{doc.experience} Years Exp</Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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

            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Specialization</p>
                <div className="flex flex-wrap gap-2">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location</p>
                  <div className="flex flex-wrap gap-2">
                    {allLocations.map(loc => (
                      <button
                        key={loc}
                        onClick={() => setSelectedLocation(loc)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selectedLocation === loc 
                          ? "bg-indigo-600 text-white shadow-sm" 
                          : "bg-white border text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Availability</p>
                  <div className="flex flex-wrap gap-2">
                    {allStatuses.map(status => (
                      <button
                        key={status}
                        onClick={() => setSelectedAvailability(status)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selectedAvailability === status 
                          ? "bg-emerald-600 text-white shadow-sm" 
                          : "bg-white border text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
                              : doc.availability === "Busy"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : "bg-slate-50 text-slate-500 border-slate-100"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                              doc.availability === "Available" ? "bg-emerald-500" : doc.availability === "Busy" ? "bg-amber-500" : "bg-slate-400"
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

                      <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className="h-11 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                          onClick={() => window.location.href = `tel:${doc.contact}`}
                        >
                          <Phone className="h-4 w-4" />
                          Contact
                        </Button>
                        <Button className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold group/btn shadow-lg shadow-slate-200">
                          View Profile
                          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
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
              <Button onClick={() => {setSearchTerm(""); setSelectedTag("All"); setSelectedLocation("All"); setSelectedAvailability("All");}} variant="link" className="text-primary font-bold">
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

