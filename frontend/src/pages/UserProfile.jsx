import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Phone, Mail, MapPin, Camera, Plus, Trash2, 
  Heart, Activity, Info, Save, Edit2, Edit3, X, Dog, Cat, 
  Shield, Bell, Settings, ChevronRight, LayoutDashboard, CalendarDays, Printer,
  FileText, Download, Loader2, CheckCircle2, AlertCircle, Sparkles, ExternalLink,
  Stethoscope, Award, Check, Upload, ArrowRight, ShieldCheck, HeartPulse
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateUserProfile, getMyAppointments } from "@/integrations/authApi";

// Pre-defined friendly avatars for quick selection
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250&h=250",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250&h=250",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=250&h=250",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250&h=250",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250&h=250",
];

// Species list with icons & colors
const ANIMAL_TYPES = [
  { label: "Dog", icon: "🐕", desc: "Canine" },
  { label: "Cat", icon: "🐈", desc: "Feline" },
  { label: "Cow / Cattle", icon: "🐄", desc: "Bovine" },
  { label: "Goat / Sheep", icon: "🐐", desc: "Caprine" },
  { label: "Horse", icon: "🐎", desc: "Equine" },
  { label: "Bird", icon: "🦜", desc: "Avian" },
  { label: "Other", icon: "🐾", desc: "Exotic/Other" }
];

