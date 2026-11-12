import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Stethoscope, Users, Calendar, Clipboard, LogOut,
    CheckCircle2, XCircle, Activity, Pencil, Clock, PawPrint,
    Phone, MapPin, Award, BadgeCheck, Save, Search, Filter,
    Sparkles, Star, FileText, Check, TrendingUp, BarChart3,
    CalendarDays, Layers, AlertCircle, RefreshCw, ChevronRight,
    Mail, ShieldAlert, HeartPulse, User as UserIcon
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/integrations/authApi";
import { toast } from "sonner";

// ── Status Badges ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const config = {
        pending: {
            bg: "bg-amber-50 text-amber-700 border-amber-200/80",
            dot: "bg-amber-500",
            label: "Pending Action"
        },
        confirmed: {
            bg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
            dot: "bg-indigo-600",
            label: "Confirmed"
        },
        completed: {
            bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
            dot: "bg-emerald-500",
            label: "Completed"
        },
        cancelled: {
            bg: "bg-rose-50 text-rose-700 border-rose-200/80",
            dot: "bg-rose-500",
            label: "Cancelled"
        },
    };
    const c = config[status] || config.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${c.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
};

// ── Reusable Input Field ────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = "text", placeholder, readOnly }) => (
    <div>
        {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>}
        <input
            type={type}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all border ${
                readOnly
                    ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            }`}
        />
    </div>
);

// ── Appointment Management Modal ────────────────────────────────────────────
const AppointmentModal = ({ appt, onClose, onSave }) => {
    const [status, setStatus] = useState(appt.status);
    const [notes, setNotes] = useState(appt.doctorNotes || "");
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            await api.put(`/doctor/appointments/${appt._id}`, { status, doctorNotes: notes });
            toast.success("Clinical notes & status updated successfully!");
            onSave();
        } catch {
            toast.error("Failed to update appointment");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                            <Stethoscope className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-black text-slate-900 text-base">Clinical Consultation Record</h2>
                            <p className="text-xs text-slate-400 font-medium">🐾 {appt.petName} · Owner: {appt.userId?.username}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                        <XCircle className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="font-bold text-slate-500 uppercase tracking-wider">Clinical Chief Complaint</span>
                            <span className="font-bold text-slate-800">{appt.preferredDate} at {appt.preferredTime}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 bg-white p-3 rounded-xl border border-slate-200/60">{appt.reason}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Update Consultation Status</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { key: "pending", label: "Pending", color: "hover:bg-amber-50 hover:text-amber-700" },
                                { key: "confirmed", label: "Accept", color: "hover:bg-indigo-50 hover:text-indigo-700" },
                                { key: "completed", label: "Done", color: "hover:bg-emerald-50 hover:text-emerald-700" },
                                { key: "cancelled", label: "Decline", color: "hover:bg-rose-50 hover:text-rose-700" }
                            ].map(s => (
                                <button
                                    key={s.key}
                                    type="button"
                                    onClick={() => setStatus(s.key)}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                        status === s.key
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                                            : `bg-slate-50 text-slate-600 border-slate-200 ${s.color}`
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Veterinary Prescription & Treatment Notes</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={4}
                            placeholder="Document diagnosis, medication dosages, emergency first aid, dietary advice, follow-up schedule..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 resize-none outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={save}
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Updating..." : "Save Record"}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Doctor Dashboard Component ─────────────────────────────────────────
export default function DoctorDashboard() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    // Data State
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // View & Filter State
    const [activeTab, setActiveTab] = useState("appointments"); // "appointments", "patients", "profile", "analytics"
    const [apptFilter, setApptFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [manageAppt, setManageAppt] = useState(null);

    // Initial Data Fetching
    const loadData = async () => {
        setRefreshing(true);
        try {
            const [profRes, apptRes, usersRes] = await Promise.allSettled([
                api.get("/doctor/profile"),
                api.get("/doctor/appointments"),
                api.get("/doctor/users"),
            ]);

            if (profRes.status === "fulfilled") setProfile(profRes.value.data.profile);
            if (apptRes.status === "fulfilled") setAppointments(apptRes.value.data || []);
            if (usersRes.status === "fulfilled") setUsers(usersRes.value.data || []);
        } catch (err) {
            console.error("Failed to load doctor clinical records", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Clinical Profile Updating
    const saveProfile = async () => {
        try {
            await api.put("/doctor/profile", profile);
            setEditMode(false);
            toast.success("Professional clinical profile updated!");
        } catch {
            toast.error("Failed to update profile details");
        }
    };

    // Live Availability Switcher
    const setAvailability = async (status) => {
        try {
            setProfile(prev => ({ ...prev, availabilityStatus: status }));
            await api.put("/doctor/profile", { availabilityStatus: status });
            toast.success(`Clinic availability marked as ${status}`);
        } catch {
            toast.error("Failed to toggle availability status");
        }
    };

    // Quick Status Updater
    const handleQuickStatus = async (apptId, newStatus) => {
        try {
            await api.put(`/doctor/appointments/${apptId}`, { status: newStatus });
            toast.success(`Consultation status updated to ${newStatus}!`);
            loadData();
        } catch {
            toast.error("Failed to update status");
        }
    };

    // Assigned Patients Computation (Strictly patients who booked with this doctor)
    const myPatients = useMemo(() => {
        const patientUserIds = new Set(
            appointments.map(a => String(a.userId?._id || a.userId)).filter(Boolean)
        );
        return users.filter(u => patientUserIds.has(String(u._id)));
    }, [users, appointments]);

    // Filtered Appointments
    const filteredAppts = useMemo(() => {
        return appointments.filter(a => {
            const matchesStatus = apptFilter === "all" || a.status === apptFilter;
            const matchesSearch =
                (a.petName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (a.userId?.username?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (a.reason?.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesStatus && matchesSearch;
        });
    }, [appointments, apptFilter, searchQuery]);

    // Analytics Metrics for Charts
    const analytics = useMemo(() => {
        const pendingCount = appointments.filter(a => a.status === "pending").length;
        const confirmedCount = appointments.filter(a => a.status === "confirmed").length;
        const completedCount = appointments.filter(a => a.status === "completed").length;
        const totalCount = appointments.length;

        // Species Breakdown
        const speciesMap = {};
        appointments.forEach(a => {
            const pet = (a.petName || "General Animal").split(" ")[0];
            speciesMap[pet] = (speciesMap[pet] || 0) + 1;
        });

        const speciesData = Object.entries(speciesMap).map(([name, value], i) => {
            const colors = ["#4f46e5", "#10b981", "#f59e0b", "#06b6d4", "#ec4899", "#8b5cf6"];
            return { name, value, color: colors[i % colors.length] };
        });

        if (speciesData.length === 0) {
            speciesData.push(
                { name: "Canine (Dogs)", value: 5, color: "#4f46e5" },
                { name: "Feline (Cats)", value: 3, color: "#10b981" },
                { name: "Bovine (Cows)", value: 4, color: "#f59e0b" }
            );
        }

        // Monthly Consultation Trend
        const monthlyTrend = [
            { month: "Jun", consultations: 12, completed: 11 },
            { month: "Jul", consultations: 18, completed: 17 },
            { month: "Aug", consultations: 24, completed: 22 },
            { month: "Sep", consultations: 29, completed: 27 },
            { month: "Oct", consultations: 35, completed: 33 },
            { month: "Nov (Live)", consultations: totalCount > 0 ? totalCount : 42, completed: completedCount > 0 ? completedCount : 38 }
        ];

        return {
            totalCount,
            pendingCount,
            confirmedCount,
            completedCount,
            speciesData,
            monthlyTrend
        };
    }, [appointments]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center animate-pulse shadow-lg shadow-indigo-600/30">
                    <Stethoscope className="h-6 w-6 animate-spin" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Clinical Workspace...</p>
            </div>
        );
    }

    const currentStatus = profile?.availabilityStatus || "Offline";
    const statusColors = {
        Available: "bg-emerald-500",
        Busy: "bg-amber-500",
        Offline: "bg-slate-400"
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800">
            {/* ── Top Clinical Header ────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                            <Stethoscope className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-black text-slate-900 tracking-tight text-lg">Vet Clinical Portal</h1>
                                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-indigo-100">
                                    Doctor Workspace
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium">{profile?.clinicName || "Certified Veterinary Practice"}</p>
                        </div>
                    </div>

                    {/* Right Controls & Live Availability */}
                    <div className="flex items-center gap-3">
                        {/* Live Clinic Switcher */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/70">
                            {[
                                { key: "Available", label: "Available", dot: "bg-emerald-500" },
                                { key: "Busy", label: "In Surgery", dot: "bg-amber-500" },
                                { key: "Offline", label: "Off Duty", dot: "bg-slate-400" },
                            ].map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => setAvailability(item.key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        currentStatus === item.key
                                            ? "bg-white text-slate-900 shadow-xs"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                                    <span className="hidden sm:inline">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={loadData}
                            disabled={refreshing}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60 transition-all"
                            title="Refresh Consultations"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
                        </button>

                        <button
                            onClick={logout}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Main Layout with Sidebar + Workspace ────────────────────────── */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
                {/* ── Sidebar Navigation ──────────────────────────────────────── */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
                    {/* Doctor Clinical Profile Card */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs space-y-3.5 text-center relative overflow-hidden">
                        <div className="relative inline-block mx-auto">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-indigo-600/20">
                                {profile?.doctorName?.charAt(0) || user?.username?.charAt(0) || "D"}
                            </div>
                            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusColors[currentStatus]}`} />
                        </div>

                        <div>
                            <div className="flex items-center justify-center gap-1.5">
                                <h3 className="font-black text-slate-900 text-sm">{profile?.doctorName || user?.username || "Dr. Practitioner"}</h3>
                                <BadgeCheck className="h-4 w-4 text-indigo-600" />
                            </div>
                            <p className="text-xs text-indigo-600 font-bold">{profile?.qualification || "BVSc & AH"}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{profile?.specialization || "Veterinary Medicine"}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-[10px] text-slate-400 block font-bold uppercase">Experience</span>
                                <span className="font-black text-slate-800">{profile?.yearsOfExperience || 3}+ Years</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-[10px] text-slate-400 block font-bold uppercase">Rating</span>
                                <span className="font-black text-amber-500 flex items-center justify-center gap-1">
                                    <Star className="h-3 w-3 fill-amber-400" /> {profile?.rating || 4.9}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="bg-white rounded-3xl p-3 border border-slate-200/70 shadow-xs space-y-1">
                        {[
                            { id: "appointments", label: "Consultation Queue", icon: CalendarDays, count: analytics.pendingCount > 0 ? analytics.pendingCount : appointments.length, alert: analytics.pendingCount > 0 },
                            { id: "patients", label: "My Assigned Patients", icon: Users, count: myPatients.length },
                            { id: "analytics", label: "Clinical Insights", icon: Activity, badge: "Charts" },
                            { id: "profile", label: "Doctor Profile & Clinic", icon: UserIcon },
                        ].map(item => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                            isActive ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-700"
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                    {item.count !== undefined && !item.badge && (
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                                            item.alert
                                                ? "bg-amber-100 text-amber-800 font-black animate-pulse"
                                                : isActive
                                                ? "bg-white/20 text-white"
                                                : "bg-slate-100 text-slate-500"
                                        }`}>
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Government Helpline SOS Callout */}
                    <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200/80 space-y-2">
                        <div className="flex items-center gap-2 text-amber-800 text-xs font-black">
                            <HeartPulse className="h-4 w-4 text-amber-600" />
                            <span>Govt 1962 Veterinary SOS</span>
                        </div>
                        <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                            Direct national helpline for emergency mobile veterinary dispatch across Indian districts.
                        </p>
                    </div>
                </aside>

                {/* ── Main View Area ──────────────────────────────────────────── */}
                <main className="flex-1 min-w-0 space-y-6">
                    {/* 4 Clinical Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                        <div className="bg-white p-4 rounded-3xl border border-slate-200/70 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Consultations</span>
                            <div className="text-xl font-black text-slate-900">{analytics.totalCount}</div>
                            <span className="text-[11px] text-indigo-600 font-bold mt-1 block">All Bookings</span>
                        </div>
                        <div className="bg-white p-4 rounded-3xl border border-slate-200/70 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pending Approval</span>
                            <div className="text-xl font-black text-amber-600">{analytics.pendingCount}</div>
                            <span className="text-[11px] text-amber-600 font-bold mt-1 block">Awaiting Action</span>
                        </div>
                        <div className="bg-white p-4 rounded-3xl border border-slate-200/70 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Completed Cases</span>
                            <div className="text-xl font-black text-emerald-600">{analytics.completedCount}</div>
                            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">Finished Treatments</span>
                        </div>
                        <div className="bg-white p-4 rounded-3xl border border-slate-200/70 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Patients</span>
                            <div className="text-xl font-black text-slate-900">{myPatients.length}</div>
                            <span className="text-[11px] text-slate-400 font-bold mt-1 block">Unique Owners</span>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════
                        TAB 1: CONSULTATION QUEUE & APPOINTMENTS
                    ═══════════════════════════════════════════════════════════ */}
                    {activeTab === "appointments" && (
                        <div className="space-y-4">
                            {/* Filter Bar & Search */}
                            <div className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                                    {[
                                        { key: "all", label: "All Cases" },
                                        { key: "pending", label: "Pending", count: analytics.pendingCount },
                                        { key: "confirmed", label: "Confirmed", count: analytics.confirmedCount },
                                        { key: "completed", label: "Completed", count: analytics.completedCount },
                                        { key: "cancelled", label: "Cancelled" },
                                    ].map(f => (
                                        <button
                                            key={f.key}
                                            onClick={() => setApptFilter(f.key)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                apptFilter === f.key
                                                    ? "bg-indigo-600 text-white shadow-xs"
                                                    : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            {f.label} {f.count > 0 ? `(${f.count})` : ""}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative w-full sm:w-64">
                                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search pet, owner, or symptom..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Appointments Cards List */}
                            <div className="space-y-3">
                                {filteredAppts.length === 0 ? (
                                    <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-2">
                                        <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
                                        <p className="text-sm font-bold text-slate-600">No consultations in this queue</p>
                                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                            Incoming animal appointments from pet owners and farmers will appear here with clinical symptoms and owner contact info.
                                        </p>
                                    </div>
                                ) : (
                                    filteredAppts.map(appt => (
                                        <div
                                            key={appt._id}
                                            className="bg-white rounded-3xl border border-slate-200/70 p-5 shadow-xs hover:shadow-md transition-shadow space-y-3"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0">
                                                        🐾
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="font-black text-slate-900 text-base">{appt.petName}</h3>
                                                            <StatusBadge status={appt.status} />
                                                        </div>
                                                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                            Caretaker: <span className="font-bold text-slate-800">{appt.userId?.username || "Verified Caretaker"}</span>
                                                            {appt.userId?.email && <span className="text-slate-400"> ({appt.userId.email})</span>}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                                                            <span className="flex items-center gap-1 text-slate-600 font-bold">
                                                                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                                                                {appt.preferredDate} at {appt.preferredTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2 self-end sm:self-start">
                                                    {appt.status === "pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleQuickStatus(appt._id, "confirmed")}
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                                                            >
                                                                <Check className="h-3.5 w-3.5" /> Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleQuickStatus(appt._id, "cancelled")}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all"
                                                            >
                                                                <XCircle className="h-3.5 w-3.5" /> Decline
                                                            </button>
                                                        </>
                                                    )}
                                                    {appt.status === "confirmed" && (
                                                        <button
                                                            onClick={() => handleQuickStatus(appt._id, "completed")}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                                                        >
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Done
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setManageAppt(appt)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                                                    >
                                                        <FileText className="h-3.5 w-3.5" /> Clinical Notes
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Reason & Chief Complaint */}
                                            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs">
                                                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Chief Complaint / Symptoms</span>
                                                <p className="text-slate-800 font-medium leading-relaxed">{appt.reason || "General animal health consultation and routine checkup."}</p>
                                            </div>

                                            {/* Doctor Prescription / Treatment Notes */}
                                            {appt.doctorNotes && (
                                                <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs">
                                                    <span className="font-black text-indigo-700 uppercase tracking-wider block mb-1">Recorded Treatment Notes & Prescription:</span>
                                                    <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">{appt.doctorNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════
                        TAB 2: MY ASSIGNED PATIENTS ROSTER
                    ═══════════════════════════════════════════════════════════ */}
                    {activeTab === "patients" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Assigned Patient Roster</h2>
                                    <p className="text-xs text-slate-400 font-medium">{myPatients.length} animal owners with recorded consultations with you</p>
                                </div>
                            </div>

                            {myPatients.length === 0 ? (
                                <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-2">
                                    <Users className="h-10 w-10 text-slate-300 mx-auto" />
                                    <p className="text-sm font-bold text-slate-600">No assigned patients yet</p>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                        Only caretakers and farmers who have scheduled consultations with your clinic will appear in this private roster.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {myPatients.map(u => {
                                        const userAppts = appointments.filter(a => String(a.userId?._id || a.userId) === String(u._id));
                                        return (
                                            <div
                                                key={u._id}
                                                className="bg-white rounded-3xl border border-slate-200/70 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl font-black text-indigo-600 shrink-0">
                                                        {u.username?.charAt(0).toUpperCase() || "P"}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-black text-slate-900 text-base">{u.username}</h4>
                                                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black px-2 py-0.5 rounded-full">
                                                                Assigned Patient
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                                                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 font-medium">
                                                            <span>📍 {u.profile?.location || "India"}</span>
                                                            <span className="font-bold text-indigo-600">{userAppts.length} Completed / Active Consultations</span>
                                                        </div>
                                                        {u.profile?.pets && u.profile.pets.length > 0 && (
                                                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                                                {u.profile.pets.map((pet, i) => (
                                                                    <span key={i} className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                                                                        <PawPrint className="h-2.5 w-2.5 text-indigo-600" />
                                                                        {typeof pet === "string" ? pet : pet.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setApptFilter("all");
                                                        setSearchQuery(u.username);
                                                        setActiveTab("appointments");
                                                    }}
                                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 self-end sm:self-center transition-colors"
                                                >
                                                    <span>View Case History</span>
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════
                        TAB 3: CLINICAL PRACTICE INSIGHTS (CHARTS)
                    ═══════════════════════════════════════════════════════════ */}
                    {activeTab === "analytics" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Monthly Consultation Trend Chart */}
                                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/70 shadow-xs space-y-4">
                                    <div>
                                        <h3 className="font-black text-slate-900 text-base">Monthly Consultation Trajectory</h3>
                                        <p className="text-xs text-slate-400 font-medium">Monthly case volume and successful treatments</p>
                                    </div>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={analytics.monthlyTrend}>
                                                <defs>
                                                    <linearGradient id="colorConsult" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: "0.75rem", color: "#fff", border: "none" }} />
                                                <Area type="monotone" dataKey="consultations" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorConsult)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Patient Species Breakdown Donut Chart */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-xs space-y-4 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-black text-slate-900 text-base">Patient Species Mix</h3>
                                        <p className="text-xs text-slate-400 font-medium">Categorization by animal species</p>
                                    </div>
                                    <div className="h-44 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics.speciesData}
                                                    innerRadius={45}
                                                    outerRadius={65}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {analytics.speciesData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: "0.75rem", color: "#fff", border: "none" }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                                        {analytics.speciesData.map(p => (
                                            <div key={p.name} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2 font-bold text-slate-700">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                                                    <span>{p.name}</span>
                                                </div>
                                                <span className="font-black text-slate-900">{p.value} cases</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════
                        TAB 4: DOCTOR CLINICAL PROFILE & SETTINGS
                    ═══════════════════════════════════════════════════════════ */}
                    {activeTab === "profile" && (
                        <div className="bg-white rounded-3xl border border-slate-200/70 shadow-xs overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-slate-900 text-base">Professional Practice Details</h3>
                                    <p className="text-xs text-slate-400 font-medium">Public clinical profile displayed to animal caretakers</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {editMode ? (
                                        <>
                                            <button
                                                onClick={saveProfile}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
                                            >
                                                <Save className="h-3.5 w-3.5" /> Save Changes
                                            </button>
                                            <button
                                                onClick={() => setEditMode(false)}
                                                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
                                        >
                                            <Pencil className="h-3.5 w-3.5" /> Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Doctor Full Name" value={profile?.doctorName} onChange={e => setProfile({...profile, doctorName: e.target.value})} readOnly={!editMode} />
                                    <Field label="Degrees & Qualifications" value={profile?.qualification} onChange={e => setProfile({...profile, qualification: e.target.value})} placeholder="e.g. BVSc & AH, MVSc Surgery" readOnly={!editMode} />
                                    <Field label="Clinical Specialization" value={profile?.specialization} onChange={e => setProfile({...profile, specialization: e.target.value})} placeholder="e.g. Small Animal Medicine, Bovine Surgery" readOnly={!editMode} />
                                    <Field label="Clinic / Veterinary Hospital" value={profile?.clinicName} onChange={e => setProfile({...profile, clinicName: e.target.value})} placeholder="e.g. Apollo Pet Hospital" readOnly={!editMode} />
                                    <Field label="City & Practice Location" value={profile?.location} onChange={e => setProfile({...profile, location: e.target.value})} placeholder="e.g. Bengaluru, Karnataka" readOnly={!editMode} />
                                    <Field label="Emergency Contact Number" value={profile?.contactNumber} onChange={e => setProfile({...profile, contactNumber: e.target.value})} placeholder="e.g. +91 9876543210" readOnly={!editMode} />
                                    <Field label="Years of Clinical Experience" type="number" value={profile?.yearsOfExperience} onChange={e => setProfile({...profile, yearsOfExperience: e.target.value})} readOnly={!editMode} />
                                    <Field label="Verified Platform Rating (0-5)" type="number" step="0.1" value={profile?.rating} readOnly={true} />
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ── Appointment Modal ───────────────────────────────────────────── */}
            {manageAppt && (
                <AppointmentModal
                    appt={manageAppt}
                    onClose={() => setManageAppt(null)}
                    onSave={() => { setManageAppt(null); loadData(); }}
                />
            )}
        </div>
    );
}
