import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Stethoscope, Users, Calendar, Clipboard, LogOut,
    User as UserIcon, CheckCircle, XCircle, Activity,
    Pencil, Clock, PawPrint, Phone, MapPin, Award,
    ChevronRight, BadgeCheck, Bell, Save, AlertTriangle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/integrations/authApi";

// ── Small helpers ──────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = "text", placeholder, readOnly }) => (
    <div>
        {label && <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>}
        <input
            type={type} value={value || ""} onChange={onChange} placeholder={placeholder}
            readOnly={readOnly}
            className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border ${readOnly ? "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed" : "bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"}`}
        />
    </div>
);

const StatusBadge = ({ status }) => {
    const cfg = {
        pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending", dot: "🟡" },
        confirmed: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed", dot: "🔵" },
        completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed", dot: "🟢" },
        cancelled: { bg: "bg-red-100", text: "text-red-600", label: "Cancelled", dot: "🔴" },
    };
    const c = cfg[status] || cfg.pending;
    return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${c.bg} ${c.text}`}>{c.dot} {c.label}</span>;
};

// ── Appointment Management Modal ────────────────────────────────────────────
const AppointmentModal = ({ appt, onClose, onSave }) => {
    const [status, setStatus] = useState(appt.status);
    const [notes, setNotes] = useState(appt.doctorNotes || "");
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            await api.put(`/doctor/appointments/${appt._id}`, { status, doctorNotes: notes });
            onSave();
        } catch { alert("Failed to update appointment"); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-black text-slate-900 text-lg">Manage Appointment</h2>
                    <p className="text-sm text-slate-400 mt-1">🐾 {appt.petName} · Owner: {appt.userId?.username}</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 rounded-2xl p-4 text-sm space-y-2">
                        <p><span className="font-bold text-slate-600">Reason:</span> <span className="text-slate-700">{appt.reason}</span></p>
                        <p><span className="font-bold text-slate-600">Date:</span> <span className="text-slate-700">{appt.preferredDate}</span></p>
                        <p><span className="font-bold text-slate-600">Time:</span> <span className="text-slate-700">{appt.preferredTime}</span></p>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Update Status</label>
                        <div className="grid grid-cols-2 gap-2">
                            {["pending","confirmed","completed","cancelled"].map(s => (
                                <button key={s} onClick={() => setStatus(s)}
                                    className={`py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${status === s ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Clinical Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add treatment notes, medication, follow-up instructions..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400" />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={save} disabled={saving} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 transition-all">
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Doctor Dashboard ────────────────────────────────────────────────────────
const DoctorDashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile");
    const [editMode, setEditMode] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");
    const [manageAppt, setManageAppt] = useState(null);
    const [apptFilter, setApptFilter] = useState("all");

    const loadData = async () => {
        try {
            const [profRes, apptRes, usersRes] = await Promise.all([
                api.get("/doctor/profile"),
                api.get("/doctor/appointments"),
                api.get("/doctor/users"),
            ]);
            setProfile(profRes.data.profile);
            setAppointments(apptRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error("Failed to load doctor data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const saveProfile = async () => {
        try {
            await api.put("/doctor/profile", profile);
            setSaveMsg("Profile saved!");
            setEditMode(false);
            setTimeout(() => setSaveMsg(""), 3000);
        } catch { alert("Failed to save profile"); }
    };

    const setAvailability = async (status) => {
        try {
            const updated = { ...profile, availabilityStatus: status };
            setProfile(updated);
            await api.put("/doctor/profile", { availabilityStatus: status });
        } catch { alert("Failed to update availability"); }
    };

    const filteredAppts = apptFilter === "all" ? appointments : appointments.filter(a => a.status === apptFilter);

    const tabs = [
        { id: "profile", label: "My Profile", icon: <UserIcon className="h-4 w-4" /> },
        { id: "appointments", label: "Appointments", icon: <Calendar className="h-4 w-4" />, count: appointments.filter(a => a.status === "pending").length },
        { id: "users", label: "Patients", icon: <Users className="h-4 w-4" /> },
    ];

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
        </div>
    );

    const availColor = { Available: "bg-green-500", Busy: "bg-amber-500", Offline: "bg-slate-400" };

    return (
        <div className="min-h-screen bg-slate-50 font-inter">
            {/* Top Header */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <div className="container mx-auto px-4 flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                            <Stethoscope className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-slate-900">Vet Panel</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Doctor Workspace</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Live Availability Toggle */}
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                            <span className={`w-2.5 h-2.5 rounded-full ${availColor[profile?.availabilityStatus] || "bg-slate-400"}`} />
                            <span className="text-xs font-black text-slate-700">{profile?.availabilityStatus || "Offline"}</span>
                        </div>
                        <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Doctor Identity Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-[2rem] p-6 mb-8 shadow-2xl shadow-indigo-600/20 flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-black shrink-0">
                        {profile?.doctorName?.charAt(0) || user?.username?.charAt(0) || "D"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-2xl font-black truncate">{profile?.doctorName || user?.username}</h2>
                            {profile?.verified && <BadgeCheck className="h-5 w-5 text-indigo-300 flex-shrink-0" />}
                        </div>
                        <p className="text-indigo-200 text-sm font-bold">{profile?.qualification || "Veterinary Professional"} · {profile?.specialization || "General Practice"}</p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                            {profile?.location && <span className="flex items-center gap-1 text-xs text-indigo-200"><MapPin className="h-3 w-3" />{profile.location}</span>}
                            {profile?.contactNumber && <span className="flex items-center gap-1 text-xs text-indigo-200"><Phone className="h-3 w-3" />{profile.contactNumber}</span>}
                            {profile?.yearsOfExperience > 0 && <span className="flex items-center gap-1 text-xs text-indigo-200"><Award className="h-3 w-3" />{profile.yearsOfExperience} yrs exp</span>}
                        </div>
                    </div>
                    {/* Quick availability toggle */}
                    <div className="hidden sm:flex flex-col gap-1.5 shrink-0">
                        {["Available","Busy","Offline"].map(s => (
                            <button key={s} onClick={() => setAvailability(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${profile?.availabilityStatus === s ? "bg-white text-indigo-700" : "bg-white/10 text-white hover:bg-white/20"}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Total Appointments", value: appointments.length, icon: "📅" },
                        { label: "Pending", value: appointments.filter(a => a.status === "pending").length, icon: "⏳" },
                        { label: "Completed", value: appointments.filter(a => a.status === "completed").length, icon: "✅" },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
                            <div className="text-3xl mb-1">{s.icon}</div>
                            <div className="text-2xl font-black text-slate-900">{s.value}</div>
                            <div className="text-xs font-bold text-slate-400 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-8 p-1.5 bg-white border border-slate-100 rounded-2xl shadow-sm w-fit">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === t.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-800"}`}>
                            {t.icon} {t.label}
                            {t.count > 0 && <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1 ${activeTab === t.id ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"}`}>{t.count}</span>}
                        </button>
                    ))}
                </div>

                {/* ── PROFILE TAB ────────────────────────────────────────── */}
                {activeTab === "profile" && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-black text-slate-900">Professional Details</h3>
                            <div className="flex items-center gap-2">
                                {saveMsg && <span className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle className="h-3 w-3" />{saveMsg}</span>}
                                {editMode ? (
                                    <>
                                        <button onClick={saveProfile} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                                            <Save className="h-4 w-4" /> Save
                                        </button>
                                        <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold">Cancel</button>
                                    </>
                                ) : (
                                    <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-black hover:bg-slate-200 transition-all">
                                        <Pencil className="h-4 w-4" /> Edit
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Full Name" value={profile?.doctorName} onChange={e => setProfile({...profile, doctorName: e.target.value})} readOnly={!editMode} />
                                <Field label="Qualification" value={profile?.qualification} onChange={e => setProfile({...profile, qualification: e.target.value})} placeholder="e.g. BVSc & AH" readOnly={!editMode} />
                                <Field label="Specialization" value={profile?.specialization} onChange={e => setProfile({...profile, specialization: e.target.value})} readOnly={!editMode} />
                                <Field label="Clinic / Hospital Name" value={profile?.clinicName} onChange={e => setProfile({...profile, clinicName: e.target.value})} readOnly={!editMode} />
                                <Field label="Location" value={profile?.location} onChange={e => setProfile({...profile, location: e.target.value})} readOnly={!editMode} />
                                <Field label="Contact Number" value={profile?.contactNumber} onChange={e => setProfile({...profile, contactNumber: e.target.value})} readOnly={!editMode} />
                                <Field label="Years of Experience" type="number" value={profile?.yearsOfExperience} onChange={e => setProfile({...profile, yearsOfExperience: e.target.value})} readOnly={!editMode} />
                            </div>

                            {/* Availability section */}
                            <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Availability Status</p>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { s: "Available", color: "bg-green-500", hover: "hover:bg-green-500" },
                                        { s: "Busy", color: "bg-amber-500", hover: "hover:bg-amber-500" },
                                        { s: "Offline", color: "bg-slate-500", hover: "hover:bg-slate-500" },
                                    ].map(({ s, color, hover }) => (
                                        <button key={s} onClick={() => setAvailability(s)}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${profile?.availabilityStatus === s ? `${color} text-white shadow-md` : `bg-white border border-slate-200 text-slate-600 ${hover} hover:text-white hover:border-transparent`}`}>
                                            <span className={`w-2 h-2 rounded-full ${profile?.availabilityStatus === s ? "bg-white" : color}`} />
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── APPOINTMENTS TAB ─────────────────────────────────────── */}
                {activeTab === "appointments" && (
                    <div className="space-y-4">
                        {/* Filter Bar */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {["all","pending","confirmed","completed","cancelled"].map(f => (
                                <button key={f} onClick={() => setApptFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all ${apptFilter === f ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
                                    {f === "all" ? "All" : f} {f !== "all" && `(${appointments.filter(a => a.status === f).length})`}
                                </button>
                            ))}
                        </div>

                        {filteredAppts.length === 0 ? (
                            <div className="py-16 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                                <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-400 font-bold">No appointments found</p>
                            </div>
                        ) : filteredAppts.map(appt => (
                            <div key={appt._id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 text-2xl">
                                            🐾
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-black text-slate-900">{appt.petName}</h3>
                                                <StatusBadge status={appt.status} />
                                            </div>
                                            <p className="text-sm text-slate-500 mt-0.5">Owner: <span className="font-bold text-slate-700">{appt.userId?.username}</span> · {appt.userId?.email}</p>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">📋 {appt.reason}</p>
                                            <div className="flex items-center gap-4 mt-1.5">
                                                <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3"/>{appt.preferredDate} {appt.preferredTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setManageAppt(appt)}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-black hover:bg-indigo-100 transition-colors shrink-0">
                                        <Pencil className="h-3.5 w-3.5" /> Manage
                                    </button>
                                </div>
                                {appt.doctorNotes && (
                                    <div className="mt-3 px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-700 border-l-4 border-indigo-400">
                                        <span className="font-bold text-slate-500 text-xs uppercase tracking-wide">Notes: </span>{appt.doctorNotes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── USERS / PATIENTS TAB ────────────────────────────────── */}
                {activeTab === "users" && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-black text-slate-500 uppercase tracking-widest">{users.length} Registered Users</p>
                        </div>
                        {users.length === 0 ? (
                            <div className="py-16 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-400 font-bold">No users registered yet</p>
                            </div>
                        ) : users.map(u => (
                            <div key={u._id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-black text-primary shrink-0">
                                    {u.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-900 truncate">{u.username}</p>
                                    <p className="text-sm text-slate-400 truncate">{u.email}</p>
                                    {u.profile?.location && <p className="text-xs text-slate-300 mt-0.5 truncate">📍 {u.profile.location}</p>}
                                    {u.profile?.pets && u.profile.pets.length > 0 && (
                                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                            {u.profile.pets.map((pet, i) => (
                                                <span key={i} className="flex items-center gap-1 text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                                    <PawPrint className="h-2.5 w-2.5" />{typeof pet === "string" ? pet : pet.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className="text-[10px] font-black bg-green-100 text-green-600 px-2 py-1 rounded-full">User</span>
                                    <span className="text-xs text-slate-300">{appointments.filter(a => a.userId?._id === String(u._id)).length} appts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Appointment Modal */}
            {manageAppt && (
                <AppointmentModal
                    appt={manageAppt}
                    onClose={() => setManageAppt(null)}
                    onSave={() => { setManageAppt(null); loadData(); }}
                />
            )}
        </div>
    );
};

export default DoctorDashboard;