const UserProfile = () => {
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("pets");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  const [profile, setProfile] = useState({
    name: user?.username || "Valued User",
    email: user?.email || "",
    phone: "",
    location: "",
    bio: "",
    specialization: "",
    clinic: "",
    experience: 0,
    photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250&h=250",
    documents: []
  });

  const [pets, setPets] = useState([
    {
      id: 1,
      name: "Buddy",
      type: "Dog",
      breed: "Golden Retriever",
      age: "3 years",
      gender: "Male",
      medicalHistory: "Healthy, regular immunizations up to date.",
      vaccination: "Up to date",
      lastCheckup: "2026-09-15",
      assignedVet: "Dr. Sarah Mitchell",
      emergencyNotes: "Sensitive to artificial poultry flavorings.",
      status: "Healthy",
      documents: [
        { name: "Rabies_Vaccine_Cert.pdf", date: "Sep 2026", url: "#" }
      ]
    }
  ]);

  const [newPet, setNewPet] = useState({
    name: "",
    type: "Dog",
    breed: "",
    age: "",
    gender: "Male",
    medicalHistory: "",
    vaccination: "Up to date",
    lastCheckup: "",
    assignedVet: "",
    emergencyNotes: "",
    documents: []
  });

  const [showAddPet, setShowAddPet] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const data = await getProfile();
        if (data && data.profile) {
          setProfile({
            name: data.profile.name || data.user?.username || user?.username || "Pet Parent",
            email: data.user?.email || user?.email || "",
            phone: data.profile.phoneNumber || "",
            location: data.profile.location || "",
            bio: data.profile.bio || "",
            specialization: data.profile.specialization || "",
            clinic: data.profile.clinicName || "",
            experience: data.profile.yearsOfExperience || 0,
            photo: data.profile.profilePhoto || user?.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250&h=250",
            documents: data.profile.documents || []
          });
          if (data.profile.pets && data.profile.pets.length > 0) {
            setPets(data.profile.pets);
          }
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }

      try {
        const apptRes = await getMyAppointments();
        if (apptRes?.data) {
          setAppointments(apptRes.data);
        }
      } catch (err) {
        console.error("Failed to load user appointments:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [user]);

  // Handle saving profile changes
  const handleProfileSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: profile.name,
        phoneNumber: profile.phone,
        location: profile.location,
        profilePhoto: profile.photo,
        bio: profile.bio,
        clinic: profile.clinic,
        specialization: profile.specialization,
        experience: profile.experience,
        pets: pets
      });

      if (refreshProfile) {
        await refreshProfile();
      }

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to save profile changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Select Avatar preset
  const handleSelectAvatar = async (url) => {
    setProfile(prev => ({ ...prev, photo: url }));
    setAvatarDialogOpen(false);
    try {
      await updateUserProfile({ profilePhoto: url });
      if (refreshProfile) await refreshProfile();
    } catch (e) {
      console.error(e);
    }
  };

  // Add custom avatar
  const handleApplyCustomAvatar = async () => {
    if (!customAvatarUrl.trim()) return;
    setProfile(prev => ({ ...prev, photo: customAvatarUrl.trim() }));
    setAvatarDialogOpen(false);
    try {
      await updateUserProfile({ profilePhoto: customAvatarUrl.trim() });
      if (refreshProfile) await refreshProfile();
    } catch (e) {
      console.error(e);
    }
  };

  // Add pet
  const handleAddPet = async () => {
    if (!newPet.name.trim()) {
      alert("Please enter the animal's name");
      return;
    }

    const createdPet = {
      ...newPet,
      id: Date.now(),
      status: "Healthy",
      documents: []
    };

    const updatedPets = [...pets, createdPet];
    setPets(updatedPets);
    setNewPet({
      name: "",
      type: "Dog",
      breed: "",
      age: "",
      gender: "Male",
      medicalHistory: "",
      vaccination: "Up to date",
      lastCheckup: "",
      assignedVet: "",
      emergencyNotes: "",
      documents: []
    });
    setShowAddPet(false);

    try {
      await updateUserProfile({ pets: updatedPets });
    } catch (err) {
      console.error("Failed to sync pets to backend:", err);
    }
  };

  // Remove pet
  const removePet = async (petId) => {
    if (!window.confirm("Are you sure you want to remove this animal's profile?")) return;
    const updatedPets = pets.filter(p => (p.id || p._id) !== petId);
    setPets(updatedPets);
    try {
      await updateUserProfile({ pets: updatedPets });
    } catch (err) {
      console.error("Failed to sync pet removal:", err);
    }
  };

  // Handle local document attachments
  const handlePetFileUpload = (e, petId) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    const newDocs = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }));

    const updatedPets = pets.map(p => 
      (p.id === petId || p._id === petId)
        ? { ...p, documents: [...(p.documents || []), ...newDocs] } 
        : p
    );

    setPets(updatedPets);
    updateUserProfile({ pets: updatedPets }).catch(err => console.error(err));
  };

  // Print Digital Health Passport PDF
  const printHealthCard = (pet) => {
    const printWindow = window.open("", "_blank", "width=850,height=950");
    if (!printWindow) {
      alert("Please allow popups in your browser to print the health passport.");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Digital Animal Health Passport - ${pet.name}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a; 
            background: #ffffff;
            margin: 0;
            padding: 24px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .passport-card {
            max-width: 720px;
            margin: 0 auto;
            border: 2px solid #059669;
            border-radius: 24px;
            padding: 36px;
            background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 28%);
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            position: relative;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 22px;
            margin-bottom: 28px;
          }
          .brand-title {
            font-size: 26px;
            font-weight: 900;
            color: #064e3b;
            letter-spacing: -0.5px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .brand-title span { color: #10b981; }
          .tagline {
            font-size: 11px;
            font-weight: 700;
            color: #047857;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-top: 4px;
          }
          .security-badge {
            background: #065f46;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 6px 16px;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .pet-hero {
            display: flex;
            gap: 24px;
            align-items: center;
            margin-bottom: 28px;
          }
          .pet-avatar {
            width: 90px;
            height: 90px;
            border-radius: 20px;
            background: #d1fae5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 44px;
            border: 3px solid #34d399;
          }
          .pet-title h1 {
            font-size: 32px;
            font-weight: 900;
            color: #0f172a;
            margin: 0;
            line-height: 1.1;
          }
          .pet-title p {
            font-size: 14px;
            font-weight: 600;
            color: #475569;
            margin: 6px 0 0 0;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }
          .meta-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 14px 18px;
          }
          .meta-label {
            font-size: 10px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 4px;
          }
          .meta-val {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
          }
          .status-up { color: #059669; }
          .alert-box {
            background: #fff1f2;
            border: 1.5px solid #fecdd3;
            border-radius: 14px;
            padding: 16px 20px;
            margin-bottom: 24px;
          }
          .alert-label {
            font-size: 11px;
            font-weight: 900;
            color: #e11d48;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .alert-text {
            font-size: 13px;
            font-weight: 600;
            color: #881337;
            margin: 0;
          }
          .footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            margin-top: 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #64748b;
          }
          .no-print-bar {
            text-align: center;
            margin-bottom: 24px;
          }
          .print-btn {
            background: #059669;
            color: white;
            font-weight: 800;
            font-size: 14px;
            padding: 12px 28px;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
          }
          @media print {
            .no-print-bar { display: none; }
            body { padding: 0; }
            .passport-card { box-shadow: none; border-color: #0f172a; }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <button class="print-btn" onclick="window.print()">🖨️ Print or Save as PDF</button>
        </div>
        <div class="passport-card">
          <div class="header">
            <div>
              <div class="brand-title">KnowYour<span>Animal</span></div>
              <div class="tagline">Official Digital Health & Immunization Passport</div>
            </div>
            <div class="security-badge">Verified Document</div>
          </div>

          <div class="pet-hero">
            <div class="pet-avatar">
              ${pet.type === "Cat" ? "🐈" : pet.type === "Cow / Cattle" ? "🐄" : pet.type === "Goat / Sheep" ? "🐐" : pet.type === "Horse" ? "🐎" : pet.type === "Bird" ? "🦜" : "🐕"}
            </div>
            <div class="pet-title">
              <h1>${pet.name}</h1>
              <p>${pet.type} · ${pet.breed || "Standard Breed"} · ${pet.gender || "Gender Not Specified"} · ${pet.age || "Age Unrecorded"}</p>
            </div>
          </div>

          <div class="grid">
            <div class="meta-box">
              <div class="meta-label">Vaccination Status</div>
              <div class="meta-val status-up">${pet.vaccination || "Up to date"}</div>
            </div>
            <div class="meta-box">
              <div class="meta-label">Assigned Veterinarian</div>
              <div class="meta-val">${pet.assignedVet || "Licensed Veterinary Care"}</div>
            </div>
            <div class="meta-box">
              <div class="meta-label">Last Clinical Checkup</div>
              <div class="meta-val">${pet.lastCheckup || "Recent Clinical Assessment"}</div>
            </div>
            <div class="meta-box">
              <div class="meta-label">Registered Guardian / Owner</div>
              <div class="meta-val">${profile.name || user?.username || "Verified Pet Parent"}</div>
            </div>
          </div>

          ${pet.emergencyNotes ? `
          <div class="alert-box">
            <div class="alert-label">⚠️ Emergency Medical Notes / Allergies</div>
            <p class="alert-text">${pet.emergencyNotes}</p>
          </div>
          ` : ""}

          ${pet.medicalHistory ? `
          <div class="meta-box" style="margin-bottom: 24px;">
            <div class="meta-label">General Medical History & Observations</div>
            <div class="meta-val" style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 4px;">
              ${pet.medicalHistory}
            </div>
          </div>
          ` : ""}

          <div class="footer">
            <div>Passport ID: <strong>KYA-PASSPORT-${pet.id || Math.floor(100000 + Math.random() * 900000)}</strong></div>
            <div>Issued by KnowYourAnimal Cloud Platform · Certified Record</div>
          </div>
        </div>
        <script>
          setTimeout(() => window.print(), 400);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Helper for animal emoji
  const getAnimalEmoji = (type) => {
    switch (type) {
      case "Cat": return "🐈";
      case "Cow / Cattle":
      case "Cow": return "🐄";
      case "Goat / Sheep":
      case "Goat": return "🐐";
      case "Horse": return "🐎";
      case "Bird": return "🦜";
      default: return "🐕";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100/70 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          {/* Top Page Header Banner */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full blur-2xl opacity-70 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Pet Care Account
                  </span>
                  <span className="text-xs text-slate-400 font-medium">· Member #{user?._id?.slice(-6) || "KYA782"}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Welcome back, {profile.name.split(" ")[0]}! 👋
                </h1>
                <p className="text-slate-500 text-sm sm:text-base mt-1">
                  Manage your animal profiles, digital health passports, and veterinary consultations.
                </p>
              </div>

              {/* Header Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 relative z-10">
                <Link to="/dashboard">
                  <Button variant="outline" className="rounded-2xl border-slate-200 hover:border-slate-300 font-bold gap-2 text-slate-700 bg-white shadow-xs">
                    <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                    User Dashboard
                  </Button>
                </Link>
                <Link to="/doctor-profiles">
                  <Button className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-md shadow-emerald-600/20">
                    <Stethoscope className="h-4 w-4" />
                    Find a Doctor
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-between shadow-lg shadow-emerald-500/20"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-100" />
                  <span>Profile updated and synchronized successfully!</span>
                </div>
                <button onClick={() => setSaveSuccess(false)} className="text-white/80 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Left Sidebar Profile Card ───────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full lg:w-96 space-y-6 shrink-0"
            >
              {/* Main Identity Card */}
              <Card className="border border-slate-200/80 shadow-xl shadow-slate-200/60 rounded-3xl overflow-hidden bg-white/95 backdrop-blur-md">
                {/* Aesthetic Lush Gradient Banner */}
                <div className="h-32 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
                      <Sparkles className="h-3 w-3 text-emerald-300" />
                      Active Member
                    </span>
                  </div>
                </div>

                <CardContent className="relative pt-0 px-6 pb-6">
                  {/* Floating Avatar with Camera Trigger */}
                  <div className="flex flex-col items-center -mt-16 mb-4">
                    <div className="relative group cursor-pointer" onClick={() => setAvatarDialogOpen(true)}>
                      <Avatar className="h-28 w-28 border-4 border-white shadow-2xl ring-4 ring-emerald-500/10">
                        <AvatarImage src={profile.photo} className="object-cover" />
                        <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-800 font-black">
                          {profile.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        type="button"
                        className="absolute bottom-1 right-1 p-2 bg-emerald-600 text-white rounded-xl shadow-lg group-hover:scale-110 transition-transform border-2 border-white"
                        title="Change Profile Photo"
                      >
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 text-center">
                      <h2 className="text-xl font-black text-slate-900 leading-tight flex items-center justify-center gap-1.5">
                        {profile.name}
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      </h2>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {user?.role === "doctor" ? "Veterinary Specialist" : "Pet Parent"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1 mt-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {profile.location || "Location not set"}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stat Summary Chips */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 my-4 text-center">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <div className="text-lg font-black text-slate-800">{pets.length}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Animals</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <div className="text-lg font-black text-slate-800">{appointments.length}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visits</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <div className="text-lg font-black text-emerald-600">Active</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</div>
                    </div>
                  </div>

                  {/* Contact Cards */}
                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-3 text-sm bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-xs border border-slate-100">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                        <span className="font-semibold text-slate-800 text-xs truncate">{profile.email || user?.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-xs border border-slate-100">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</span>
                        <span className="font-semibold text-slate-800 text-xs">
                          {profile.phone || "No phone added"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Edit CTA button */}
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-bold h-11 transition-all flex items-center justify-center gap-2"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile & Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Care Membership Widget */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <HeartPulse className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">Animal Care Pass</h4>
                      <p className="text-[11px] text-emerald-300 font-semibold">Priority 24/7 Pet Protection</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Need direct consultation support or digital vaccine reminders? Upgrade or manage your care tier in Dashboard.
                </p>
                <Link to="/pricing">
                  <Button className="w-full rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs h-9 shadow-md">
                    View Membership Plans →
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* ── Right Content Area with Segmented Tabs ────────────────── */}
            <div className="flex-1 w-full space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                
                {/* Modern Pill Tab List */}
                <TabsList className="bg-white border border-slate-200/80 p-1.5 rounded-2xl h-auto shadow-sm flex flex-wrap gap-1 mb-6">
                  <TabsTrigger 
                    value="pets" 
                    className="rounded-xl px-5 py-2.5 font-bold text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all flex items-center gap-2"
                  >
                    <span>🐾</span>
                    <span>My Animals</span>
                    <Badge variant="secondary" className="ml-1 text-[11px] px-1.5 py-0 h-5 bg-slate-100 data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
                      {pets.length}
                    </Badge>
                  </TabsTrigger>

                  <TabsTrigger 
                    value="appointments" 
                    className="rounded-xl px-5 py-2.5 font-bold text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all flex items-center gap-2"
                  >
                    <CalendarDays className="h-4 w-4" />
                    <span>Appointments</span>
                    <Badge variant="secondary" className="ml-1 text-[11px] px-1.5 py-0 h-5 bg-slate-100">
                      {appointments.length}
                    </Badge>
                  </TabsTrigger>

                  <TabsTrigger 
                    value="settings" 
                    className="rounded-xl px-5 py-2.5 font-bold text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Personal Details</span>
                  </TabsTrigger>

                  {user?.role === "doctor" && (
                    <TabsTrigger 
                      value="professional" 
                      className="rounded-xl px-5 py-2.5 font-bold text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all flex items-center gap-2"
                    >
                      <Stethoscope className="h-4 w-4" />
                      <span>Doctor Practice</span>
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* ── TAB 1: MY ANIMALS ─────────────────────────────── */}
                <TabsContent value="pets" className="space-y-6 focus-visible:outline-none">
                  <Card className="border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl bg-white overflow-hidden">
                    <CardHeader className="px-6 sm:px-8 pt-8 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                          <span>Registered Animals</span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            {pets.length} Total
                          </span>
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-xs sm:text-sm mt-0.5">
                          Track digital health profiles, generate verified health passports, and upload medical records.
                        </CardDescription>
                      </div>

                      {!showAddPet && (
                        <Button 
                          onClick={() => setShowAddPet(true)} 
                          className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-5 py-2.5 shadow-md shadow-emerald-600/20 shrink-0"
                        >
                          <Plus className="h-4 w-4" /> Register New Animal
                        </Button>
                      )}
                    </CardHeader>

                    <CardContent className="p-6 sm:p-8">
                      {/* Add Animal Form Container */}
                      <AnimatePresence>
                        {showAddPet && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 p-6 sm:p-8 rounded-3xl bg-slate-50/80 border-2 border-emerald-500/20 shadow-inner"
                          >
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                              <div>
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                  <span>🐾 Register New Animal Profile</span>
                                </h3>
                                <p className="text-xs text-slate-500">Provide health details to issue a digital animal health passport.</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => setShowAddPet(false)} className="rounded-xl">
                                <X className="h-5 w-5 text-slate-400" />
                              </Button>
                            </div>

                            {/* Animal Type Selector Pills */}
                            <div className="mb-6">
                              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Select Animal Type</Label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                {ANIMAL_TYPES.map(typeItem => (
                                  <button
                                    key={typeItem.label}
                                    type="button"
                                    onClick={() => setNewPet(prev => ({ ...prev, type: typeItem.label }))}
                                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                                      newPet.type === typeItem.label
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                                        : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                                    }`}
                                  >
                                    <span className="text-2xl">{typeItem.icon}</span>
                                    <span className="text-[11px] font-black truncate">{typeItem.label.split(" ")[0]}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-xs font-bold text-slate-600">Animal Name *</Label>
                                  <Input
                                    placeholder="e.g. Bella, Max, Daisy"
                                    value={newPet.name}
                                    onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                                    className="rounded-xl border-slate-200 bg-white h-11 mt-1 text-sm font-semibold"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-xs font-bold text-slate-600">Breed</Label>
                                    <Input
                                      placeholder="e.g. Golden Retriever"
                                      value={newPet.breed}
                                      onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                                      className="rounded-xl border-slate-200 bg-white h-11 mt-1 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold text-slate-600">Age / DOB</Label>
                                    <Input
                                      placeholder="e.g. 2 years, 6 months"
                                      value={newPet.age}
                                      onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
                                      className="rounded-xl border-slate-200 bg-white h-11 mt-1 text-sm"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-xs font-bold text-slate-600">Gender</Label>
                                    <select
                                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm mt-1 font-medium focus:ring-2 focus:ring-emerald-500"
                                      value={newPet.gender}
                                      onChange={(e) => setNewPet({ ...newPet, gender: e.target.value })}
                                    >
                                      <option>Male</option>
                                      <option>Female</option>
                                      <option>Neutered / Spayed</option>
                                      <option>Unknown</option>
                                    </select>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold text-slate-600">Vaccination Status</Label>
                                    <select
                                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm mt-1 font-medium focus:ring-2 focus:ring-emerald-500"
                                      value={newPet.vaccination}
                                      onChange={(e) => setNewPet({ ...newPet, vaccination: e.target.value })}
                                    >
                                      <option>Up to date</option>
                                      <option>Pending</option>
                                      <option>Overdue</option>
                                    </select>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-xs font-bold text-slate-600">Last Checkup</Label>
                                    <Input
                                      type="date"
                                      value={newPet.lastCheckup}
                                      onChange={(e) => setNewPet({ ...newPet, lastCheckup: e.target.value })}
                                      className="rounded-xl border-slate-200 bg-white h-11 mt-1 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold text-slate-600">Assigned Doctor</Label>
                                    <Input
                                      placeholder="e.g. Dr. Emily Carter"
                                      value={newPet.assignedVet}
                                      onChange={(e) => setNewPet({ ...newPet, assignedVet: e.target.value })}
                                      className="rounded-xl border-slate-200 bg-white h-11 mt-1 text-sm"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-xs font-bold text-slate-600">Emergency & Allergy Notes</Label>
                                  <Input
                                    placeholder="Allergies to medications, dietary restrictions..."
                                    value={newPet.emergencyNotes}
                                    onChange={(e) => setNewPet({ ...newPet, emergencyNotes: e.target.value })}
                                    className="rounded-xl border-slate-200 bg-white h-11 mt-1 text-sm"
                                  />
                                </div>

                                <div>
                                  <Label className="text-xs font-bold text-slate-600">Medical Notes / Background</Label>
                                  <textarea
                                    className="w-full h-20 p-3 rounded-xl border border-slate-200 bg-white text-sm mt-1 resize-none"
                                    placeholder="General clinical history, surgical records, or health observations..."
                                    value={newPet.medicalHistory}
                                    onChange={(e) => setNewPet({ ...newPet, medicalHistory: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                              <Button onClick={handleAddPet} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6">
                                Save & Register Animal
                              </Button>
                              <Button variant="ghost" onClick={() => setShowAddPet(false)} className="rounded-xl">
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Animal Cards Grid */}
                      {pets.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50/60 rounded-3xl border-2 border-dashed border-slate-200">
                          <div className="text-5xl mb-3">🐾</div>
                          <h3 className="text-lg font-black text-slate-800">No Animals Registered Yet</h3>
                          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                            Register your dogs, cats, cattle, or other animals to unlock digital health passports and vaccination tracking.
                          </p>
                          <Button onClick={() => setShowAddPet(true)} className="rounded-2xl bg-emerald-600 text-white font-bold gap-2">
                            <Plus className="h-4 w-4" /> Register First Animal
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {pets.map((pet) => {
                            const isUpToDate = pet.vaccination === "Up to date";
                            const isPending = pet.vaccination === "Pending";

                            return (
                              <div
                                key={pet.id || pet._id}
                                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 relative group flex flex-col justify-between"
                              >
                                <div>
                                  {/* Top Card Header */}
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3.5">
                                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl shadow-xs">
                                        {getAnimalEmoji(pet.type)}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h3 className="text-xl font-black text-slate-900">{pet.name}</h3>
                                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                            {pet.gender || "Animal"}
                                          </span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 mt-0.5">
                                          {pet.type} · {pet.breed || "Standard"} · {pet.age || "Unknown age"}
                                        </p>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => removePet(pet.id || pet._id)}
                                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                      title="Remove Animal"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>

                                  {/* Vaccination Badge & Health Pill */}
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                                      isUpToDate
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : isPending
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-rose-50 text-rose-700 border-rose-200"
                                    }`}>
                                      <span className={`w-2 h-2 rounded-full ${isUpToDate ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-rose-500"}`} />
                                      Vaccines: {pet.vaccination || "Pending"}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">
                                      🩺 {pet.assignedVet || "General Clinic"}
                                    </span>
                                  </div>

                                  {/* Clinical Summary Grid */}
                                  <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs">
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Last Checkup</span>
                                      <span className="font-bold text-slate-800">{pet.lastCheckup || "Recent examination"}</span>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Health State</span>
                                      <span className="font-bold text-emerald-700">Healthy & Active</span>
                                    </div>
                                  </div>

                                  {/* Emergency Notes */}
                                  {pet.emergencyNotes && (
                                    <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 mb-4 text-xs">
                                      <span className="font-black text-amber-800 uppercase tracking-wider text-[10px] block mb-1">
                                        ⚠️ Emergency Notes / Allergies:
                                      </span>
                                      <p className="text-amber-900 font-medium">{pet.emergencyNotes}</p>
                                    </div>
                                  )}

                                  {/* Documents Section */}
                                  <div className="pt-3 border-t border-slate-100 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5 text-emerald-600" />
                                        Medical Records ({pet.documents?.length || 0})
                                      </span>
                                      <div className="relative">
                                        <input
                                          type="file"
                                          multiple
                                          onChange={(e) => handlePetFileUpload(e, pet.id || pet._id)}
                                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg">
                                          <Upload className="h-3 w-3 mr-1" /> Add Files
                                        </Button>
                                      </div>
                                    </div>

                                    {pet.documents && pet.documents.length > 0 ? (
                                      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                                        {pet.documents.map((doc, idx) => (
                                          <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                                            <span className="font-bold text-slate-700 truncate max-w-[160px]">{doc.name}</span>
                                            <a href={doc.url} download={doc.name} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-800 p-1">
                                              <Download className="h-3.5 w-3.5" />
                                            </a>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[11px] text-slate-400 italic">No immunization documents attached yet.</p>
                                    )}
                                  </div>
                                </div>

                                {/* Bottom Print Button */}
                                <Button
                                  type="button"
                                  onClick={() => printHealthCard(pet)}
                                  className="w-full mt-2 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-black text-xs gap-2 shadow-xs transition-all"
                                >
                                  <Printer className="h-4 w-4 text-emerald-600" />
                                  Print Digital Health Passport (PDF)
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── TAB 2: APPOINTMENTS ───────────────────────────── */}
                <TabsContent value="appointments" className="space-y-6 focus-visible:outline-none">
                  <Card className="border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl bg-white overflow-hidden">
                    <CardHeader className="px-6 sm:px-8 pt-8 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                          <span>Veterinary Consultations</span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            {appointments.length} Total
                          </span>
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-xs sm:text-sm mt-0.5">
                          Track consultation status, doctor clinical reports, and scheduled visits.
                        </CardDescription>
                      </div>

                      <Link to="/doctor-profiles">
                        <Button className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-5 py-2.5 shadow-md shadow-emerald-600/20">
                          <Plus className="h-4 w-4" /> Book New Visit
                        </Button>
                      </Link>
                    </CardHeader>

                    <CardContent className="p-6 sm:p-8">
                      {appointments.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50/60 rounded-3xl border-2 border-dashed border-slate-200">
                          <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <h3 className="text-lg font-black text-slate-800">No Scheduled Appointments</h3>
                          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                            Connect with registered veterinary specialists across your region for general checkups, vaccines, or urgent care.
                          </p>
                          <Link to="/doctor-profiles">
                            <Button className="rounded-2xl bg-emerald-600 text-white font-bold gap-2">
                              Browse Certified Doctors
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {appointments.map((appt) => {
                            const statusStyles = {
                              pending: "bg-amber-50 text-amber-700 border-amber-200",
                              confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
                              completed: "bg-blue-50 text-blue-700 border-blue-200",
                              cancelled: "bg-rose-50 text-rose-700 border-rose-200"
                            };

                            return (
                              <div
                                key={appt._id}
                                className="p-6 rounded-3xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-lg transition-all space-y-4"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold">
                                      🩺
                                    </div>
                                    <div>
                                      <h4 className="font-black text-slate-900 text-base">
                                        {appt.doctorName || "Veterinary Doctor"}
                                      </h4>
                                      <p className="text-xs font-semibold text-slate-500">
                                        Pet: <span className="font-bold text-emerald-800">{appt.petName || "General Patient"}</span> · {appt.clinicName || "Animal Health Center"}
                                      </p>
                                    </div>
                                  </div>

                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border self-start sm:self-auto ${statusStyles[appt.status] || statusStyles.pending}`}>
                                    {appt.status}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                                  <div>
                                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Appointment Schedule</span>
                                    <span className="font-bold text-slate-800 text-sm">
                                      📅 {appt.preferredDate || "Scheduled"} at {appt.preferredTime || "Regular Hours"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Consultation Reason</span>
                                    <span className="font-bold text-slate-800 text-sm">
                                      {appt.reason || "Wellness Routine Checkup"}
                                    </span>
                                  </div>
                                </div>

                                {appt.doctorNotes && (
                                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-emerald-950">
                                    <span className="font-black text-emerald-800 uppercase tracking-wider block mb-1">
                                      Doctor's Clinical Notes:
                                    </span>
                                    <p className="text-slate-700 font-medium leading-relaxed">{appt.doctorNotes}</p>
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

                {/* ── TAB 3: PERSONAL DETAILS & SETTINGS ─────────────── */}
                <TabsContent value="settings" className="space-y-6 focus-visible:outline-none">
                  <Card className="border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl bg-white overflow-hidden">
                    <CardHeader className="px-6 sm:px-8 pt-8 pb-4 border-b border-slate-100">
                      <CardTitle className="text-xl sm:text-2xl font-black text-slate-900">
                        Profile & Account Details
                      </CardTitle>
                      <CardDescription className="text-slate-500 text-xs sm:text-sm mt-0.5">
                        Update your contact information, location, and account preferences.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 sm:p-8 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Display Name</Label>
                          <Input
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="rounded-xl border-slate-200 bg-slate-50/50 h-11 text-sm font-semibold"
                            placeholder="Your full name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address (Registered)</Label>
                          <Input
                            value={profile.email}
                            disabled
                            className="rounded-xl border-slate-200 bg-slate-100/70 h-11 text-sm text-slate-500 font-semibold cursor-not-allowed"
                          />
                          <p className="text-[11px] text-slate-400">Account login email cannot be changed.</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contact Phone Number</Label>
                          <Input
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="rounded-xl border-slate-200 bg-slate-50/50 h-11 text-sm font-semibold"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">City / Location</Label>
                          <Input
                            value={profile.location}
                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            className="rounded-xl border-slate-200 bg-slate-50/50 h-11 text-sm font-semibold"
                            placeholder="e.g. Austin, Texas"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Bio / Caregiver Notes</Label>
                        <textarea
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          className="w-full h-24 p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium resize-none"
                          placeholder="Tell veterinary doctors a little about your animal care experience or emergency preferences..."
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                        <Button
                          onClick={handleProfileSave}
                          disabled={isSaving}
                          className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 h-12 shadow-lg shadow-emerald-600/20"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving Changes...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" /> Save Profile Details
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── TAB 4: DOCTOR PRACTICE (if doctor) ────────────── */}
                {user?.role === "doctor" && (
                  <TabsContent value="professional" className="space-y-6 focus-visible:outline-none">
                    <Card className="border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl bg-white overflow-hidden">
                      <CardHeader className="px-6 sm:px-8 pt-8 pb-4 border-b border-slate-100">
                        <CardTitle className="text-xl sm:text-2xl font-black text-slate-900">
                          Veterinary Credentials & Practice
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-xs sm:text-sm mt-0.5">
                          Manage your clinic affiliation, clinical specialization, and years of practice.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 sm:p-8 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Specialization</Label>
                            <Input
                              value={profile.specialization}
                              onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                              className="rounded-xl border-slate-200 bg-slate-50/50 h-11 text-sm font-semibold"
                              placeholder="e.g. Small Animal Surgery, Equine Specialist"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Affiliated Clinic Name</Label>
                            <Input
                              value={profile.clinic}
                              onChange={(e) => setProfile({ ...profile, clinic: e.target.value })}
                              className="rounded-xl border-slate-200 bg-slate-50/50 h-11 text-sm font-semibold"
                              placeholder="e.g. City Veterinary Hospital"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={handleProfileSave}
                          disabled={isSaving}
                          className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 h-12 shadow-lg shadow-emerald-600/20"
                        >
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                          Update Practice Profile
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

              </Tabs>
            </div>

          </div>
        </div>
      </main>

      {/* ── Modal for Avatar Selection ──────────────────────────────── */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">Update Profile Avatar</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Select one of our curated avatars or paste a custom image URL.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 block">
              Curated Avatars
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_PRESETS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectAvatar(url)}
                  className={`p-1 rounded-2xl border-2 transition-all hover:scale-105 ${
                    profile.photo === url ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20" : "border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <img src={url} alt="preset avatar" className="w-full h-20 object-cover rounded-xl" />
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Or Paste Image URL
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs h-10"
                />
                <Button onClick={handleApplyCustomAvatar} className="rounded-xl bg-emerald-600 text-white font-bold text-xs px-4">
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default UserProfile;
