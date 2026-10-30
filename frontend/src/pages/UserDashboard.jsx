import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  MessageSquare, Heart, Shield, Search, User, Clipboard, PlusCircle, 
  MapPin, Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, 
  ArrowRight, PhoneCall, Stethoscope, CreditCard, ChevronRight,
  FileText, Activity, Award, Bell
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, getMyAppointments } from "@/integrations/authApi";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, apptsRes] = await Promise.allSettled([
          getProfile(),
          getMyAppointments()
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value) {
          const p = profileRes.value.profile || {};
          setProfileData(p);
          if (p.pets && Array.isArray(p.pets)) {
            setPets(p.pets);
          }
        }

        if (apptsRes.status === "fulfilled" && apptsRes.value) {
          const apptList = apptsRes.value.data || apptsRes.value || [];
          setAppointments(Array.isArray(apptList) ? apptList : []);
        }
      } catch (err) {
        console.error("Dashboard data load notice:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute metrics
  const totalPets = pets.length;
  const upcomingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const planName = user?.subscriptionPlan === 'farm_pro' 
    ? 'Farm Pro' 
    : (user?.subscriptionPlan === 'care_plus' ? 'Care Plus' : 'Free Starter');
  const isPaidPlan = user?.subscriptionPlan === 'care_plus' || user?.subscriptionPlan === 'farm_pro';

  const quickActions = [
    { 
      title: "AI Vet Consultation", 
      desc: "24/7 instant diagnosis & emergency care",
      icon: MessageSquare, 
      path: "/chat", 
      color: "from-blue-500 to-indigo-600",
      badge: "24/7 Live"
    },
    { 
      title: "Book Veterinarian", 
      desc: "Connect with verified local doctors",
      icon: Stethoscope, 
      path: "/doctor-profiles", 
      color: "from-emerald-500 to-teal-600",
      badge: "Verified"
    },
    { 
      title: "Disease & Cure Guide", 
      desc: "Explore 17 animals & 60+ treatments",
      icon: Search, 
      path: "/animals", 
      color: "from-purple-500 to-pink-600",
      badge: "Updated"
    },
    { 
      title: "My Animals & Passports", 
      desc: "Manage records & print digital passports",
      icon: Heart, 
      path: "/profile", 
      color: "from-rose-500 to-amber-600",
      badge: `${totalPets} Pets`
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        {/* Welcome Header */}
        <section className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white pt-10 pb-20 px-4 md:px-8 border-b border-emerald-900/40">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 backdrop-blur-md">
                  <Sparkles className="h-3 w-3" /> Pet Parent Portal
                </span>
                <span className="text-xs text-slate-400">&bull; Verified Account</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Welcome back, {user?.username || profileData?.name || "Friend"}! 👋
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-1 max-w-xl">
                Track your animals' medical health, schedule doctor appointments, and consult our 24/7 AI vet.
              </p>
            </div>

            {/* Subscription Pill */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Current Plan</div>
                  <div className="text-base font-extrabold text-white flex items-center gap-1.5">
                    {planName}
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${isPaidPlan ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                      {user?.subscriptionStatus === 'active' ? 'ACTIVE' : 'FREE'}
                    </span>
                  </div>
                </div>
                <Link
                  to="/pricing"
                  className="ml-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  {isPaidPlan ? "Manage" : "Upgrade"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-10 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Stat 1 */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-md flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{totalPets}</div>
                <div className="text-xs font-semibold text-slate-500">Registered Animals</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-md flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{upcomingAppointments.length}</div>
                <div className="text-xs font-semibold text-slate-500">Upcoming Visits</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-md flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{isPaidPlan ? "100%" : "Starter"}</div>
                <div className="text-xs font-semibold text-slate-500">Care Protection</div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-md flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">24/7</div>
                <div className="text-xs font-semibold text-slate-500">AI Vet Triage</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Tiles */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 mt-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Quick Actions & Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                to={action.path}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${action.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                      {action.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {action.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>Open Tool</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Main Content Sections: Appointments & Pets vs Sidebar */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Appointments & Pets */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Scheduled Appointments Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Doctor Appointments</h3>
                    <p className="text-xs text-slate-500">Your upcoming and previous clinic visits</p>
                  </div>
                </div>
                <Link
                  to="/doctor-profiles"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  Book New Visit <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  <Calendar className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No scheduled appointments</p>
                  <p className="text-xs text-slate-500 mt-0.5 mb-4">Book a consultation with verified veterinary clinicians nearby.</p>
                  <Link
                    to="/doctor-profiles"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <Stethoscope className="h-3.5 w-3.5" /> Browse Veterinary Clinics
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((appt) => (
                    <div 
                      key={appt._id} 
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                          🐾
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{appt.petName || "Pet"}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                              (appt.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800')
                            }`}>
                              {appt.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Dr. {appt.doctorName || "Veterinary Doctor"} · {appt.reason || "General Checkup"}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {appt.preferredDate || "Scheduled"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {appt.preferredTime || "Daytime"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link 
                        to="/profile"
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Animals Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">My Registered Animals</h3>
                    <p className="text-xs text-slate-500">Digital Health Passports & Medical Records</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  Manage All Pets <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {pets.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  <Heart className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No animals registered yet</p>
                  <p className="text-xs text-slate-500 mt-0.5 mb-4">Add your pets or farm livestock to maintain digital immunization records.</p>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Register Your First Animal
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pets.map((pet, idx) => (
                    <div 
                      key={pet.id || idx}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                          {pet.type === 'Dog' ? '🐶' : (pet.type === 'Cat' ? '🐱' : (pet.type === 'Cow' ? '🐮' : '🐾'))}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{pet.name}</h4>
                          <p className="text-xs text-slate-500">{pet.type} · {pet.breed || "Standard"}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.2 rounded-full">
                            Vaccines: {pet.vaccination || "Up to date"}
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        className="text-xs font-semibold text-slate-500 hover:text-emerald-700 p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                        title="View Health Passport"
                      >
                        <FileText className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Subscription & Emergency SOS */}
          <div className="space-y-6">
            
            {/* Active Subscription Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Subscription Plan</h3>
                    <p className="text-xs text-slate-500">Tier & Payment Status</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                  {user?.subscriptionStatus === 'active' ? 'Active' : 'Standard'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                <div className="text-xs text-slate-500 font-medium">Current Tier</div>
                <div className="text-lg font-black text-slate-900 mt-0.5 flex items-center justify-between">
                  <span>{planName}</span>
                  <span className="text-xs font-bold text-emerald-700">
                    {user?.subscriptionPlan === 'care_plus' ? '₹199 / mo' : (user?.subscriptionPlan === 'farm_pro' ? '₹499 / mo' : 'Free')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                  <span>Secured via Razorpay Payment Gateway</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 mb-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Unlimited 24/7 AI Veterinary Consultations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Verified Clinic & Doctor Appointments</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Digital Animal Health Passports</span>
                </div>
              </div>

              <Link
                to="/pricing"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center block transition-colors shadow-sm"
              >
                {isPaidPlan ? "Manage Subscription Plan" : "Upgrade to Care Plus / Farm Pro"}
              </Link>
            </div>

            {/* 24/7 AI Chat Banner */}
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/20 text-white backdrop-blur-md mb-2">
                  <Sparkles className="h-3 w-3" /> Live Assistant
                </span>
                <h3 className="font-extrabold text-lg text-white mb-1">
                  Have an urgent animal symptom?
                </h3>
                <p className="text-white/80 text-xs leading-relaxed mb-4">
                  Describe symptoms like fever, bloat, digestive issues, or skin rashes for instant veterinary triage.
                </p>
                <Link
                  to="/chat"
                  className="w-full block text-center py-2.5 px-4 bg-white text-indigo-900 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-colors shadow-sm"
                >
                  Start AI Consultation Now
                </Link>
              </div>
            </div>

            {/* Emergency SOS Callout */}
            <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-950 text-sm">Govt 1962 Animal Ambulance</h4>
                  <p className="text-rose-700 text-xs mt-1 leading-relaxed">
                    Toll-free emergency helpline for critical veterinary rescue and ambulance across India.
                  </p>
                  <a
                    href="tel:1962"
                    className="inline-block mt-2 font-black text-rose-900 text-xs hover:underline"
                  >
                    📞 Call 1962 (Toll Free)
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
