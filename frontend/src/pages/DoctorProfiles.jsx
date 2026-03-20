import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, MapPin, Hospital, Search, Filter, 
  Star, Briefcase, ChevronRight, CheckCircle2, AlertCircle, Info,
  CalendarDays, XCircle, Clock
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublicDoctors, bookAppointment } from "@/integrations/authApi";

// ── Book Appointment Modal ────────────────────────────────────────────────
const BookingModal = ({ doctor, onClose }) => {
  const [form, setForm] = useState({ petName: "", reason: "", preferredDate: "", preferredTime: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await bookAppointment({ ...form, doctorId: doctor.id });
      setDone(true);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Please log in as a user to book an appointment.");
      } else {
        alert("Booking failed. Please try again.");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="p-10 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Appointment Requested!</h3>
            <p className="text-slate-500 text-sm mb-6">Dr. {doctor.name} will confirm your appointment shortly.</p>
            <button onClick={onClose} className="px-6 py-3 rounded-2xl bg-primary text-white font-black hover:bg-primary/90 transition-all">Done</button>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-900 text-lg">Book Appointment</h2>
                <p className="text-sm text-slate-400">with Dr. {doctor.name}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><XCircle className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Pet Name</label>
                <input value={form.petName} onChange={e => setForm({...form, petName: e.target.value})} required placeholder="e.g. Tommy, Daisy"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Reason for Visit</label>
                <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} required rows={3} placeholder="Describe symptoms or reason for appointment..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Preferred Date</label>
                  <input type="date" value={form.preferredDate} onChange={e => setForm({...form, preferredDate: e.target.value})} required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Preferred Time</label>
                  <select value={form.preferredTime} onChange={e => setForm({...form, preferredTime: e.target.value})} required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select time</option>
                    {["09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-primary text-white font-black text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <CalendarDays className="h-4 w-4" />}
                {loading ? "Booking..." : "Confirm Appointment"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const DoctorProfiles = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Approximate coordinates for Indian cities to simulate proximity
  const cityCoords = {
    "Kochi": { lat: 9.9312, lon: 76.2673 },
    "Chennai": { lat: 13.0827, lon: 80.2707 },
    "Hyderabad": { lat: 17.3850, lon: 78.4867 },
    "Bangalore": { lat: 12.9716, lon: 77.5946 },
    "Mysore": { lat: 12.2958, lon: 76.6394 },
    "Pune": { lat: 18.5204, lon: 73.8567 },
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleUseMyLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setIsLocating(false);
        toast.success("Location detected! Showing experts near you.");
      },
      (err) => {
        setIsLocating(false);
        toast.error("Could not get your location. Showing all experts.");
      }
    );
  };

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { data } = await getPublicDoctors();
        let docs = data.map(d => {
          const city = Object.keys(cityCoords).find(c => d.location.includes(c));
          return {
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
            verified: d.verified,
            isPlatformSuggested: d.isPlatformSuggested,
            tags: d.specialization ? [d.specialization] : [],
            lat: cityCoords[city]?.lat || null,
            lon: cityCoords[city]?.lon || null
          };
        });

        // If user location is available, sort by distance
        if (userCoords) {
           docs = docs.map(d => ({
             ...d,
             distance: d.lat ? calculateDistance(userCoords.lat, userCoords.lon, d.lat, d.lon) : 99999
           })).sort((a, b) => a.distance - b.distance);
        }

        setDoctors(docs);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [userCoords]);

  const allTags = ["All", ...new Set(doctors.map(d => d.specialization).filter(Boolean))];
  const allLocations = ["All", ...new Set(doctors.map(d => d.location).filter(Boolean))];

  const filteredDoctors = doctors.filter(doc => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = doc.name.toLowerCase().includes(s) ||
                         (doc.specialization?.toLowerCase().includes(s)) ||
                         (doc.clinic?.toLowerCase().includes(s)) ||
                         (doc.location?.toLowerCase().includes(s));
    
    const matchesTag = selectedTag === "All" || doc.specialization === selectedTag;
    const matchesLocation = selectedLocation === "All" || doc.location === selectedLocation;

    return matchesSearch && matchesTag && matchesLocation;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col font-inter">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Trusted Veterinary <span className="text-primary italic">Professionals</span>
              </h1>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                Connect with verified experts for your pet's wellness and livestock healthcare.
              </p>
            </motion.div>
          </div>

          {/* Disclaimer */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-3 text-amber-800 text-sm shadow-sm">
                <Info className="h-4 w-4 shrink-0 text-amber-600" />
                <p><strong>Note:</strong> Some profiles are aggregated for user convenience. Look for the <span className="font-bold">Verified</span> badge for authenticated experts.</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="max-w-5xl mx-auto mb-16 space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-stretch group">
              <div className="relative flex-1 shadow-2xl shadow-slate-200/50 rounded-2xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search by name, specialization, or location..."
                  className="pl-14 pr-4 py-8 rounded-2xl border-none bg-white focus-visible:ring-primary/20 transition-all text-lg font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleUseMyLocation} 
                disabled={isLocating}
                variant="outline" 
                className="rounded-2xl border-none bg-white h-auto px-8 font-black text-primary shadow-2xl shadow-slate-200/50 hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center gap-3 py-4 md:py-0"
              >
                <MapPin className={`h-6 w-6 ${isLocating ? 'animate-bounce' : ''}`} /> 
                {isLocating ? "Detecting..." : "Find Nearest Expert"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Filter className="h-3 w-3" /> Specialization
                 </p>
                 <div className="flex flex-wrap gap-2">
                   {allTags.map(tag => (
                     <button
                       key={tag}
                       onClick={() => setSelectedTag(tag)}
                       className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                         selectedTag === tag 
                         ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                         : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                       }`}
                     >
                       {tag}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <MapPin className="h-3 w-3" /> Location
                 </p>
                 <div className="flex flex-wrap gap-2">
                   {allLocations.map(loc => (
                     <button
                       key={loc}
                       onClick={() => setSelectedLocation(loc)}
                       className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                         selectedLocation === loc 
                         ? "bg-slate-800 text-white shadow-lg scale-105" 
                         : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                       }`}
                     >
                       {loc}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          </div>

          {/* Top Rated Section */}
          <div className="mb-12">
             <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
               <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
               Top Rated Veterinary Experts Near You
             </h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {doctors.filter(d => d.rating >= 4.0).slice(0, 2).map(doc => (
                 <Card key={doc.id} className="bg-white p-6 rounded-[2.5rem] border-slate-200 shadow-xl flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0" />
                    <Avatar className="h-32 w-32 border-4 border-white shadow-2xl relative z-10">
                      <AvatarImage src={doc.photo} className="object-cover" />
                      <AvatarFallback className="bg-slate-100 text-2xl font-black">{doc.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4 relative z-10 text-center sm:text-left">
                       <div>
                         <div className="flex flex-wrap gap-2 mb-2 justify-center sm:justify-start">
                           {doc.verified ? (
                             <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1 py-1 px-3">
                               <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                             </Badge>
                           ) : doc.isPlatformSuggested ? (
                             <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1 py-1 px-3">
                               <AlertCircle className="h-3.5 w-3.5" /> Platform Suggested
                             </Badge>
                           ) : null}
                         </div>
                         <h3 className="text-2xl font-black text-slate-900">{doc.name}</h3>
                         <p className="text-primary font-bold text-sm uppercase tracking-widest">{doc.specialization}</p>
                       </div>
                       <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium justify-center sm:justify-start">
                         <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {doc.location}</div>
                         <div className="flex items-center gap-1.5"><Hospital className="h-4 w-4" /> {doc.clinic}</div>
                       </div>
                       <div className="flex items-center gap-1.5 bg-amber-50 w-fit px-3 py-1 rounded-full border border-amber-100 mx-auto sm:mx-0">
                         <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                         <span className="font-black text-amber-700">{doc.rating}</span>
                       </div>
                    </div>
                 </Card>
               ))}
             </div>
          </div>

          {/* All Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredDoctors.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group h-full bg-white border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 rounded-[2rem] flex flex-col">
                    <div className="h-24 bg-slate-900 relative">
                       <div className="absolute -bottom-10 left-8">
                         <Avatar className="h-20 w-20 border-4 border-white shadow-xl">
                            <AvatarImage src={doc.photo} className="object-cover" />
                            <AvatarFallback className="bg-slate-100 font-bold">{doc.name.charAt(0)}</AvatarFallback>
                         </Avatar>
                       </div>
                    </div>
                    
                    <CardHeader className="pt-14 px-8 pb-4">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {doc.verified ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-none px-2 py-0.5 text-[10px] font-bold">
                            VERIFIED
                          </Badge>
                        ) : doc.isPlatformSuggested && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5 text-[10px] font-bold">
                            RECOMMENDED
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{doc.name}</h3>
                      <p className="text-xs font-black text-primary uppercase tracking-tighter">{doc.qualification}</p>
                    </CardHeader>

                    <CardContent className="px-8 pb-8 flex-1 flex flex-col justify-between">
                      <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Exp</p>
                             <div className="flex items-center gap-1.5 text-slate-700 text-sm font-bold">
                               <Briefcase className="h-3.5 w-3.5 text-slate-300" /> {doc.experience} Yrs
                             </div>
                           </div>
                           <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Rating</p>
                             <div className="flex items-center gap-1.5 text-slate-700 text-sm font-bold">
                               <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> {doc.rating}
                             </div>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
                             <Hospital className="h-4 w-4 text-slate-300" /> {doc.clinic}
                           </div>
                           <div className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
                             <MapPin className="h-4 w-4 text-slate-300" /> {doc.location}
                           </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                         <Button
                            variant="outline"
                            className="flex-1 rounded-xl h-11 font-bold border-slate-200 hover:bg-slate-50"
                            onClick={() => window.location.href = `tel:${doc.contact}`}
                          >
                           <Phone className="h-4 w-4 mr-2" /> Call
                         </Button>
                         <Button
                           className="flex-1 rounded-xl h-11 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all"
                           onClick={() => setBookingDoctor(doc)}
                         >
                           <CalendarDays className="h-4 w-4 mr-1.5" /> Book
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal doctor={bookingDoctor} onClose={() => setBookingDoctor(null)} />
      )}
    </div>
  );
};

export default DoctorProfiles;
