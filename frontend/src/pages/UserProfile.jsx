import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Phone, Mail, MapPin, Camera, Plus, Trash2, 
  Heart, Activity, Info, Save, Edit2, X, Dog, Cat, 
  Shield, Bell, Settings, ChevronRight, LayoutDashboard, CalendarDays, Printer,
  Award, CreditCard, Sparkles
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
import { getProfile, updateUserProfile, getMyAppointments } from "@/integrations/authApi";
import { FileText, Download, Loader2 } from "lucide-react";
import { useEffect } from "react";

const UserProfile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: user?.username || "",
        email: user?.email || "",
        phone: user?.contact || "",
        location: user?.location || "",
        bio: user?.bio || "",
        specialization: user?.specialization || "",
        clinic: user?.clinic || "",
        experience: user?.experience || 0,
        photo: user?.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200",
        documents: user?.documents || []
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
            status: "Healthy",
            documents: []
        }
    ]);

    const [newPet, setNewPet] = useState({
        name: "",
        type: "Dog",
        breed: "",
        age: "",
        gender: "Male",
        medicalHistory: "",
        vaccination: "Pending",
        lastCheckup: "",
        assignedVet: "",
        emergencyNotes: "",
        documents: []
    });

    const [showAddPet, setShowAddPet] = useState(false);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getProfile();
                if (data.profile) {
                    setProfile({
                        name: data.profile.name || data.user.username,
                        email: data.user.email,
                        phone: data.profile.phoneNumber || "",
                        location: data.profile.location || "",
                        bio: data.profile.bio || "",
                        specialization: data.profile.specialization || "",
                        clinic: data.profile.clinicName || "",
                        experience: data.profile.yearsOfExperience || 0,
                        photo: data.profile.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200",
                        documents: data.profile.documents || []
                    });
                    if (data.profile.pets) {
                        setPets(data.profile.pets);
                    }
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            }
            try {
                const apptRes = await getMyAppointments();
                setAppointments(apptRes.data || []);
            } catch (err) {
                console.error("Failed to load appointments", err);
            }
        };
        load();
    }, []);

    const handleProfileSave = async () => {
        setIsSaving(true);
        try {
            const data = await updateUserProfile({
                name: profile.name,
                phoneNumber: profile.phone,
                location: profile.location,
                pets: pets // Save pets too
            });
            setIsEditing(false);
            alert("Profile saved!");
        } catch (err) {
            console.error(err);
            alert("Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePetFileUpload = async (e, petId) => {
        const files = e.target.files;
        if (!files || !files.length) return;

        // In a real app, you'd upload to cloud storage and get a URL
        // For this demo, we'll simulate adding local references
        const newDocs = Array.from(files).map(file => ({
            name: file.name,
            url: URL.createObjectURL(file), // Local preview URL
            date: new Date().toLocaleDateString()
        }));

        setPets(prev => prev.map(p => 
            p.id === petId 
                ? { ...p, documents: [...(p.documents || []), ...newDocs] } 
                : p
        ));
    };

    const handleAddPet = async () => {
        if (newPet.name) {
            const updatedPets = [...pets, { ...newPet, id: Date.now(), status: "Healthy" }];
            setPets(updatedPets);
            setNewPet({
                name: "",
                type: "Dog",
                breed: "",
                age: "",
                gender: "Male",
                medicalHistory: "",
                vaccination: "Pending",
                lastCheckup: "",
                assignedVet: "",
                emergencyNotes: "",
                documents: []
            });
            setShowAddPet(false);
            
            // Auto save to backend
            try {
                await updateUserProfile({ pets: updatedPets });
            } catch (err) {
                console.error("Failed to sync pets", err);
            }
        }
    };

    const removePet = async (id) => {
        const updatedPets = pets.filter(p => p.id !== id);
        setPets(updatedPets);
        try {
            await updateUserProfile({ pets: updatedPets });
        } catch (err) {
            console.error("Failed to sync pets", err);
        }
    };

    const printHealthCard = (pet) => {
        const printWindow = window.open("", "_blank", "width=800,height=900");
        if (!printWindow) {
            alert("Please allow popups in your browser to print the health passport.");
            return;
        }
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Digital Animal Health Passport - ${pet.name}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
                    .card { border: 2px solid #0f172a; border-radius: 20px; padding: 32px; max-width: 650px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
                    .logo { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
                    .logo span { color: #16a34a; }
                    .badge { display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 800; border-radius: 999px; text-transform: uppercase; border: 1px solid #a7f3d0; }
                    .title { font-size: 24px; font-weight: 800; margin: 0 0 4px 0; }
                    .subtitle { font-size: 14px; color: #64748b; margin: 0; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
                    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
                    .box-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
                    .box-value { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
                    .emergency-box { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px; margin: 20px 0; }
                    .emergency-label { font-size: 11px; font-weight: 800; color: #be123c; text-transform: uppercase; margin-bottom: 6px; }
                    .emergency-text { font-size: 13px; color: #881337; margin: 0; }
                    .footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 11px; color: #94a3b8; }
                    @media print { body { padding: 0; } .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="no-print" style="text-align: center; margin-bottom: 20px;">
                    <button onclick="window.print()" style="padding: 10px 24px; background: #16a34a; color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 14px;">🖨️ Print / Save as PDF</button>
                </div>
                <div class="card">
                    <div class="header">
                        <div>
                            <div class="logo">KnowYour<span>Animal</span></div>
                            <div class="subtitle">Official Animal Health & Immunization Passport</div>
                        </div>
                        <div class="badge">Verified Record</div>
                    </div>
                    <div>
                        <h1 class="title">${pet.name}</h1>
                        <p class="subtitle">${pet.type} · ${pet.breed || "Standard"} · ${pet.age || "Unknown Age"} · ${pet.gender || "Not specified"}</p>
                    </div>
                    <div class="grid">
                        <div class="box">
                            <div class="box-label">Vaccination Status</div>
                            <div class="box-value">${pet.vaccination || "Pending"}</div>
                        </div>
                        <div class="box">
                            <div class="box-label">Assigned Veterinarian</div>
                            <div class="box-value">${pet.assignedVet || "General Care"}</div>
                        </div>
                        <div class="box">
                            <div class="box-label">Last Checkup</div>
                            <div class="box-value">${pet.lastCheckup || "Recent"}</div>
                        </div>
                        <div class="box">
                            <div class="box-label">Caretaker / Owner</div>
                            <div class="box-value">${profile.name || user?.username || "Registered Owner"}</div>
                        </div>
                    </div>
                    ${pet.emergencyNotes ? `
                    <div class="emergency-box">
                        <div class="emergency-label">⚠️ Emergency Medical Notes / Allergies</div>
                        <div class="emergency-text">${pet.emergencyNotes}</div>
                    </div>` : ''}
                    <div class="footer">
                        Issued via Know Your Animal Digital Health Platform · Verified Pet Identification & Wellness Document
                    </div>
                </div>
                <script>setTimeout(() => window.print(), 500);</script>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-20">
                <div className="container mx-auto px-4 lg:px-8">

                    <div className="flex flex-col md:flex-row gap-8 items-start">

                        {/* Sidebar */}
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
                                            <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                                    {user?.role || "User"}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                    user?.subscriptionPlan === 'farm_pro' 
                                                        ? 'bg-purple-100 text-purple-800 border-purple-200' 
                                                        : (user?.subscriptionPlan === 'care_plus' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200')
                                                }`}>
                                                    ⭐ {user?.subscriptionPlan === 'farm_pro' ? 'Farm Pro' : (user?.subscriptionPlan === 'care_plus' ? 'Care Plus' : 'Free Starter')}
                                                </span>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-400 flex items-center justify-center gap-1 mt-1.5">
                                                <MapPin className="h-3 w-3" /> {profile.location || "Add Location"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Full Name</Label>
                                                    <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="rounded-xl border-slate-100 bg-slate-50/50" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Phone</Label>
                                                    <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="rounded-xl border-slate-100 bg-slate-50/50" />
                                                </div>
                                                {user?.role === "doctor" && (
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Specialization</Label>
                                                        <Input value={profile.specialization} onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} className="rounded-xl border-slate-100 bg-slate-50/50" />
                                                    </div>
                                                )}
                                                <div className="flex gap-2 pt-2">
                                                    <Button onClick={handleProfileSave} disabled={isSaving} className="flex-1 rounded-xl">
                                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                                                    </Button>
                                                    <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl px-3 border-slate-200"><X className="h-4 w-4" /></Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-2.5">
                                                    <div className="flex items-center gap-3.5 text-sm bg-slate-50 p-3.5 rounded-2xl border border-slate-100/60">
                                                        <Mail className="h-4 w-4 text-primary shrink-0" />
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Email</span>
                                                            <span className="font-semibold text-slate-700 truncate text-xs">{profile.email}</span>
                                                        </div>
                                                    </div>
                                                    {profile.phone && (
                                                        <div className="flex items-center gap-3.5 text-sm bg-slate-50 p-3.5 rounded-2xl border border-slate-100/60">
                                                            <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Phone Number</span>
                                                                <span className="font-semibold text-slate-700 truncate text-xs">{profile.phone}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {profile.location && (
                                                        <div className="flex items-center gap-3.5 text-sm bg-slate-50 p-3.5 rounded-2xl border border-slate-100/60">
                                                            <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Location</span>
                                                                <span className="font-semibold text-slate-700 truncate text-xs">{profile.location}</span>
                                                            </div>
                                                        </div>
                                                    )}
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
                        </motion.div>

                        {/* Main Content */}
                        <div className="flex-1 space-y-8">
                            <Tabs defaultValue="pets" className="w-full">
                                <TabsList className="bg-white border p-1 rounded-2xl h-14 mb-8 shadow-sm flex flex-wrap gap-1">
                                    <TabsTrigger value="pets" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">My Animals</TabsTrigger>
                                    <TabsTrigger value="appointments" className="rounded-xl px-5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                                        Appointments ({appointments.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="subscription" className="rounded-xl px-5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                                        Subscription & Plan
                                    </TabsTrigger>
                                    {user?.role === "doctor" && (
                                        <TabsTrigger value="professional" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Professional</TabsTrigger>
                                    )}
                                </TabsList>

                                <TabsContent value="pets">
                                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
                                        <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle className="text-2xl font-bold">My Animals</CardTitle>
                                                <CardDescription>Manage your registered animals.</CardDescription>
                                            </div>
                                            {!showAddPet && (
                                                <Button onClick={() => setShowAddPet(true)} className="rounded-2xl gap-2 font-bold px-6">
                                                    <Plus className="h-5 w-5" /> Register New
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardContent className="px-8 pb-8">
                                            <AnimatePresence mode="wait">
                                                {showAddPet ? (
                                                    <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label>Pet Name</Label>
                                                                    <Input placeholder="Enter name" value={newPet.name} onChange={(e) => setNewPet({ ...newPet, name: e.target.value })} />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label>Type</Label>
                                                                        <select className="w-full h-11 px-4 rounded-xl border text-sm" value={newPet.type} onChange={(e) => setNewPet({ ...newPet, type: e.target.value })}>
                                                                            <option>Dog</option><option>Cat</option><option>Cow</option><option>Goat</option><option>Chicken</option><option>Other</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Breed</Label>
                                                                        <Input placeholder="Breed" value={newPet.breed} onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })} />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label>Age</Label>
                                                                        <Input placeholder="Age" value={newPet.age} onChange={(e) => setNewPet({ ...newPet, age: e.target.value })} />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Vaccination</Label>
                                                                        <select className="w-full h-11 px-4 rounded-xl border text-sm" value={newPet.vaccination} onChange={(e) => setNewPet({ ...newPet, vaccination: e.target.value })}>
                                                                            <option>Up to date</option><option>Pending</option><option>Overdue</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label>Last Checkup</Label>
                                                                    <Input type="date" value={newPet.lastCheckup} onChange={(e) => setNewPet({ ...newPet, lastCheckup: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Assigned Veterinarian</Label>
                                                                    <Input placeholder="Doctor Name" value={newPet.assignedVet} onChange={(e) => setNewPet({ ...newPet, assignedVet: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Emergency Notes</Label>
                                                                    <textarea className="w-full h-20 p-4 rounded-xl border text-sm" placeholder="Allergies, chronic conditions..." value={newPet.emergencyNotes} onChange={(e) => setNewPet({ ...newPet, emergencyNotes: e.target.value })} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-3 mt-8">
                                                            <Button onClick={handleAddPet}>Confirm</Button>
                                                            <Button variant="ghost" onClick={() => setShowAddPet(false)}>Cancel</Button>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {pets.map((pet) => (
                                                            <div key={pet.id} className="bg-white rounded-[2rem] border p-6 shadow-sm relative group">
                                                                <div className="flex justify-between items-start mb-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="p-4 rounded-2xl bg-slate-900 text-white">
                                                                            {pet.type === "Dog" ? <Dog className="h-6 w-6" /> : <Cat className="h-6 w-6" />}
                                                                        </div>
                                                                        <div>
                                                                            <h3 className="text-xl font-black">{pet.name}</h3>
                                                                            <p className="text-xs font-bold text-primary">{pet.breed} • {pet.age}</p>
                                                                            <div className="flex gap-2 mt-1">
                                                                                <Badge variant="outline" className={`text-[10px] font-bold ${pet.vaccination === "Up to date" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                                                                                    {pet.vaccination}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <button onClick={() => removePet(pet.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Last Checkup</p>
                                                                        <p className="text-sm font-bold text-slate-700">{pet.lastCheckup || "Not recorded"}</p>
                                                                    </div>
                                                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Assigned Vet</p>
                                                                        <p className="text-sm font-bold text-slate-700">{pet.assignedVet || "Unassigned"}</p>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="space-y-4">
                                                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Emergency Notes</p>
                                                                        <p className="text-sm text-slate-600 line-clamp-2 italic">"{pet.emergencyNotes || "No emergency notes added"}"</p>
                                                                    </div>

                                                                    {/* Pet Documents Section */}
                                                                    <div className="pt-4 border-t border-slate-100">
                                                                        <div className="flex items-center justify-between mb-3">
                                                                            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                                                                <FileText className="h-4 w-4 text-primary" />
                                                                                Medical Documents
                                                                            </h4>
                                                                            <div className="relative">
                                                                                <input 
                                                                                    type="file" 
                                                                                    multiple 
                                                                                    onChange={(e) => handlePetFileUpload(e, pet.id)} 
                                                                                    className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8" 
                                                                                />
                                                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                                                                                    <Plus className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            {pet.documents && pet.documents.length > 0 ? (
                                                                                pet.documents.map((doc, idx) => (
                                                                                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 group/doc">
                                                                                        <span className="text-[11px] font-bold text-slate-600 truncate max-w-[140px]">{doc.name}</span>
                                                                                        <a href={doc.url} target="_blank" rel="noreferrer" className="p-1.5 hover:text-primary transition-colors">
                                                                                            <Download className="h-3.5 w-3.5" />
                                                                                        </a>
                                                                                    </div>
                                                                                ))
                                                                            ) : (
                                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center py-2">No documents</p>
                                                                            )}
                                                                        </div>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => printHealthCard(pet)}
                                                                            className="w-full mt-4 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-xs font-black text-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                                                                        >
                                                                            <Printer className="h-3.5 w-3.5 text-primary" />
                                                                            Print / Save Health Passport (PDF)
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </AnimatePresence>
                                        </CardContent>
                                    </Card>
                                </TabsContent>


                                {user?.role === "doctor" && (
                                    <TabsContent value="professional">
                                        <Card className="p-8 bg-white rounded-[2.5rem] border-none shadow-xl">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <Label>Bio</Label>
                                                    <textarea className="w-full h-32 p-4 rounded-xl border bg-slate-50" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                                                </div>
                                                <div className="space-y-4">
                                                    <Label>Clinic Name</Label>
                                                    <Input value={profile.clinic} onChange={(e) => setProfile({ ...profile, clinic: e.target.value })} />
                                                    <Button onClick={handleProfileSave} disabled={isSaving} className="w-full">
                                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </TabsContent>
                                )}

                                <TabsContent value="appointments">
                                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
                                        <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle className="text-2xl font-bold">Veterinary Appointments</CardTitle>
                                                <CardDescription>Track consultation status and doctor clinical notes.</CardDescription>
                                            </div>
                                            <a href="/doctor-profiles" className="inline-flex items-center gap-2 rounded-2xl bg-primary text-white text-sm font-bold px-5 py-2.5 hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                                                <Plus className="h-4 w-4" /> Book Appointment
                                            </a>
                                        </CardHeader>
                                        <CardContent className="px-8 pb-8 space-y-4">
                                            {appointments.length === 0 ? (
                                                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                                    <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                                    <p className="text-slate-600 font-bold mb-1">No appointments yet</p>
                                                    <p className="text-slate-400 text-sm mb-4">You have not scheduled any veterinary appointments.</p>
                                                    <a href="/doctor-profiles" className="inline-flex items-center gap-2 text-primary font-bold hover:underline text-sm">
                                                        Find a Doctor & Book Now →
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {appointments.map(appt => {
                                                        const statusColors = {
                                                            pending: "bg-amber-100 text-amber-800 border-amber-200",
                                                            confirmed: "bg-blue-100 text-blue-800 border-blue-200",
                                                            completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
                                                            cancelled: "bg-rose-100 text-rose-800 border-rose-200"
                                                        };
                                                        const badgeStyle = statusColors[appt.status] || statusColors.pending;
                                                        return (
                                                            <div key={appt._id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                                    <div>
                                                                        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                                                            🩺 {appt.doctorName || "Veterinary Doctor"}
                                                                        </h3>
                                                                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                                            🐾 Pet: <span className="font-bold text-slate-700">{appt.petName || "General Consultation"}</span>
                                                                        </p>
                                                                    </div>
                                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${badgeStyle} self-start sm:self-auto`}>
                                                                        {appt.status}
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                                                                    <div>
                                                                        <span className="font-bold text-slate-400 uppercase tracking-wider">Date & Time:</span>{" "}
                                                                        <span className="font-semibold text-slate-800">{appt.preferredDate || "Scheduled"} at {appt.preferredTime || "TBD"}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-bold text-slate-400 uppercase tracking-wider">Reason:</span>{" "}
                                                                        <span className="font-semibold text-slate-800">{appt.reason || "General Consultation"}</span>
                                                                    </div>
                                                                </div>
                                                                {appt.doctorNotes && (
                                                                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-indigo-900">
                                                                        <span className="font-bold text-indigo-600 uppercase tracking-wider block mb-1">Doctor's Clinical Notes:</span>
                                                                        <p className="text-slate-700">{appt.doctorNotes}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="subscription">
                                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
                                        <CardHeader className="px-8 pt-8 pb-4">
                                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                                <Award className="h-6 w-6 text-emerald-600" /> Subscription & Care Membership
                                            </CardTitle>
                                            <CardDescription>Review your active care plan, Razorpay payment verification, and veterinary benefits.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="px-8 pb-8 space-y-6">
                                            {/* Current Active Plan Box */}
                                            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                                            <Sparkles className="h-3 w-3" /> {user?.subscriptionStatus === 'active' ? 'Active Membership' : 'Standard Tier'}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-2xl font-black text-white">
                                                        {user?.subscriptionPlan === 'farm_pro' ? 'Farm Pro (Livestock & Dairy)' : (user?.subscriptionPlan === 'care_plus' ? 'Care Plus (Pet Care)' : 'Free Starter Plan')}
                                                    </h3>
                                                    <p className="text-slate-300 text-xs mt-1.5 max-w-md leading-relaxed">
                                                        {user?.subscriptionPlan === 'farm_pro' 
                                                            ? 'Comprehensive herd & livestock protection for rural cattle, buffaloes, goats, sheep, and poultry.' 
                                                            : (user?.subscriptionPlan === 'care_plus' 
                                                                ? 'Complete pet healthcare protection with unlimited 24/7 AI vet consultations and priority clinic visits.' 
                                                                : 'Basic animal healthcare knowledge with limited online consultations.')}
                                                    </p>
                                                </div>
                                                <div className="text-right flex flex-col items-start md:items-end shrink-0">
                                                    <div className="text-2xl font-black text-emerald-400">
                                                        {user?.subscriptionPlan === 'farm_pro' ? '₹499 / mo' : (user?.subscriptionPlan === 'care_plus' ? '₹199 / mo' : '₹0')}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                                        {user?.subscriptionStatus === 'active' ? 'Payment Verified via Razorpay' : 'No Active Billing'}
                                                    </div>
                                                    <a
                                                        href="/pricing"
                                                        className="mt-3 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md inline-block text-center"
                                                    >
                                                        {user?.subscriptionStatus === 'active' ? 'Manage / Change Plan' : 'Upgrade Membership'}
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Plan Features Checklist */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 font-bold text-sm">
                                                        🤖
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 text-sm">24/7 AI Health Triage</h4>
                                                    <p className="text-xs text-slate-500 mt-1">Instant medical advice for 17 species including symptoms, dosages, and emergency first aid.</p>
                                                </div>
                                                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 font-bold text-sm">
                                                        🩺
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 text-sm">Verified Doctors</h4>
                                                    <p className="text-xs text-slate-500 mt-1">Priority appointment booking with verified clinicians and mobile veterinary clinics.</p>
                                                </div>
                                                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70">
                                                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-2 font-bold text-sm">
                                                        📋
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 text-sm">Digital Health Passports</h4>
                                                    <p className="text-xs text-slate-500 mt-1">Printable official animal immunization passports, allergy notes, and emergency records.</p>
                                                </div>
                                            </div>

                                            {/* Payment Gateway Trust Notice */}
                                            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <Shield className="h-5 w-5 text-emerald-600 shrink-0" />
                                                    <div>
                                                        <div className="text-xs font-bold text-emerald-900">Razorpay Payment Gateway Integration</div>
                                                        <div className="text-[11px] text-emerald-700">Protected with 256-bit SSL encryption and RBI-compliant 3D Secure 2.0 verification.</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs font-black text-emerald-800 uppercase tracking-widest shrink-0">
                                                    100% SECURE
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                            </Tabs>
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

