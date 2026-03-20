import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus, Trash2, ChevronDown, ChevronUp, LogOut,
    Shield, Loader2, AlertTriangle, Pencil, CheckCircle2,
    XCircle, UserCheck, Stethoscope, FileText, Upload, BadgeCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
    getAllAnimals, createAnimal, deleteAnimal,
    addDisease, deleteDiseaseApi, getAnimalBySlug
} from "@/integrations/animalApi";
import { getAdminProfile } from "@/integrations/authApi";
import api from "@/integrations/authApi";

// ── Reusable Input ──────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = "text", placeholder, required }) => (
    <div>
        {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</label>}
        <input
            type={type} value={value} onChange={onChange} placeholder={placeholder}
            required={required}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
    </div>
);

// ── User Edit Modal ─────────────────────────────────────────────────────────
const UserEditModal = ({ user, onClose, onSave }) => {
    const [form, setForm] = useState({ username: user.username, email: user.email, name: user.profile?.name || "", location: user.profile?.location || "", newPassword: "" });
    const [docs, setDocs] = useState([]);
    const [docForm, setDocForm] = useState({ petName: "", docName: "", docType: "vaccination", notes: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get(`/admin/users/${user._id}/documents`).then(r => setDocs(r.data)).catch(() => {});
    }, [user._id]);

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/admin/users/${user._id}`, form);
            onSave();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save");
        } finally { setSaving(false); }
    };

    const addDoc = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post(`/admin/users/${user._id}/documents`, docForm);
            setDocs(prev => [...prev, data.document]);
            setDocForm({ petName: "", docName: "", docType: "vaccination", notes: "" });
        } catch (err) { alert("Failed to add document"); }
    };

    const removeDoc = async (docId) => {
        await api.delete(`/admin/users/${user._id}/documents/${docId}`);
        setDocs(prev => prev.filter(d => d._id !== String(docId)));
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-black text-slate-900">Edit User Profile</h2>
                            <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><XCircle className="h-5 w-5 text-slate-400" /></button>
                </div>

                <form onSubmit={save} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                        <Field label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        <Field label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                        <Field label="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                        <Field label="New Password (optional)" type="password" value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} placeholder="Leave empty to keep current" />
                    </div>
                    <button type="submit" disabled={saving} className="w-full py-3 rounded-2xl bg-primary text-white font-black hover:bg-primary/90 transition-all">
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>

                {/* Pet Documents Section */}
                <div className="px-6 pb-6">
                    <div className="border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            <h3 className="font-black text-slate-800">Pet Documents</h3>
                            <span className="text-xs bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full">{docs.length}</span>
                        </div>

                        {/* Add Doc Form */}
                        <form onSubmit={addDoc} className="bg-slate-50 p-4 rounded-2xl space-y-3 mb-4">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Add New Document</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Field placeholder="Pet Name (e.g. Tommy)" value={docForm.petName} onChange={e => setDocForm({...docForm, petName: e.target.value})} required />
                                <Field placeholder="Document Name" value={docForm.docName} onChange={e => setDocForm({...docForm, docName: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <select value={docForm.docType} onChange={e => setDocForm({...docForm, docType: e.target.value})}
                                    className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20">
                                    <option value="vaccination">Vaccination Record</option>
                                    <option value="prescription">Prescription</option>
                                    <option value="lab_report">Lab Report</option>
                                    <option value="deworming">Deworming</option>
                                    <option value="general">General</option>
                                </select>
                                <Field placeholder="Notes (optional)" value={docForm.notes} onChange={e => setDocForm({...docForm, notes: e.target.value})} />
                            </div>
                            <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors">
                                <Upload className="h-4 w-4" /> Add Document
                            </button>
                        </form>

                        {/* Documents List */}
                        <div className="space-y-2">
                            {docs.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl">No documents uploaded yet.</p>
                            ) : docs.map(doc => (
                                <div key={doc._id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{doc.docName}</p>
                                            <p className="text-xs text-slate-400">{doc.petName} · {doc.docType} · By {doc.uploadedBy}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeDoc(doc._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Doctor Edit Modal ───────────────────────────────────────────────────────
const DoctorEditModal = ({ userId, doctorName, onClose, onSave }) => {
    const [prof, setProf] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get("/admin/doctors").then(r => {
            const p = r.data.profiles.find(p => p.userId?._id === String(userId));
            if (p) setProf({ ...p });
        });
    }, [userId]);

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/admin/doctors/${userId}`, prof);
            onSave();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save");
        } finally { setSaving(false); }
    };

    if (!prof) return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="font-black text-slate-900">Edit Doctor Profile</h2>
                            <p className="text-xs text-slate-400">{doctorName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><XCircle className="h-5 w-5 text-slate-400" /></button>
                </div>

                <form onSubmit={save} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Doctor Name" value={prof.doctorName || ""} onChange={e => setProf({...prof, doctorName: e.target.value})} />
                        <Field label="Clinic Name" value={prof.clinicName || ""} onChange={e => setProf({...prof, clinicName: e.target.value})} />
                        <Field label="Qualification" value={prof.qualification || ""} onChange={e => setProf({...prof, qualification: e.target.value})} placeholder="e.g. BVSc & AH" />
                        <Field label="Specialization" value={prof.specialization || ""} onChange={e => setProf({...prof, specialization: e.target.value})} />
                        <Field label="Location" value={prof.location || ""} onChange={e => setProf({...prof, location: e.target.value})} />
                        <Field label="Contact Number" value={prof.contactNumber || ""} onChange={e => setProf({...prof, contactNumber: e.target.value})} />
                        <Field label="Years of Experience" type="number" value={prof.yearsOfExperience || 0} onChange={e => setProf({...prof, yearsOfExperience: e.target.value})} />
                        <Field label="Rating (0-5)" type="number" value={prof.rating || 0} onChange={e => setProf({...prof, rating: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                        <input type="checkbox" id="verified" checked={!!prof.verified} onChange={e => setProf({...prof, verified: e.target.checked})} className="w-4 h-4 accent-primary" />
                        <label htmlFor="verified" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-primary" /> Mark as Verified Expert
                        </label>
                    </div>
                    <button type="submit" disabled={saving} className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all">
                        {saving ? "Saving..." : "Update Doctor Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ── Main Admin Dashboard ────────────────────────────────────────────────────
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedAnimal, setExpandedAnimal] = useState(null);
    const [animalDiseases, setAnimalDiseases] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeTab, setActiveTab] = useState("animals");
    const [allUsers, setAllUsers] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [editUserModal, setEditUserModal] = useState(null);
    const [editDoctorModal, setEditDoctorModal] = useState(null);
    const [showAddDoctor, setShowAddDoctor] = useState(false);
    const [doctorForm, setDoctorForm] = useState({ username: "", email: "", password: "" });
    const [showAddAnimal, setShowAddAnimal] = useState(false);
    const [animalForm, setAnimalForm] = useState({ slug: "", name: "", nameHi: "", image: "", description: "" });
    const [showAddDisease, setShowAddDisease] = useState(null);
    const [diseaseForm, setDiseaseForm] = useState({ name: "", nameHi: "", symptoms: "", causes: "", treatment: "", prevention: "" });

    useEffect(() => {
        getAdminProfile().then(d => setAdmin(d.user)).catch(() => navigate("/auth", { replace: true }));
    }, [navigate]);

    useEffect(() => { loadAnimals(); }, []);

    const loadAnimals = async () => {
        try {
            setLoading(true);
            const data = await getAllAnimals();
            setAnimals(data.animals);
        } catch { setError("Failed to load animals"); }
        finally { setLoading(false); }
    };

    const loadUsers = async () => {
        try { const { data } = await api.get("/admin/users"); setAllUsers(data); }
        catch { setError("Failed to load users"); }
    };

    const loadDoctors = async () => {
        try { const { data } = await api.get("/admin/doctors"); setAllDoctors(data.doctors); }
        catch { setError("Failed to load doctors"); }
    };

    useEffect(() => {
        if (activeTab === "users") loadUsers();
        if (activeTab === "doctors") loadDoctors();
    }, [activeTab]);

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        try {
            await api.post("/admin/doctors", doctorForm);
            setDoctorForm({ username: "", email: "", password: "" });
            setShowAddDoctor(false);
            flash("Doctor account created!");
            loadDoctors();
        } catch (err) { setError(err.response?.data?.message || "Failed to add doctor"); }
    };

    const handleDeleteDoctor = async (id) => {
        if (!window.confirm("Permanently delete this doctor account?")) return;
        try { await api.delete(`/admin/doctors/${id}`); flash("Doctor removed."); loadDoctors(); }
        catch { setError("Failed to delete doctor"); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Permanently delete this user account and all their data?")) return;
        try { await api.delete(`/admin/users/${id}`); flash("User removed."); loadUsers(); }
        catch { setError("Failed to delete user"); }
    };

    const { logout } = useAuth();
    const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); };

    const toggleAnimal = async (slug) => {
        if (expandedAnimal === slug) { setExpandedAnimal(null); setAnimalDiseases([]); return; }
        try {
            const data = await getAnimalBySlug(slug);
            setAnimalDiseases(data.animal.diseases || []);
            setExpandedAnimal(slug);
        } catch { setError("Failed to load animal details"); }
    };

    const handleAddAnimal = async (e) => {
        e.preventDefault();
        try { await createAnimal(animalForm); setAnimalForm({ slug: "", name: "", nameHi: "", image: "", description: "" }); setShowAddAnimal(false); flash("Animal added!"); loadAnimals(); }
        catch (err) { setError(err.response?.data?.message || "Failed to add animal"); }
    };

    const handleDeleteAnimal = async (slug) => {
        if (!window.confirm(`Delete "${slug}"?`)) return;
        try { await deleteAnimal(slug); flash("Animal deleted!"); if (expandedAnimal === slug) setExpandedAnimal(null); loadAnimals(); }
        catch (err) { setError(err.response?.data?.message || "Failed"); }
    };

    const handleAddDisease = async (e, slug) => {
        e.preventDefault();
        try {
            const payload = { ...diseaseForm, symptoms: diseaseForm.symptoms.split(",").map(s => s.trim()).filter(Boolean), prevention: diseaseForm.prevention.split(",").map(s => s.trim()).filter(Boolean) };
            await addDisease(slug, payload);
            setDiseaseForm({ name: "", nameHi: "", symptoms: "", causes: "", treatment: "", prevention: "" });
            setShowAddDisease(null);
            flash("Disease added!");
            const data = await getAnimalBySlug(slug); setAnimalDiseases(data.animal.diseases || []);
        } catch (err) { setError(err.response?.data?.message || "Failed"); }
    };

    const handleDeleteDisease = async (slug, diseaseId) => {
        if (!window.confirm("Delete disease?")) return;
        try { await deleteDiseaseApi(slug, diseaseId); flash("Disease deleted!"); const data = await getAnimalBySlug(slug); setAnimalDiseases(data.animal.diseases || []); }
        catch { setError("Failed to delete disease"); }
    };

    if (!admin) return null;

    const tabs = [
        { id: "animals", label: "Animals", icon: "🐾" },
        { id: "doctors", label: "Doctors", icon: "🩺" },
        { id: "users", label: "Users", icon: "👤" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-inter">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <div className="container mx-auto px-4 flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <h1 className="text-lg font-black text-slate-900">Admin Console</h1>
                        <span className="hidden sm:flex text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-bold">{admin.email}</span>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="h-4 w-4" /> Logout
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Notifications */}
                {error && (
                    <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> {error}
                        <button onClick={() => setError("")} className="ml-auto text-xs hover:underline">Dismiss</button>
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-4 rounded-2xl bg-green-50 border border-green-100 text-green-700 text-sm font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> {success}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-8 p-1.5 bg-white border border-slate-100 rounded-2xl shadow-sm w-fit">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === t.id ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-800"}`}>
                            <span>{t.icon}</span> {t.label}
                        </button>
                    ))}
                </div>

                {/* ── ANIMALS ──────────────────────────────────────────────── */}
                {activeTab === "animals" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900">Animals <span className="text-slate-400 text-lg">({animals.length})</span></h2>
                            <button onClick={() => setShowAddAnimal(!showAddAnimal)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                <Plus className="h-4 w-4" /> Add Animal
                            </button>
                        </div>

                        {showAddAnimal && (
                            <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-md space-y-3">
                                <h3 className="font-black text-slate-800 text-sm">➕ New Animal</h3>
                                <form onSubmit={handleAddAnimal} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field placeholder="Slug (e.g. cow)" value={animalForm.slug} onChange={e => setAnimalForm({...animalForm, slug: e.target.value})} required />
                                        <Field placeholder="Name (e.g. Cow)" value={animalForm.name} onChange={e => setAnimalForm({...animalForm, name: e.target.value})} required />
                                        <Field placeholder="Hindi Name (e.g. गाय)" value={animalForm.nameHi} onChange={e => setAnimalForm({...animalForm, nameHi: e.target.value})} />
                                        <Field placeholder="Image URL" value={animalForm.image} onChange={e => setAnimalForm({...animalForm, image: e.target.value})} />
                                    </div>
                                    <textarea placeholder="Description..." value={animalForm.description} onChange={e => setAnimalForm({...animalForm, description: e.target.value})} rows={2}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                                    <div className="flex gap-2">
                                        <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90">Save</button>
                                        <button type="button" onClick={() => setShowAddAnimal(false)} className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
                            <div className="space-y-3">
                                {animals.map(animal => (
                                    <div key={animal._id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4 px-5 py-4">
                                            <img src={animal.image} alt={animal.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-slate-900">{animal.name}</h3>
                                                <p className="text-xs text-slate-400 font-bold">/{animal.slug} · {animal.nameHi}</p>
                                            </div>
                                            <button onClick={() => toggleAnimal(animal.slug)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                                                {expandedAnimal === animal.slug ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
                                            </button>
                                            <button onClick={() => handleDeleteAnimal(animal.slug)} className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {expandedAnimal === animal.slug && (
                                            <div className="border-t border-slate-100 px-5 py-4 bg-slate-50 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-black text-slate-700">Diseases ({animalDiseases.length})</span>
                                                    <button onClick={() => setShowAddDisease(showAddDisease === animal.slug ? null : animal.slug)} className="text-xs text-primary font-black flex items-center gap-1 hover:underline">
                                                        <Plus className="h-3 w-3" /> Add Disease
                                                    </button>
                                                </div>
                                                {showAddDisease === animal.slug && (
                                                    <form onSubmit={e => handleAddDisease(e, animal.slug)} className="p-4 bg-white border border-slate-100 rounded-xl space-y-2 shadow-inner">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Field placeholder="Disease Name" value={diseaseForm.name} onChange={e => setDiseaseForm({...diseaseForm, name: e.target.value})} required />
                                                            <Field placeholder="Hindi Name" value={diseaseForm.nameHi} onChange={e => setDiseaseForm({...diseaseForm, nameHi: e.target.value})} />
                                                        </div>
                                                        <Field placeholder="Symptoms (comma-separated)" value={diseaseForm.symptoms} onChange={e => setDiseaseForm({...diseaseForm, symptoms: e.target.value})} />
                                                        <textarea placeholder="Causes" rows={2} value={diseaseForm.causes} onChange={e => setDiseaseForm({...diseaseForm, causes: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm resize-none outline-none" />
                                                        <textarea placeholder="Treatment" rows={2} value={diseaseForm.treatment} onChange={e => setDiseaseForm({...diseaseForm, treatment: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm resize-none outline-none" />
                                                        <Field placeholder="Prevention (comma-separated)" value={diseaseForm.prevention} onChange={e => setDiseaseForm({...diseaseForm, prevention: e.target.value})} />
                                                        <div className="flex gap-2">
                                                            <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold">Add</button>
                                                            <button type="button" onClick={() => setShowAddDisease(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">Cancel</button>
                                                        </div>
                                                    </form>
                                                )}
                                                {animalDiseases.length === 0 ? <p className="text-xs text-slate-400 py-2">No diseases recorded.</p> : animalDiseases.map(d => (
                                                    <div key={d._id} className="flex items-start justify-between gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{d.name} {d.nameHi && <span className="text-slate-400">· {d.nameHi}</span>}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{d.symptoms?.join(", ")}</p>
                                                        </div>
                                                        <button onClick={() => handleDeleteDisease(animal.slug, d._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── DOCTORS ──────────────────────────────────────────────── */}
                {activeTab === "doctors" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900">Doctors <span className="text-slate-400 text-lg">({allDoctors.length})</span></h2>
                            <button onClick={() => setShowAddDoctor(!showAddDoctor)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                                <Plus className="h-4 w-4" /> Add Doctor Account
                            </button>
                        </div>

                        {showAddDoctor && (
                            <form onSubmit={handleAddDoctor} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-md space-y-3">
                                <h3 className="font-black text-slate-800 text-sm">🩺 New Doctor Account</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <Field placeholder="Username" value={doctorForm.username} onChange={e => setDoctorForm({...doctorForm, username: e.target.value})} required />
                                    <Field placeholder="Email" type="email" value={doctorForm.email} onChange={e => setDoctorForm({...doctorForm, email: e.target.value})} required />
                                    <Field placeholder="Password" type="password" value={doctorForm.password} onChange={e => setDoctorForm({...doctorForm, password: e.target.value})} required />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">Create Account</button>
                                    <button type="button" onClick={() => setShowAddDoctor(false)} className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold">Cancel</button>
                                </div>
                            </form>
                        )}

                        <div className="grid gap-3">
                            {allDoctors.length === 0 ? (
                                <p className="text-center py-12 text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl font-bold">No doctors registered.</p>
                            ) : allDoctors.map(doc => (
                                <div key={doc._id} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-lg font-black text-indigo-600">
                                            {doc.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900">{doc.username}</p>
                                            <p className="text-sm text-slate-400">{doc.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setEditDoctorModal({ userId: doc._id, doctorName: doc.username })}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-bold hover:bg-indigo-100 transition-colors">
                                            <Pencil className="h-4 w-4" /> Edit Profile
                                        </button>
                                        <button onClick={() => handleDeleteDoctor(doc._id)} className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── USERS ──────────────────────────────────────────────── */}
                {activeTab === "users" && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black text-slate-900">Users <span className="text-slate-400 text-lg">({allUsers.length})</span></h2>

                        <div className="grid gap-3">
                            {allUsers.length === 0 ? (
                                <p className="text-center py-12 text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl font-bold">No users found.</p>
                            ) : allUsers.map(u => (
                                <div key={u._id} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-lg font-black text-primary">
                                            {u.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900">{u.username}</p>
                                            <p className="text-sm text-slate-400">{u.email}</p>
                                            {u.profile?.location && <p className="text-xs text-slate-300 mt-0.5">📍 {u.profile.location}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setEditUserModal(u)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors">
                                            <Pencil className="h-4 w-4" /> Manage
                                        </button>
                                        <button onClick={() => handleDeleteUser(u._id)} className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            {editUserModal && <UserEditModal user={editUserModal} onClose={() => setEditUserModal(null)} onSave={() => { setEditUserModal(null); flash("User updated!"); loadUsers(); }} />}
            {editDoctorModal && <DoctorEditModal userId={editDoctorModal.userId} doctorName={editDoctorModal.doctorName} onClose={() => setEditDoctorModal(null)} onSave={() => { setEditDoctorModal(null); flash("Doctor profile updated!"); loadDoctors(); }} />}
        </div>
    );
};

export default AdminDashboard;
