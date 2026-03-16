import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    Stethoscope, Users, Calendar, Clipboard, 
    LogOut, User as UserIcon, CheckCircle, XCircle, Activity
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
    getDoctorProfile, updateDoctorProfile, 
    getDoctorPatients, addTreatmentNote 
} from "@/integrations/authApi";

const DoctorDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile");
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [treatmentNote, setTreatmentNote] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profData, patData] = await Promise.all([
                    getDoctorProfile(),
                    getDoctorPatients()
                ]);
                setProfile(profData);
                setPatients(patData);
            } catch (err) {
                console.error("Failed to load doctor data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const updated = await updateDoctorProfile(profile);
            setProfile(updated.profile);
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Failed to update profile");
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        try {
            await addTreatmentNote({
                userId: selectedPatient.userId._id,
                petName: selectedPatient.petName,
                treatmentNotes: treatmentNote
            });
            alert("Note added!");
            setShowNoteModal(false);
            setTreatmentNote("");
            // Reload patients
            const patData = await getDoctorPatients();
            setPatients(patData);
        } catch (err) {
            alert("Failed to add note");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:block">
                <div className="flex items-center gap-2 mb-10 text-primary">
                    <Stethoscope className="h-6 w-6" />
                    <span className="font-display font-bold text-lg">Vet Panel</span>
                </div>
                
                <nav className="space-y-2">
                    <button 
                        onClick={() => setActiveTab("profile")}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "profile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    >
                        <UserIcon className="h-4 w-4" /> My Profile
                    </button>
                    <button 
                        onClick={() => setActiveTab("patients")}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "patients" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    >
                        <Users className="h-4 w-4" /> Patients
                    </button>
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <button 
                        onClick={() => { logout(); navigate("/login-doctor"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 p-8">
                <h1 className="text-2xl font-bold mb-8">
                    {activeTab === "profile" ? "Doctor Profile" : "Patient Records"}
                </h1>

                {activeTab === "profile" && (
                    <div className="bg-card border border-border rounded-xl p-8 max-w-2xl shadow-sm">
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Name</label>
                                    <input value={profile.doctorName || ""} onChange={(e)=>setProfile({...profile, doctorName: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Specialization</label>
                                    <input value={profile.specialization || ""} onChange={(e)=>setProfile({...profile, specialization: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Clinic</label>
                                    <input value={profile.clinicName || ""} onChange={(e)=>setProfile({...profile, clinicName: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Qualification</label>
                                    <input value={profile.qualification || ""} onChange={(e)=>setProfile({...profile, qualification: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Contact Number</label>
                                    <input value={profile.contactNumber || ""} onChange={(e)=>setProfile({...profile, contactNumber: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Location</label>
                                    <input value={profile.location || ""} onChange={(e)=>setProfile({...profile, location: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Years Exp</label>
                                    <input type="number" value={profile.yearsOfExperience || 0} onChange={(e)=>setProfile({...profile, yearsOfExperience: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-input bg-background" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Availability</label>
                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                    <button type="button" onClick={()=>setProfile({...profile, availabilityStatus: "Available"})} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${profile.availabilityStatus === "Available" ? "bg-green-100 text-green-700 border border-green-200 shadow-sm" : "bg-muted text-muted-foreground border border-transparent"}`}>
                                        <CheckCircle className="h-4 w-4" /> Available
                                    </button>
                                    <button type="button" onClick={()=>setProfile({...profile, availabilityStatus: "Busy"})} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${profile.availabilityStatus === "Busy" ? "bg-amber-100 text-amber-700 border border-amber-200 shadow-sm" : "bg-muted text-muted-foreground border border-transparent"}`}>
                                        <Activity className="h-4 w-4" /> Busy
                                    </button>
                                    <button type="button" onClick={()=>setProfile({...profile, availabilityStatus: "Offline"})} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${profile.availabilityStatus === "Offline" ? "bg-slate-100 text-slate-700 border border-slate-200 shadow-sm" : "bg-muted text-muted-foreground border border-transparent"}`}>
                                        <XCircle className="h-4 w-4" /> Offline
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === "patients" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {patients.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-dashed rounded-xl">
                                No patients assigned yet.
                            </div>
                        ) : (
                            patients.map((record) => (
                                <div key={record._id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{record.petName}</h3>
                                            <p className="text-sm text-muted-foreground">Owner: {record.userId?.username}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                            {new Date(record.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg text-sm text-foreground mb-4 italic">
                                        "{record.treatmentNotes}"
                                    </div>
                                    <button 
                                        onClick={() => { setSelectedPatient(record); setShowNoteModal(true); }}
                                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                    >
                                        <Clipboard className="h-3 w-3" /> Add New Note
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* Note Modal */}
            {showNoteModal && (
                <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Treatment Note for {selectedPatient?.petName}</h2>
                        <form onSubmit={handleAddNote}>
                            <textarea 
                                value={treatmentNote}
                                onChange={(e)=>setTreatmentNote(e.target.value)}
                                placeholder="Describe symptoms, treatment, and medication..."
                                className="w-full h-32 p-4 rounded-lg border border-input bg-background mb-4 resize-none"
                                required
                            />
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
                                    Save Note
                                </button>
                                <button type="button" onClick={()=>setShowNoteModal(false)} className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
