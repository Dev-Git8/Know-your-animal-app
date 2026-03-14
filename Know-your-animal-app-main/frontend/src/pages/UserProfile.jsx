import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Phone, Mail, MapPin, Camera, Plus, Trash2, 
  Heart, Activity, Info, Save, Edit2, X, Dog, Cat, 
  Shield, Bell, Settings, ChevronRight, LayoutDashboard
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const UserProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.username || "John Doe",
    email: user?.email || "john@example.com",
    phone: "+91 98765 43210",
    location: "Mumbai, Maharashtra",
    photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200"
  });

  const [pets, setPets] = useState([
    {
      id: 1,
      name: "Buddy",
      type: "Dog",
      breed: "Golden Retriever",
      age: "3 years",
      gender: "Male",
      medicalHistory: "Healthy, regular checkups",
      vaccination: "Up to date",
      emergencyNotes: "Allergic to certain grains",
      status: "Healthy"
    }
  ]);

  const [newPet, setNewPet] = useState({
    name: "",
    type: "Dog",
    breed: "",
    age: "",
    gender: "Male",
    medicalHistory: "",
    vaccination: "",
    emergencyNotes: ""
  });

  const [showAddPet, setShowAddPet] = useState(false);

  const handleProfileSave = () => {
    setIsEditing(false);
    // Simulation of API call
  };

  const handleAddPet = () => {
    if (newPet.name) {
      setPets([...pets, { ...newPet, id: Date.now(), status: "Healthy" }]);
      setNewPet({
        name: "",
        type: "Dog",
        breed: "",
        age: "",
        gender: "Male",
        medicalHistory: "",
        vaccination: "",
        emergencyNotes: ""
      });
      setShowAddPet(false);
    }
  };

  const removePet = (id) => {
    setPets(pets.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Sidebar-style User Info */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full md:w-80 space-y-6 shrink-0"
            >
              <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                <div className="h-32 bg-slate-900" />
                <CardContent className="relative pt-0 px-6 pb-8">
                  <div className="flex flex-col items-center -mt-16 mb-6">
                    <div className="relative">
                      <Avatar className="h-32 w-32 border-8 border-white shadow-2xl">
                        <AvatarImage src={profile.photo} className="object-cover" />
                        <AvatarFallback className="text-3xl bg-slate-100 text-slate-400 font-bold">{profile.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <button className="absolute bottom-1 right-1 p-2.5 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-transform border-4 border-white">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 text-center">
                      <h2 className="text-2xl font-bold text-slate-900 leading-tight">{profile.name}</h2>
                      <p className="text-sm font-semibold text-slate-400 flex items-center justify-center gap-1 mt-1 uppercase tracking-wider">
                        <MapPin className="h-3 w-3" /> {profile.location}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Full Name</Label>
                          <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="rounded-xl border-slate-100 bg-slate-50/50" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Phone</Label>
                          <Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="rounded-xl border-slate-100 bg-slate-50/50" />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button onClick={handleProfileSave} className="flex-1 rounded-xl">Save Changes</Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl px-3 border-slate-200"><X className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                            <Mail className="h-4 w-4 text-primary" />
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Email</span>
                              <span className="font-semibold text-slate-700 truncate max-w-[160px]">{profile.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                            <Phone className="h-4 w-4 text-primary" />
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Phone</span>
                              <span className="font-semibold text-slate-700">{profile.phone}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="secondary" 
                          className="w-full rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold h-12" 
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" /> Edit Details
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 space-y-4">
                <h3 className="font-bold text-slate-900 ml-1">Account Security</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-slate-700">Two-Factor Auth</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-semibold text-slate-700">Notifications</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-8">
              {/* Dashboard Headline */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic">
                    <LayoutDashboard className="h-8 w-8 text-primary not-italic" /> My <span className="text-primary not-italic">Dashboard</span>
                  </h1>
                  <p className="text-slate-500 font-medium">Welcome back, {profile.name}!</p>
                </div>
              </motion.div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "My Pets", value: pets.length, color: "bg-blue-500", icon: Heart },
                  { label: "Visits", value: 12, color: "bg-emerald-500", icon: Calendar },
                  { label: "Alerts", value: 2, color: "bg-amber-500", icon: Bell },
                  { label: "Health Score", value: "98%", color: "bg-indigo-500", icon: Activity },
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * i }}
                    className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className={`p-2 rounded-xl inline-flex mb-3 ${stat.color} bg-opacity-10 text-opacity-100`} style={{ color: stat.color }}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Pets Section */}
              <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-2xl font-bold">My Animal Friends</CardTitle>
                    <CardDescription className="text-slate-400 font-medium tracking-tight">Manage your registered animals and their medical records.</CardDescription>
                  </div>
                  {!showAddPet && (
                    <Button onClick={() => setShowAddPet(true)} className="rounded-2xl gap-2 font-bold px-6 shadow-lg shadow-primary/20">
                      <Plus className="h-5 w-5" /> Register New
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <AnimatePresence mode="wait">
                    {showAddPet ? (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Pet Name</Label>
                              <Input placeholder="Enter name" value={newPet.name} onChange={(e) => setNewPet({...newPet, name: e.target.value})} className="rounded-xl h-12" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Animal Type</Label>
                              <select className="w-full h-12 px-4 rounded-xl border border-input bg-white text-sm focus:ring-2 focus:ring-primary/20 appearance-none font-medium" value={newPet.type} onChange={(e) => setNewPet({...newPet, type: e.target.value})}>
                                <option>Dog</option><option>Cat</option><option>Cow</option><option>Goat</option><option>Bird</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Breed</Label>
                              <Input placeholder="Enter breed" value={newPet.breed} onChange={(e) => setNewPet({...newPet, breed: e.target.value})} className="rounded-xl h-12" />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Emergency Notes</Label>
                              <textarea className="w-full h-32 p-4 rounded-xl border border-input bg-white text-sm focus:ring-2 focus:ring-primary/20 resize-none font-medium" placeholder="Allergies, chronic issues, etc." value={newPet.emergencyNotes} onChange={(e) => setNewPet({...newPet, emergencyNotes: e.target.value})} />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                          <Button onClick={handleAddPet} className="px-8 h-12 rounded-2xl font-bold">Confirm Registration</Button>
                          <Button variant="ghost" onClick={() => setShowAddPet(false)} className="h-12 rounded-2xl font-bold text-slate-400">Cancel</Button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pets.map((pet, idx) => (
                          <motion.div 
                            key={pet.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rotate-45 translate-x-12 -translate-y-12" />
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-lg">
                                  {pet.type === "Dog" ? <Dog className="h-6 w-6" /> : <Cat className="h-6 w-6" />}
                                </div>
                                <div className="space-y-0.5">
                                  <h3 className="text-xl font-black text-slate-900 leading-none">{pet.name}</h3>
                                  <p className="text-xs font-bold text-primary uppercase tracking-wider">{pet.breed}</p>
                                </div>
                              </div>
                              <button onClick={() => removePet(pet.id)} className="p-2 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                              <div className="bg-slate-50 p-3 rounded-2xl">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-widest mb-0.5">Age</span>
                                <span className="text-sm font-bold text-slate-700">{pet.age}</span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-2xl">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-widest mb-0.5">Status</span>
                                <span className="text-sm font-bold text-emerald-600">{pet.status}</span>
                              </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50">
                              <div className="flex items-center justify-between group-hover:px-2 transition-all">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded-full ${pet.vaccination === "Up to date" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                                    <CheckCircle2 className="h-3 w-3" />
                                  </div>
                                  <span className="text-xs font-bold text-slate-500">Vaccination Records</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-200" />
                              </div>
                              <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50">
                                <div className="flex items-center gap-2 text-rose-600 mb-1">
                                  <Info className="h-3 w-3" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">Medical Notes</span>
                                </div>
                                <p className="text-xs font-semibold text-slate-600 italic leading-snug">"{pet.emergencyNotes}"</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Internal icon component for consistent usage
const CheckCircle2 = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default UserProfile;

