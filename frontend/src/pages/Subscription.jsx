import { useState, useEffect } from "react";
import { Check, Sparkles, Shield, Zap, Heart, ArrowRight, Loader2, Award, AlertCircle, HelpCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSubscriptionPlans,
  getCurrentSubscription,
  resetSubscription,
} from "@/integrations/authApi";
import { toast } from "sonner";

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: planData } = await getSubscriptionPlans();
        const plansList = Array.isArray(planData) ? planData : (planData?.plans || []);
        setPlans(plansList);

        if (user) {
          try {
            const { data: subData } = await getCurrentSubscription();
            setCurrentPlan(subData?.subscriptionPlan || subData?.plan || "free");
            setSubscriptionExpiry(subData?.subscriptionExpiry || subData?.expiry || null);
          } catch {
            // Unauthenticated or default
          }
        }
      } catch (err) {
        console.error("Failed to load plans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleChoosePlan = (planId) => {
    if (!user) {
      toast.error("Please sign in or create an account to subscribe.");
      navigate("/auth");
      return;
    }
    // Navigate directly to the Razorpay checkout terminal page
    navigate(`/checkout?plan=${planId}`);
  };

  const handleResetToFree = async () => {
    setResetting(true);
    try {
      await resetSubscription();
      setCurrentPlan("free");
      setSubscriptionExpiry(null);
      toast.success("Subscription reset to Free! You can now test the payment button fresh.");
    } catch (err) {
      toast.error("Failed to reset subscription");
    } finally {
      setResetting(false);
    }
  };

  const freeFeatures = [
    "Community animal care encyclopedia",
    "Basic disease library & symptom checker",
    "Access to nearby veterinary clinic map",
    "Standard profile with registered pets"
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Active plan banner if user already subscribed */}
          {currentPlan !== "free" && (
            <div className="mb-10 p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    Active Plan: {currentPlan === "care_plus" ? "Care Plus (Pet Care)" : "Farm & Livestock Pro"}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Your membership is active.
                    {subscriptionExpiry && ` Valid until: ${new Date(subscriptionExpiry).toLocaleDateString()}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToFree}
                  disabled={resetting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-xs font-bold transition-colors"
                  title="Reset subscription to Free for testing payments"
                >
                  <RotateCcw className={`h-3 w-3 ${resetting ? "animate-spin" : ""}`} />
                  Reset to Free (Test Mode)
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Razorpay Secured Plans
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Care & Wellness Plans for <span className="text-primary italic">Every Animal</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Get unlimited 24/7 AI veterinary assistance, priority clinic bookings, and comprehensive herd management.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Free Plan */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 mb-6">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Free Starter</h3>
                  <p className="text-sm text-slate-500 mb-6">Essential information for every pet owner and animal lover.</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black text-slate-900">₹0</span>
                    <span className="text-sm text-slate-400 font-bold">/ forever</span>
                  </div>

                  <div className="space-y-3 mb-8">
                    {freeFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  disabled
                  className="w-full py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold text-sm cursor-default"
                >
                  {currentPlan === "free" ? "Current Plan" : "Included"}
                </button>
              </div>

              {/* Care Plus Plan (Featured) */}
              <div className="bg-white rounded-3xl p-8 border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 flex flex-col justify-between relative transform md:-translate-y-2">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                  Most Popular
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Care Plus</h3>
                  <p className="text-sm text-slate-500 mb-6">For dedicated pet parents who want immediate peace of mind.</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black text-slate-900">₹199</span>
                    <span className="text-sm text-slate-400 font-bold">/ month</span>
                  </div>

                  <div className="space-y-3 mb-8">
                    {(plans.find(p => p.id === "care_plus")?.features || [
                      "Unlimited 24/7 AI Veterinary Assistant",
                      "Priority appointment booking with verified doctors",
                      "Digital pet immunization & health record storage",
                      "Direct emergency hotline support"
                    ]).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 font-bold" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleChoosePlan("care_plus")}
                    className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {currentPlan === "care_plus" ? (
                      <>Active Membership • Open Checkout <ArrowRight className="h-4 w-4" /></>
                    ) : (
                      <>Pay with Razorpay <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>

                  {currentPlan === "care_plus" && (
                    <button
                      onClick={handleResetToFree}
                      className="w-full text-center text-xs text-slate-400 hover:text-rose-600 font-semibold py-1 transition-colors"
                    >
                      ⚡ Reset to Free Plan (Test Mode)
                    </button>
                  )}
                </div>
              </div>

              {/* Farm & Livestock Pro */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Farm & Livestock Pro</h3>
                  <p className="text-sm text-slate-500 mb-6">Complete herd care for dairy, goat, and poultry farmers.</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black text-slate-900">₹499</span>
                    <span className="text-sm text-slate-400 font-bold">/ month</span>
                  </div>

                  <div className="space-y-3 mb-8">
                    {(plans.find(p => p.id === "farm_pro")?.features || [
                      "Multi-animal & livestock herd health tracking",
                      "Priority teleconsultations with senior veterinarians",
                      "Digital treatment note & prescription archiving",
                      "Emergency ambulance dispatch coordination"
                    ]).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleChoosePlan("farm_pro")}
                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {currentPlan === "farm_pro" ? (
                      <>Active Membership • Open Checkout <ArrowRight className="h-4 w-4" /></>
                    ) : (
                      <>Pay with Razorpay <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>

                  {currentPlan === "farm_pro" && (
                    <button
                      onClick={handleResetToFree}
                      className="w-full text-center text-xs text-slate-400 hover:text-rose-600 font-semibold py-1 transition-colors"
                    >
                      ⚡ Reset to Free Plan (Test Mode)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods Supported Badges */}
          <div className="mt-16 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h4 className="text-xl font-black text-slate-900 mb-1">Supported Payment Methods</h4>
              <p className="text-xs text-slate-500">Fast, secure and encrypted transactions powered by Razorpay Gateway</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                <span className="text-lg font-black text-slate-800 mb-1">UPI & QR</span>
                <span className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM, CRED</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                <span className="text-lg font-black text-slate-800 mb-1">Cards</span>
                <span className="text-xs text-slate-500">Visa, MasterCard, RuPay Debit & Credit</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                <span className="text-lg font-black text-slate-800 mb-1">Net Banking</span>
                <span className="text-xs text-slate-500">SBI, HDFC, ICICI, Axis, Kotak & 50+ Banks</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                <span className="text-lg font-black text-slate-800 mb-1">Wallets</span>
                <span className="text-xs text-slate-500">Paytm, PhonePe, Amazon Pay, MobiKwik</span>
              </div>
            </div>
          </div>

          {/* Security & FAQ Footer */}
          <div className="mt-8 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">100% Safe & Secure Checkout</h4>
                <p className="text-sm text-slate-500">All transactions are processed through 256-bit SSL encrypted channels under RBI regulations.</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Need assistance?</span>
              <span className="text-sm font-bold text-primary">support@knowyouranimal.com</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Subscription;
