import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MessageSquare,
  Heart,
  Shield,
  Lock,
  Search,
  User,
  MapPin,
  CreditCard,
  Receipt,
  FileText,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  RotateCcw,
  Printer,
  Copy,
  AlertCircle,
  Clock,
  Zap,
  Calendar,
  Sparkles,
  Check,
  Award,
  PhoneCall,
  Loader2,
  ExternalLink
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCurrentSubscription,
  getMyInvoices,
  resetSubscription,
  getProfile
} from "@/integrations/authApi";
import { toast } from "sonner";

export default function UserDashboard() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'billing' | 'upgrade' | 'animals'
  const [subData, setSubData] = useState({
    subscriptionPlan: user?.subscriptionPlan || "free",
    subscriptionExpiry: user?.subscriptionExpiry || null,
  });
  const [invoices, setInvoices] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Load subscription status
        try {
          const { data: sub } = await getCurrentSubscription();
          setSubData({
            subscriptionPlan: sub?.subscriptionPlan || sub?.plan || "free",
            subscriptionExpiry: sub?.subscriptionExpiry || sub?.expiry || null,
          });
        } catch (e) {
          console.warn("Could not load subscription status:", e);
        }

        // Load invoice billing history
        try {
          const { data: invList } = await getMyInvoices();
          setInvoices(Array.isArray(invList) ? invList : []);
        } catch (e) {
          console.warn("Could not load invoices:", e);
        }

        // Load user profile & pets
        try {
          const profileData = await getProfile();
          if (profileData?.profile?.pets) {
            setPets(profileData.profile.pets);
          }
        } catch (e) {
          console.warn("Could not load profile:", e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleResetToFree = async () => {
    setResetting(true);
    try {
      await resetSubscription();
      setSubData({ subscriptionPlan: "free", subscriptionExpiry: null });
      if (refreshProfile) await refreshProfile();
      toast.success("Subscription reset to Free Plan (Test Mode)!");
    } catch (err) {
      toast.error("Failed to reset subscription");
    } finally {
      setResetting(false);
    }
  };

  const getPlanDetails = (planId) => {
    switch (planId) {
      case "farm_pro":
        return {
          name: "Farm & Livestock Pro",
          price: 499,
          badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
          tag: "Livestock & Herd Tier",
        };
      case "care_plus":
        return {
          name: "Care Plus (Pet Care)",
          price: 199,
          badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
          tag: "Premium Pet Tier",
        };
      default:
        return {
          name: "Free Starter",
          price: 0,
          badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
          tag: "Standard Tier",
        };
    }
  };

  const currentPlanInfo = getPlanDetails(subData.subscriptionPlan);
  const isPaidActive = subData.subscriptionPlan !== "free";

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysRemaining = getDaysRemaining(subData.subscriptionExpiry);

  const printSingleInvoice = (inv) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${inv.invoiceNumber} - Know Your Animal</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; background: #fff; }
            .invoice-box { max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 35px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
            .brand { font-size: 24px; font-weight: 900; color: #059669; }
            .brand span { color: #0f172a; }
            .badge { display: inline-block; background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; }
            .label { color: #64748b; font-weight: 500; }
            .val { color: #0f172a; font-weight: 700; text-align: right; }
            .total-row { display: flex; justify-content: space-between; padding: 16px 0 6px 0; border-top: 2px solid #e2e8f0; margin-top: 14px; font-size: 18px; font-weight: 900; color: #059669; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 30px; border-top: 1px dashed #cbd5e1; pt-4; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="brand">🐾 Know<span>YourAnimal</span></div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Veterinary Digital Health Platform</div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">GST Registered • Automated Digital Tax Invoice</div>
              </div>
              <div style="text-align: right;">
                <div class="badge">PAID & VERIFIED</div>
                <div style="font-size: 13px; font-weight: 800; margin-top: 8px;">${inv.invoiceNumber}</div>
                <div style="font-size: 11px; color: #64748b;">${new Date(inv.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</div>
              </div>
            </div>

            <div class="row">
              <span class="label">Customer Name</span>
              <span class="val">${user?.username || "Valued Member"}</span>
            </div>
            <div class="row">
              <span class="label">Customer Email</span>
              <span class="val">${user?.email || "Registered User"}</span>
            </div>
            <div class="row">
              <span class="label">Membership Plan</span>
              <span class="val">${inv.planName}</span>
            </div>
            <div class="row">
              <span class="label">Payment ID</span>
              <span class="val" style="font-family: monospace;">${inv.razorpayPaymentId}</span>
            </div>
            <div class="row">
              <span class="label">Order Reference</span>
              <span class="val" style="font-family: monospace;">${inv.razorpayOrderId}</span>
            </div>
            <div class="row">
              <span class="label">Payment Method</span>
              <span class="val">${inv.paymentMethod}</span>
            </div>
            <div class="row">
              <span class="label">Coverage Validity</span>
              <span class="val">30 Days (Valid until ${new Date(inv.expiryDate).toLocaleDateString("en-IN", { dateStyle: "medium" })})</span>
            </div>

            <div class="total-row">
              <span>Total Paid (INR)</span>
              <span>₹${inv.amount}.00</span>
            </div>

            <div class="footer">
              <p>Thank you for supporting animal healthcare and verified veterinary medicine.</p>
              <p>Secured by 256-Bit Encryption • Razorpay Authorized Digital Payment</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Profile Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-600/20">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                      Hello, {user?.username || "Animal Lover"}!
                    </h1>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Verified Member
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                    <span>{user?.email}</span>
                    <span className="text-slate-300">•</span>
                    <span>Role: <b className="capitalize text-slate-700">{user?.role || "user"}</b></span>
                  </p>
                </div>
              </div>

              {/* Top Plan Quick Badge & CTA */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left min-w-[200px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Current Membership
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="font-extrabold text-sm text-slate-900">{currentPlanInfo.name}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${currentPlanInfo.badgeColor}`}>
                      {isPaidActive ? "ACTIVE" : "FREE"}
                    </span>
                  </div>
                  {isPaidActive && daysRemaining !== null && (
                    <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                      ⏳ {daysRemaining} days remaining
                    </span>
                  )}
                </div>

                {subData.subscriptionPlan !== "farm_pro" && (
                  <button
                    onClick={() => setActiveTab("upgrade")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                  >
                    <Sparkles className="h-4 w-4 text-yellow-300" /> Upgrade Plan
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-100 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "overview", label: "Overview", icon: Zap },
                { id: "billing", label: "Billing & Invoices", icon: Receipt },
                { id: "upgrade", label: "Plans & Upgrade", icon: Sparkles },
                { id: "animals", label: `My Animals (${pets.length})`, icon: Heart },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ══════════════════ TAB 1: OVERVIEW ══════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Quick Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/chat"
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 24/7 AI Online
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                      AI Veterinary Assistant
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Instant medical triage, first aid & nutrition guidance</p>
                  </div>
                </Link>

                <Link
                  to="/vets"
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      Geo-Map
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                      Nearby Vet Clinics
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Discover animal hospitals & dispensaries near you</p>
                  </div>
                </Link>

                <Link
                  to="/doctor-profiles"
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                      <Search className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                      Expert Doctors
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Schedule consultations with top animal surgeons</p>
                  </div>
                </Link>

                <Link
                  to="/profile"
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                      <Heart className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                      {pets.length} Registered
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-600 transition-colors">
                      Pet Health Records
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Manage immunization passports & medical history</p>
                  </div>
                </Link>
              </div>

              {/* Subscription Promotion or Active Plan Overview */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      <Sparkles className="h-3.5 w-3.5" /> Razorpay Secured Healthcare Membership
                    </div>
                    <h3 className="text-2xl font-black">
                      {isPaidActive ? (
                        <>You are on <span className="text-emerald-400">{currentPlanInfo.name}</span></>
                      ) : (
                        <>Upgrade to <span className="text-emerald-400">Care Plus</span> for ₹199/month</>
                      )}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {isPaidActive ? (
                        `All premium features are active until ${subData.subscriptionExpiry ? new Date(subData.subscriptionExpiry).toLocaleDateString("en-IN", { dateStyle: "long" }) : "end of billing cycle"}. Enjoy unlimited 24/7 AI triage and emergency response.`
                      ) : (
                        "Unlock unlimited 24/7 AI veterinary triage, direct clinician appointment scheduling, and automated vaccination health reminders for all your pets."
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab("billing")}
                      className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      View Invoices
                    </button>

                    <button
                      onClick={() => setActiveTab("upgrade")}
                      className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      {isPaidActive ? "Manage / Change Plan" : "Upgrade Plan Now"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Emergency Hotline 1962 Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Need Critical Emergency Help?</h4>
                    <p className="text-xs text-amber-800">
                      National Animal Ambulance Toll-Free Helpline: <b>1962</b> (Government of India)
                    </p>
                  </div>
                </div>
                <a
                  href="tel:1962"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <PhoneCall className="h-3.5 w-3.5" /> Call 1962 Now
                </a>
              </div>
            </div>
          )}

          {/* ══════════════════ TAB 2: BILLING & INVOICES ══════════════════ */}
          {activeTab === "billing" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Top Active Subscription Summary Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 flex-wrap gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Active Subscription
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      {currentPlanInfo.name}
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${currentPlanInfo.badgeColor}`}>
                        {isPaidActive ? "ACTIVE & VERIFIED" : "FREE STARTER"}
                      </span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveTab("upgrade")}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs transition-colors shadow-sm"
                    >
                      Change Plan
                    </button>
                    {isPaidActive && (
                      <button
                        onClick={handleResetToFree}
                        disabled={resetting}
                        className="px-3 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors flex items-center gap-1"
                        title="Reset to free tier for test mode"
                      >
                        <RotateCcw className={`h-3 w-3 ${resetting ? "animate-spin" : ""}`} />
                        Reset (Test Mode)
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 font-bold block mb-1">BILLING RATE</span>
                    <span className="font-black text-lg text-slate-900">
                      ₹{currentPlanInfo.price}.00 <span className="text-xs font-normal text-slate-500">/ month</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-bold block mb-1">STATUS</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      {isPaidActive ? "Active Auto-Renewable" : "Standard Forever Free"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-bold block mb-1">EXPIRY / NEXT CYCLE</span>
                    <span className="font-bold text-slate-800">
                      {subData.subscriptionExpiry
                        ? new Date(subData.subscriptionExpiry).toLocaleDateString("en-IN", { dateStyle: "medium" })
                        : "No expiration"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-bold block mb-1">PAYMENT PROVIDER</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5 text-blue-600" /> Razorpay 256-Bit SSL
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoices History Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-emerald-600" /> Payment & Tax Invoices
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Official GST tax receipts generated automatically for all completed subscription transactions.
                    </p>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {invoices.length} {invoices.length === 1 ? "Invoice" : "Invoices"} Recorded
                  </span>
                </div>

                {invoices.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-7 w-7" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">No Invoices Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                      When you subscribe to Care Plus or Farm Pro via Razorpay, your printable tax receipts will appear here.
                    </p>
                    <button
                      onClick={() => setActiveTab("upgrade")}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      View Plans & Upgrade
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider">
                        <tr>
                          <th className="py-3.5 px-6">Invoice #</th>
                          <th className="py-3.5 px-6">Date</th>
                          <th className="py-3.5 px-6">Plan Description</th>
                          <th className="py-3.5 px-6">Amount</th>
                          <th className="py-3.5 px-6">Status</th>
                          <th className="py-3.5 px-6">Method</th>
                          <th className="py-3.5 px-6 text-right">Receipt (PDF)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {invoices.map((inv) => (
                          <tr key={inv.id || inv.invoiceNumber} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-4 px-6 font-mono font-bold text-slate-900">
                              <span className="flex items-center gap-1.5">
                                {inv.invoiceNumber}
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(inv.invoiceNumber);
                                    toast.success("Invoice number copied!");
                                  }}
                                  title="Copy"
                                >
                                  <Copy className="h-3 w-3 text-slate-400 hover:text-slate-600" />
                                </button>
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-600">
                              {new Date(inv.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                            </td>
                            <td className="py-4 px-6 font-bold text-slate-900">{inv.planName}</td>
                            <td className="py-4 px-6 font-black text-emerald-600 text-sm">₹{inv.amount}.00</td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center gap-1 font-bold text-[10px] uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                <Check className="h-3 w-3" /> Paid
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-500 font-medium">{inv.paymentMethod}</td>
                            <td className="py-4 px-6 text-right">
                              <button
                                type="button"
                                onClick={() => printSingleInvoice(inv)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors shadow-sm"
                              >
                                <Printer className="h-3.5 w-3.5" /> Print Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Trust & Guarantee Box */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-700 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Bank Grade Security Guarantee</span>
                    <span className="text-slate-600">
                      All subscriptions are processed via 256-bit encrypted Razorpay tokenization. You can cancel or upgrade anytime.
                    </span>
                  </div>
                </div>
                <Link to="/pricing" className="text-emerald-700 font-bold hover:underline shrink-0 whitespace-nowrap">
                  View Cancellation Policy →
                </Link>
              </div>
            </div>
          )}

          {/* ══════════════════ TAB 3: PLANS & UPGRADE ══════════════════ */}
          {activeTab === "upgrade" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Upgrade or Switch Your Plan</h2>
                <p className="text-slate-500 text-sm">
                  Choose the plan that suits your pets or livestock needs. All plans are backed by Razorpay encryption.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* 1. Free Starter */}
                <div className={`bg-white rounded-3xl p-6 sm:p-7 border flex flex-col justify-between ${
                  subData.subscriptionPlan === "free" ? "border-slate-400 ring-2 ring-slate-300" : "border-slate-200"
                }`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                        <Heart className="h-5 w-5" />
                      </div>
                      {subData.subscriptionPlan === "free" && (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Current Plan
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-1">Free Starter</h3>
                    <p className="text-xs text-slate-500 mb-5">Standard community care encyclopedia.</p>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-black text-slate-900">₹0</span>
                      <span className="text-xs text-slate-400 font-bold">/ forever</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Community animal care library
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Symptoms & disease index
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Nearby vet clinic locator
                      </li>
                    </ul>
                  </div>

                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs"
                  >
                    {subData.subscriptionPlan === "free" ? "Active" : "Included"}
                  </button>
                </div>

                {/* 2. Care Plus (Pet Care) */}
                <div className={`bg-white rounded-3xl p-6 sm:p-7 border-2 flex flex-col justify-between relative transform md:-translate-y-2 shadow-lg ${
                  subData.subscriptionPlan === "care_plus"
                    ? "border-emerald-600 ring-4 ring-emerald-500/10"
                    : "border-emerald-500 shadow-emerald-500/10"
                }`}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow">
                    Most Popular
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      {subData.subscriptionPlan === "care_plus" && (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Active Plan
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-1">Care Plus</h3>
                    <p className="text-xs text-slate-500 mb-5">For devoted pet parents who need 24/7 care.</p>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-black text-slate-900">₹199</span>
                      <span className="text-xs text-slate-400 font-bold">/ month</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-700 mb-6 font-medium">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 font-bold shrink-0" /> Unlimited 24/7 AI Vet Consultation
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 font-bold shrink-0" /> Priority doctor appointment slots
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 font-bold shrink-0" /> Digital Pet Health & Vaccine Records
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 font-bold shrink-0" /> Direct emergency 1962 priority helpline
                      </li>
                    </ul>
                  </div>

                  {subData.subscriptionPlan === "care_plus" ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => navigate("/checkout?plan=care_plus")}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        Active Plan • Extend / Renew <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate("/checkout?plan=care_plus")}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      Upgrade to Care Plus <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* 3. Farm & Livestock Pro */}
                <div className={`bg-white rounded-3xl p-6 sm:p-7 border flex flex-col justify-between shadow-sm ${
                  subData.subscriptionPlan === "farm_pro"
                    ? "border-purple-600 ring-4 ring-purple-500/10"
                    : "border-slate-200"
                }`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Award className="h-5 w-5" />
                      </div>
                      {subData.subscriptionPlan === "farm_pro" && (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          Active Plan
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-1">Farm & Livestock Pro</h3>
                    <p className="text-xs text-slate-500 mb-5">For dairy farms, cattle, goat & livestock herds.</p>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-black text-slate-900">₹499</span>
                      <span className="text-xs text-slate-400 font-bold">/ month</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-700 mb-6 font-medium">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-purple-600 font-bold shrink-0" /> Everything in Care Plus included
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-purple-600 font-bold shrink-0" /> Full herd health management
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-purple-600 font-bold shrink-0" /> Cattle, sheep, poultry & equine protocols
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-purple-600 font-bold shrink-0" /> Bulk vaccination & disease outbreak alerts
                      </li>
                    </ul>
                  </div>

                  {subData.subscriptionPlan === "farm_pro" ? (
                    <button
                      onClick={() => navigate("/checkout?plan=farm_pro")}
                      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      Active Plan • Extend / Renew <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/checkout?plan=farm_pro")}
                      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all shadow-md shadow-purple-600/20 active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      Upgrade to Farm Pro <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════ TAB 4: MY ANIMALS ══════════════════ */}
          {activeTab === "animals" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Registered Animals & Pet Passports</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Keep digital records of vaccination status, medical notes, and emergency history for your pets.
                  </p>
                </div>

                <Link
                  to="/profile"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  + Add / Edit Animals
                </Link>
              </div>

              {pets.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-7 w-7" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">No Animals Registered Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                    Add your dogs, cats, cows, or other pets to track their health history and vaccination schedules.
                  </p>
                  <Link
                    to="/profile"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm inline-block"
                  >
                    Register Your First Animal
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pets.map((pet, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                            {pet.animalType?.toLowerCase().includes("dog") ? "🐕" : pet.animalType?.toLowerCase().includes("cat") ? "🐈" : "🐾"}
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
                            {pet.animalType || "Pet"}
                          </span>
                        </div>

                        <h4 className="font-black text-lg text-slate-900">{pet.petName || "Unnamed Pet"}</h4>
                        <p className="text-xs text-slate-500 mb-4">{pet.breed || "Standard Breed"} • {pet.age ? `${pet.age} yrs` : "Age not set"}</p>

                        <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Vaccination:</span>
                            <span className="font-bold text-slate-800">{pet.vaccinationStatus || "Up to date"}</span>
                          </div>
                          {pet.medicalHistory && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">History:</span>
                              <span className="font-medium text-slate-800 line-clamp-1">{pet.medicalHistory}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        className="mt-5 block w-full text-center py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                      >
                        Manage Record →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
