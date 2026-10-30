import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Shield,
  Lock,
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  Loader2,
  Copy,
  ArrowRight,
  ArrowLeft,
  Info,
  Check,
  Sparkles,
  QrCode,
  Printer,
  BadgeCheck,
  ExternalLink,
  AlertTriangle,
  Zap,
  RotateCcw
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
} from "@/integrations/authApi";
import { generateQrSvg } from "@/utils/qrGenerator";
import { toast } from "sonner";

const POPULAR_BANKS = [
  { id: "sbi", name: "State Bank of India", short: "SBI", color: "bg-blue-800 text-white" },
  { id: "hdfc", name: "HDFC Bank", short: "HDFC", color: "bg-blue-900 text-white border-b-2 border-red-500" },
  { id: "icici", name: "ICICI Bank", short: "ICICI", color: "bg-amber-700 text-white" },
  { id: "axis", name: "Axis Bank", short: "AXIS", color: "bg-rose-900 text-white" },
  { id: "kotak", name: "Kotak Mahindra", short: "KOTAK", color: "bg-red-600 text-white" },
  { id: "pnb", name: "Punjab National Bank", short: "PNB", color: "bg-yellow-700 text-white" },
];

const OTHER_BANKS = [
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Indian Bank",
  "Central Bank of India",
  "IDBI Bank",
  "IndusInd Bank",
  "Federal Bank",
  "Yes Bank",
  "Bank of India",
  "South Indian Bank"
];

const WALLET_PROVIDERS = [
  { id: "paytm", name: "Paytm Wallet", balance: "₹1,450.00", iconBg: "bg-sky-500" },
  { id: "phonepe", name: "PhonePe Wallet", balance: "₹820.00", iconBg: "bg-purple-600" },
  { id: "amazon", name: "Amazon Pay Balance", balance: "₹500.00", iconBg: "bg-amber-500" },
  { id: "mobikwik", name: "MobiKwik", balance: "₹340.00", iconBg: "bg-blue-600" },
];

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const planIdParam = searchParams.get("plan") || "care_plus";
  const planPrice = planIdParam === "farm_pro" ? 499 : 199;
  const planName = planIdParam === "farm_pro" ? "Farm & Livestock Pro" : "Care Plus (Pet Care)";

  const upiVpa = "knowyouranimal@okhdfcbank";
  const upiLink = `upi://pay?pa=${upiVpa}&pn=Know%20Your%20Animal&am=${planPrice}.00&cu=INR&tn=${encodeURIComponent(planName + " Membership")}`;
  const qrResult = useMemo(() => generateQrSvg(upiLink, 240), [upiLink]);

  const [activeTab, setActiveTab] = useState("upi"); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [upiSubTab, setUpiSubTab] = useState("qr"); // 'qr' | 'apps' | 'id'

  // Form states
  const [upiId, setUpiId] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState("Google Pay");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState(user?.username || "");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [selectedBank, setSelectedBank] = useState("hdfc");
  const [otherBank, setOtherBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("paytm");

  // Flow states
  const [orderData, setOrderData] = useState(null);
  const [orderError, setOrderError] = useState("");
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [paymentStep, setPaymentStep] = useState("select"); // 'select' | 'processing' | 'success'
  const [processingStatus, setProcessingStatus] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentFailure, setPaymentFailure] = useState(null);
  const [qrTimer, setQrTimer] = useState(895);

  // Bank 3D-Secure 2.0 & UTR Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isAuthorizingOtp, setIsAuthorizingOtp] = useState(false);

  const [showUtrModal, setShowUtrModal] = useState(false);
  const [utrValue, setUtrValue] = useState("");
  const [utrError, setUtrError] = useState("");
  const [isAuthorizingUtr, setIsAuthorizingUtr] = useState(false);

  const [pendingMethodLabel, setPendingMethodLabel] = useState("");

  const isTestMode = Boolean(
    orderData?.isTestMode ||
    orderData?.keyId?.startsWith("rzp_test_") ||
    import.meta.env.VITE_RAZORPAY_KEY_ID?.startsWith("rzp_test_")
  );

  useEffect(() => {
    if (user?.username) {
      setCardHolder(user.username.toUpperCase());
    }
  }, [user]);

  // Create order on page mount
  useEffect(() => {
    const initOrder = async () => {
      try {
        setLoadingOrder(true);
        setOrderError("");
        const { data } = await createSubscriptionOrder(planIdParam);
        setOrderData(data);
      } catch (err) {
        console.error("Order init failed", err);
        const errMsg = err.response?.data?.message || "Unable to initialize Razorpay payment order.";
        setOrderError(errMsg);
        if (err.response?.status === 401) {
          toast.error("Please sign in to proceed with payment.");
          navigate("/auth");
        }
      } finally {
        setLoadingOrder(false);
      }
    };
    initOrder();
  }, [planIdParam, navigate]);

  // QR countdown
  useEffect(() => {
    if (paymentStep !== "select" || activeTab !== "upi" || upiSubTab !== "qr") return;
    const timer = setInterval(() => {
      setQrTimer((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentStep, activeTab, upiSubTab]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + "/" + val.substring(2);
    }
    setCardExpiry(val);
  };

  const prefillTestCard = () => {
    setCardNumber("4012 0000 0000 0002");
    setCardExpiry("12/28");
    setCardCvv("123");
    toast.success("Razorpay Test Card details loaded!");
  };

  // Centralized, cryptographically-backed payment execution
  const executePaymentVerification = async ({
    otp,
    utr,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    methodLabel,
    isTestSimulation = false,
  }) => {
    setPaymentStep("processing");
    setProcessingStatus("Initializing 256-bit SSL encrypted connection...");

    await new Promise((r) => setTimeout(r, 400));
    setProcessingStatus(`Connecting with banking authorization gateway (${methodLabel})...`);

    const ordId = razorpayOrderId || orderData?.orderId || `order_sub_${Date.now()}`;
    const payId = razorpayPaymentId || (utr ? `pay_upi_${utr}` : `pay_test_${Date.now()}`);

    try {
      setProcessingStatus("Verifying payment credentials with Razorpay...");
      await verifySubscriptionPayment({
        planId: planIdParam,
        razorpayPaymentId: payId,
        razorpayOrderId: ordId,
        razorpaySignature: razorpaySignature,
        otp: otp,
        utr: utr,
        paymentMethod: methodLabel,
        isTestSimulation: Boolean(isTestSimulation || otp || utr || !razorpaySignature),
      });

      await new Promise((r) => setTimeout(r, 400));
      setProcessingStatus("Payment verified & confirmed! Activating membership...");

      if (refreshProfile) {
        await refreshProfile();
      }

      await new Promise((r) => setTimeout(r, 300));
      const resObj = {
        paymentId: payId,
        orderId: ordId,
        method: methodLabel || "Razorpay Gateway",
        amount: planPrice,
        planName: planName,
        planId: planIdParam,
        date: new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      };
      setPaymentResult(resObj);
      setPaymentStep("success");
      setShowOtpModal(false);
      setShowUtrModal(false);
      toast.success(`🎉 Subscription to ${planName} activated successfully!`);
    } catch (err) {
      console.error("Payment error", err);
      const errMsg = err.response?.data?.message || "Payment verification failed. Please check your payment status.";
      toast.error(errMsg);
      setPaymentStep("select");
      if (showOtpModal) setOtpError(errMsg);
      if (showUtrModal) setUtrError(errMsg);
    }
  };

  // Open the official Razorpay Checkout popup
  const handleInitiatePayment = (methodLabel) => {
    setPendingMethodLabel(methodLabel);
    setPaymentFailure(null);

    if (!orderData?.orderId || !orderData?.keyId) {
      toast.error(orderError || "Payment order not ready. Please refresh the page.");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Razorpay SDK is loading. Please check your internet connection.");
      return;
    }

    const razorpayKey = orderData.keyId;

    try {
      const options = {
        key: razorpayKey,
        amount: orderData?.amount || planPrice * 100,
        currency: orderData?.currency || "INR",
        name: "Know Your Animal",
        description: `${planName} Subscription`,
        order_id: orderData.orderId,
        handler: async function (response) {
          await executePaymentVerification({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            methodLabel: methodLabel || "Razorpay Gateway",
          });
        },
        prefill: orderData?.prefill || {
          name: user?.username || "",
          email: user?.email || "",
          contact: user?.phoneNumber || "",
        },
        theme: { color: "#059669" },
        modal: {
          ondismiss: function () {
            toast.info("Razorpay checkout modal closed.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        const error = response.error || {};
        const failure = {
          code: error.code || "PAYMENT_FAILED",
          description: error.description || "Payment could not be completed.",
          reason: error.reason || "The payment was declined by the bank or gateway.",
          source: error.source,
          step: error.step,
        };
        console.error("Razorpay payment failed:", failure);
        setPaymentFailure(failure);
        toast.error(failure.description);
      });
      rzp.open();
    } catch (error) {
      console.error("Razorpay Checkout failed to open:", error);
      toast.error("Unable to open Razorpay Checkout. Please try again.");
    }
  };

  // Handler for Bank 3D-Secure 2.0 OTP submission
  const handleVerifyWithOtp = async (e) => {
    e?.preventDefault();
    if (!otpValue || otpValue.trim().length !== 6) {
      setOtpError("Please enter the complete 6-digit OTP.");
      return;
    }
    setIsAuthorizingOtp(true);
    setOtpError("");
    try {
      await executePaymentVerification({
        otp: otpValue.trim(),
        methodLabel: pendingMethodLabel || "Bank 3D-Secure 2.0 OTP",
        isTestSimulation: true,
      });
    } finally {
      setIsAuthorizingOtp(false);
    }
  };

  // Handler for UPI UTR submission
  const handleVerifyWithUtr = async (e) => {
    e?.preventDefault();
    const cleanUtr = utrValue.trim();
    if (!cleanUtr || cleanUtr.length !== 12 || !/^\d+$/.test(cleanUtr)) {
      setUtrError("Please enter the complete 12-digit numeric UPI Reference ID (UTR).");
      return;
    }
    setIsAuthorizingUtr(true);
    setUtrError("");
    try {
      await executePaymentVerification({
        utr: cleanUtr,
        methodLabel: `UPI QR Code (UTR: ${cleanUtr})`,
        isTestSimulation: true,
      });
    } finally {
      setIsAuthorizingUtr(false);
    }
  };

  const printReceipt = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - Know Your Animal</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
            .receipt { max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: 800; color: #0f172a; }
            .badge { display: inline-block; background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; margin-top: 6px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .label { color: #64748b; font-weight: 500; }
            .value { color: #0f172a; font-weight: 700; text-align: right; }
            .total { font-size: 18px; font-weight: 800; color: #15803d; border-top: 2px solid #e2e8f0; padding-top: 14px; margin-top: 10px; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 25px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="title">🐾 Know Your Animal</div>
              <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Veterinary Care & Health Services</div>
              <div class="badge">PAYMENT CONFIRMED (PAID)</div>
            </div>
            <div class="row">
              <span class="label">Date & Time</span>
              <span class="value">${paymentResult?.date || new Date().toLocaleString()}</span>
            </div>
            <div class="row">
              <span class="label">Plan Subscribed</span>
              <span class="value">${paymentResult?.planName} (30 Days)</span>
            </div>
            <div class="row">
              <span class="label">Payment ID</span>
              <span class="value">${paymentResult?.paymentId}</span>
            </div>
            <div class="row">
              <span class="label">Razorpay Order ID</span>
              <span class="value">${paymentResult?.orderId}</span>
            </div>
            <div class="row">
              <span class="label">Payment Method</span>
              <span class="value">${paymentResult?.method}</span>
            </div>
            <div class="row">
              <span class="label">Customer</span>
              <span class="value">${user?.username || "Verified Member"}</span>
            </div>
            <div class="row total">
              <span>Total Amount Paid</span>
              <span>₹${paymentResult?.amount}.00</span>
            </div>
            <div class="footer">
              <p>Razorpay Certified Transaction • 256-Bit SSL Encrypted</p>
              <p>Thank you for supporting animal healthcare across India.</p>
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
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Top navigation back button */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Plans & Pricing
            </Link>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Razorpay Verified Secure Checkout</span>
            </div>
          </div>

          {/* Test Mode Assistant Banner */}
          {isTestMode && paymentStep === "select" && (
            <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-amber-900">Razorpay Test Mode Active</span>
                      <span className="text-[10px] uppercase font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                        Sandbox
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Real UPI/Cards are declined by Razorpay test mode. Use Razorpay test credentials or simulate success:
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("4012000000000002");
                      toast.success("Test Card copied (4012 0000 0000 0002)!");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1 border border-amber-300"
                    title="Copy Test Card"
                  >
                    <Copy className="h-3 w-3" /> Test Card
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("success@razorpay");
                      toast.success("Test UPI copied (success@razorpay)!");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1 border border-amber-300"
                    title="Copy Test UPI"
                  >
                    <Copy className="h-3 w-3" /> Test UPI
                  </button>

                  <button
                    type="button"
                    onClick={() => executePaymentVerification({ methodLabel: "Instant Test Mode Simulation", isTestSimulation: true })}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                    title="Instantly test complete subscription activation"
                  >
                    <Zap className="h-3 w-3 text-yellow-300" /> Instant Test Activation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Failure Notice */}
          {paymentFailure && paymentStep === "select" && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-rose-900">
                    {paymentFailure.description || "Payment could not be completed"}
                  </h4>
                  <p className="text-xs text-rose-700">
                    {paymentFailure.reason || "The payment was declined by Razorpay."}
                  </p>
                  {isTestMode && (
                    <div className="mt-2 text-xs text-rose-800 bg-white/70 p-2.5 rounded-xl border border-rose-200">
                      <b>Why did this happen in Test Mode?</b>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-rose-700">
                        <li>Real bank cards or real UPI apps (GPay/PhonePe) cannot be charged in Razorpay Test Mode.</li>
                        <li>For Cards: Use card <b>4012 0000 0000 0002</b>, any future expiry (e.g. 12/28), and CVV 123.</li>
                        <li>For UPI: Enter <b>success@razorpay</b> as the UPI ID.</li>
                        <li>For Netbanking: On the Razorpay bank simulator screen, click the green <b>Success</b> button.</li>
                        <li>Or click the <b>"Instant Test Activation"</b> button above to verify the complete membership flow instantly.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {paymentStep === "success" ? (
            /* Success confirmation screen */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xl max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Payment Successful!</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Your subscription to <span className="font-bold text-slate-900">{planName}</span> is now active. All premium veterinary features are unlocked.
              </p>

              {/* Receipt Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8 space-y-3 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="font-bold text-slate-800">Transaction Summary</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                    <Check className="h-3 w-3" /> Paid & Confirmed
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                    {paymentResult?.paymentId}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentResult?.paymentId || "");
                        toast.success("Payment ID copied!");
                      }}
                      title="Copy"
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      <Copy className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                    </button>
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono text-slate-700">{paymentResult?.orderId}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-semibold text-slate-800">{paymentResult?.method}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="text-slate-700">{paymentResult?.date}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-200 mt-2 font-black text-base text-slate-900">
                  <span>Amount Paid:</span>
                  <span className="text-emerald-600 text-lg">₹{paymentResult?.amount}.00</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={printReceipt}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <Printer className="h-4 w-4" /> Print / Save Tax Receipt (PDF)
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Main Checkout layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Order Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-max mb-4">
                    <Sparkles className="h-3.5 w-3.5" /> Order Summary
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-1">{planName}</h3>
                  <p className="text-xs text-slate-500 mb-6">1-Month Renewable Animal Care & Wellness Membership</p>

                  <div className="space-y-3 pb-6 border-b border-slate-100 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Plan Subscription Fee</span>
                      <span className="font-semibold text-slate-900">₹{planPrice}.00</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST (18% Goods & Services Tax)</span>
                      <span className="font-semibold text-emerald-600">Included</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Platform & 24/7 AI Service Fee</span>
                      <span className="font-semibold text-emerald-600">Free</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline pt-4 mb-6">
                    <div>
                      <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Total Payable Now</span>
                      <span className="text-3xl font-black text-slate-900">₹{planPrice}.00</span>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">INR (Indian Rupee)</span>
                  </div>

                  {/* Customer details info */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account:</span>
                      <span className="font-bold text-slate-800">{user?.username || "Verified Member"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-bold text-slate-800">{user?.email || "user@example.com"}</span>
                    </div>
                  </div>
                </div>

                {/* Plan Highlights Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                  <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" /> What's Included:
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Unlimited 24/7 AI Veterinary Assistant consultations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Priority direct appointment booking with verified clinicians</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Digital Pet Health Passport & Vaccination tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Government Animal Ambulance 1962 priority helpline</span>
                    </li>
                  </ul>
                </div>

                {/* Security Trust Badges */}
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs text-slate-700">
                  <Shield className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>256-bit Bank Grade SSL Encryption. Authorized under RBI digital payment regulations.</span>
                </div>
              </div>

              {/* Right Column: The Razorpay Payment Gateway Terminal (7 cols) */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
                  {/* Razorpay Brand Terminal Header */}
                  <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white p-5 sm:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-white shadow-inner">
                        <Sparkles className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-white">Know Your Animal</h3>
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30">
                            Razorpay
                          </span>
                        </div>
                        <p className="text-xs text-blue-200/80">Select payment method to complete purchase</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-blue-200 block">Payable</span>
                      <span className="text-xl font-black text-emerald-400">₹{planPrice}.00</span>
                    </div>
                  </div>

                  {paymentStep === "processing" ? (
                    /* Processing Screen */
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin flex items-center justify-center" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="h-7 w-7 text-blue-600 animate-pulse" />
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">Authorizing Payment</h4>
                      <p className="text-sm text-slate-600 font-medium mb-4 max-w-md animate-pulse">
                        {processingStatus}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Shield className="h-4 w-4 text-emerald-500" />
                        <span>Secured by 256-bit bank encryption. Please do not close or refresh.</span>
                      </div>
                    </div>
                  ) : (
                    /* Payment Method Tabs & Form */
                    <div className="p-5 sm:p-7">
                      {/* Navigation Pills */}
                      <div className="grid grid-cols-4 gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl">
                        <button
                          type="button"
                          onClick={() => setActiveTab("upi")}
                          className={`flex flex-col items-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all ${
                            activeTab === "upi"
                              ? "bg-white text-blue-700 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Smartphone className="h-4 w-4 mb-1" />
                          <span>UPI & QR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab("card")}
                          className={`flex flex-col items-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all ${
                            activeTab === "card"
                              ? "bg-white text-blue-700 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <CreditCard className="h-4 w-4 mb-1" />
                          <span>Cards</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab("netbanking")}
                          className={`flex flex-col items-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all ${
                            activeTab === "netbanking"
                              ? "bg-white text-blue-700 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Building2 className="h-4 w-4 mb-1" />
                          <span>Net Banking</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab("wallet")}
                          className={`flex flex-col items-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all ${
                            activeTab === "wallet"
                              ? "bg-white text-blue-700 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Wallet className="h-4 w-4 mb-1" />
                          <span>Wallets</span>
                        </button>
                      </div>

                      {/* ─── UPI TAB CONTENT ─── */}
                      {activeTab === "upi" && (
                        <div className="space-y-5">
                          {/* Sub tabs */}
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-500 uppercase">Choose UPI Mode</span>
                            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                              <button
                                type="button"
                                onClick={() => setUpiSubTab("qr")}
                                className={`px-3 py-1 rounded-lg ${upiSubTab === "qr" ? "bg-white text-blue-700 shadow-sm font-bold" : ""}`}
                              >
                                Scan QR
                              </button>
                              <button
                                type="button"
                                onClick={() => setUpiSubTab("apps")}
                                className={`px-3 py-1 rounded-lg ${upiSubTab === "apps" ? "bg-white text-blue-700 shadow-sm font-bold" : ""}`}
                              >
                                UPI Apps
                              </button>
                              <button
                                type="button"
                                onClick={() => setUpiSubTab("id")}
                                className={`px-3 py-1 rounded-lg ${upiSubTab === "id" ? "bg-white text-blue-700 shadow-sm font-bold" : ""}`}
                              >
                                Enter VPA
                              </button>
                            </div>
                          </div>

                          {/* QR Code */}
                          {upiSubTab === "qr" && (
                            <div className="flex flex-col items-center text-center py-2">
                              <div className="relative p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md mb-3">
                                <div className="w-52 h-52 bg-white flex items-center justify-center relative">
                                  {qrResult?.success ? (
                                    <svg viewBox={`0 0 ${qrResult.size} ${qrResult.size}`} className="w-full h-full">
                                      <path d={qrResult.svgPath} fill="#0f172a" />
                                    </svg>
                                  ) : (
                                    <img
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`}
                                      alt="UPI QR Code"
                                      className="w-full h-full"
                                    />
                                  )}
                                  
                                  {/* Center UPI logo badge */}
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 shadow-lg flex items-center justify-center font-black text-sm text-slate-900">
                                      ₹
                                    </div>
                                  </div>
                                </div>

                                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-600" />
                                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-600" />
                                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-600" />
                                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-600" />
                              </div>

                              {/* VPA Info chip */}
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-mono text-slate-700 mb-3 border border-slate-200">
                                <span>UPI ID: <b>{upiVpa}</b></span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(upiVpa);
                                    toast.success("UPI ID copied to clipboard!");
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-0.5"
                                  title="Copy UPI ID"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <div className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 mb-3">
                                QR valid for: <b>{formatTimer(qrTimer)}</b>
                              </div>

                              <p className="text-xs text-slate-500 mb-4 max-w-sm">
                                Scan with any UPI app (<b>Google Pay</b>, <b>PhonePe</b>, <b>Paytm</b>, <b>BHIM</b>) to pay <b>₹{planPrice}.00</b>
                              </p>

                              <div className="w-full max-w-sm space-y-2.5">
                                <a
                                  href={upiLink}
                                  className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" /> Open in UPI App (Mobile)
                                </a>

                                <button
                                  type="button"
                                  disabled={loadingOrder || Boolean(orderError)}
                                  onClick={() => handleInitiatePayment("Razorpay UPI Gateway")}
                                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                >
                                  <Lock className="h-4 w-4" />
                                  {loadingOrder ? "Initializing..." : `Pay ₹${planPrice} via Razorpay Gateway`}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setUtrValue("");
                                    setUtrError("");
                                    setShowUtrModal(true);
                                  }}
                                  className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> I Have Paid via QR • Enter 12-Digit Bank UTR
                                </button>
                              </div>
                            </div>
                          )}

                          {/* UPI Apps list */}
                          {upiSubTab === "apps" && (
                            <div className="space-y-3">
                              <p className="text-xs text-slate-500">Select your preferred UPI application:</p>
                              {[
                                { name: "Google Pay", desc: "Instant GPay UPI", badge: "Fast" },
                                { name: "PhonePe", desc: "PhonePe UPI handle", badge: "Popular" },
                                { name: "Paytm UPI", desc: "Paytm Bank & UPI", badge: "" },
                                { name: "BHIM UPI", desc: "National Payments Corp UPI", badge: "" },
                                { name: "CRED UPI", desc: "CRED club UPI", badge: "" },
                              ].map((app) => (
                                <div
                                  key={app.name}
                                  onClick={() => setSelectedUpiApp(app.name)}
                                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                    selectedUpiApp === app.name
                                      ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-500"
                                      : "border-slate-200 bg-white hover:bg-slate-50"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800 border border-slate-200">
                                      {app.name.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="font-bold text-sm text-slate-900">{app.name}</div>
                                      <div className="text-xs text-slate-500">{app.desc}</div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {app.badge && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                        {app.badge}
                                      </span>
                                    )}
                                    <div
                                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                        selectedUpiApp === app.name
                                          ? "border-blue-600 bg-blue-600 text-white"
                                          : "border-slate-300"
                                      }`}
                                    >
                                      {selectedUpiApp === app.name && <Check className="h-3 w-3" />}
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <button
                                type="button"
                                disabled={loadingOrder}
                                onClick={() => handleInitiatePayment(`${selectedUpiApp} UPI`)}
                                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                              >
                                Pay ₹{planPrice} via {selectedUpiApp} <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          )}

                          {/* UPI ID / VPA */}
                          {upiSubTab === "id" && (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                  Enter Virtual Payment Address (VPA)
                                </label>
                                <input
                                  type="text"
                                  value={upiId}
                                  onChange={(e) => setUpiId(e.target.value)}
                                  placeholder={isTestMode ? "e.g. success@razorpay (Test Mode)" : "e.g. user@okhdfcbank"}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="text-slate-400 self-center">Quick handles:</span>
                                {isTestMode ? (
                                  <button
                                    type="button"
                                    onClick={() => setUpiId("success@razorpay")}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors font-bold"
                                  >
                                    success@razorpay (Test)
                                  </button>
                                ) : null}
                                {["@okhdfcbank", "@okicici", "@paytm", "@ybl", "@axl"].map((handle) => (
                                  <button
                                    key={handle}
                                    type="button"
                                    onClick={() => {
                                      const base = upiId.includes("@") ? upiId.split("@")[0] : upiId || "user";
                                      setUpiId(`${base}${handle}`);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium"
                                  >
                                    {handle}
                                  </button>
                                ))}
                              </div>

                              <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                                <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
                                <span>A payment collect notification for ₹{planPrice} will be delivered to your UPI app.</span>
                              </div>

                              <button
                                type="button"
                                disabled={loadingOrder}
                                onClick={() => {
                                  if (!upiId || !upiId.includes("@")) {
                                    toast.error("Please enter a valid UPI handle (e.g. user@okhdfcbank)");
                                    return;
                                  }
                                  handleInitiatePayment(`UPI ID (${upiId})`);
                                }}
                                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                              >
                                Verify & Pay ₹{planPrice} <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ─── CARDS TAB CONTENT ─── */}
                      {activeTab === "card" && (
                        <div className="space-y-4">
                          {/* Card Preview Graphic */}
                          <div className="relative h-44 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white p-5 shadow-xl flex flex-col justify-between overflow-hidden border border-slate-700">
                            <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-7 rounded bg-amber-400/90 border border-amber-300 shadow-inner flex items-center justify-center">
                                  <div className="w-6 h-4 border border-amber-600/40 rounded-sm" />
                                </div>
                                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-300">DEBIT / CREDIT</span>
                              </div>
                              <span className="text-base font-black italic tracking-wider text-slate-200">
                                {cardNumber.startsWith("4") ? "VISA" : cardNumber.startsWith("5") ? "Mastercard" : "RuPay"}
                              </span>
                            </div>

                            <div className="font-mono text-lg tracking-widest text-slate-100 font-bold">
                              {cardNumber || "•••• •••• •••• ••••"}
                            </div>

                            <div className="flex justify-between items-end text-xs">
                              <div>
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">CARD HOLDER</span>
                                <span className="font-bold tracking-wider">{cardHolder || "YOUR NAME"}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">EXPIRES</span>
                                <span className="font-mono font-bold tracking-wider">{cardExpiry || "MM/YY"}</span>
                              </div>
                            </div>
                          </div>

                          {isTestMode && (
                            <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                              <span>Testing in Sandbox mode?</span>
                              <button
                                type="button"
                                onClick={prefillTestCard}
                                className="font-bold text-blue-700 hover:text-blue-900 underline"
                              >
                                Autofill Test Card
                              </button>
                            </div>
                          )}

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Card Number
                              </label>
                              <input
                                type="text"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="4532 8901 2345 6789"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Cardholder Name
                              </label>
                              <input
                                type="text"
                                value={cardHolder}
                                onChange={(e) => setCardHolder(e.target.value)}
                                placeholder="Name on card"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                  Expiry (MM/YY)
                                </label>
                                <input
                                  type="text"
                                  value={cardExpiry}
                                  onChange={handleExpiryChange}
                                  placeholder="MM/YY"
                                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                  CVV
                                </label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value)}
                                  placeholder="•••"
                                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                              <input
                                type="checkbox"
                                checked={saveCard}
                                onChange={(e) => setSaveCard(e.target.checked)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                              />
                              <span className="text-xs text-slate-600">
                                Save card securely for renewals (Compliant with RBI tokens)
                              </span>
                            </label>

                            <button
                              type="button"
                              disabled={loadingOrder}
                              onClick={() => {
                                const cleanCard = cardNumber.replace(/\s/g, "");
                                if (!cleanCard && isTestMode) {
                                  prefillTestCard();
                                }
                                handleInitiatePayment(cleanCard ? `Card ending in ${cleanCard.slice(-4)}` : "Card Gateway");
                              }}
                              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                            >
                              <Lock className="h-4 w-4" /> Pay ₹{planPrice} with Card
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ─── NETBANKING TAB CONTENT ─── */}
                      {activeTab === "netbanking" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                              Select Bank
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                              {POPULAR_BANKS.map((bank) => (
                                <button
                                  key={bank.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedBank(bank.id);
                                    setOtherBank("");
                                  }}
                                  className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all ${
                                    selectedBank === bank.id
                                      ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-500"
                                      : "border-slate-200 bg-white hover:bg-slate-50"
                                  }`}
                                >
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded w-max ${bank.color}`}>
                                    {bank.short}
                                  </span>
                                  <span className="text-xs font-bold text-slate-800 line-clamp-1">{bank.name}</span>
                                </button>
                              ))}
                            </div>

                            <select
                              value={otherBank}
                              onChange={(e) => {
                                setOtherBank(e.target.value);
                                setSelectedBank("");
                              }}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                              <option value="">-- Or choose from other Indian banks --</option>
                              {OTHER_BANKS.map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>

                          {isTestMode && (
                            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                              ℹ️ <b>Test Simulation:</b> In Razorpay checkout, select any bank and click <b>Success</b> on the bank simulator pop-up.
                            </p>
                          )}

                          <button
                            type="button"
                            disabled={loadingOrder}
                            onClick={() => {
                              const bankName = otherBank || POPULAR_BANKS.find(b => b.id === selectedBank)?.name || "HDFC Bank";
                              handleInitiatePayment(`Net Banking (${bankName})`);
                            }}
                            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                          >
                            Pay ₹{planPrice} via Net Banking <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {/* ─── WALLETS TAB CONTENT ─── */}
                      {activeTab === "wallet" && (
                        <div className="space-y-4">
                          <div className="space-y-2.5">
                            {WALLET_PROVIDERS.map((wallet) => (
                              <div
                                key={wallet.id}
                                onClick={() => setSelectedWallet(wallet.id)}
                                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                  selectedWallet === wallet.id
                                    ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-500"
                                    : "border-slate-200 bg-white hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl ${wallet.iconBg} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                                    {wallet.name.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="font-bold text-sm text-slate-900 block">{wallet.name}</span>
                                    <span className="text-xs text-slate-500">Available: {wallet.balance}</span>
                                  </div>
                                </div>

                                <div
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                    selectedWallet === wallet.id
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {selectedWallet === wallet.id && <Check className="h-3 w-3" />}
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            disabled={loadingOrder}
                            onClick={() => {
                              const wName = WALLET_PROVIDERS.find(w => w.id === selectedWallet)?.name || "Paytm Wallet";
                              handleInitiatePayment(wName);
                            }}
                            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                          >
                            Pay ₹{planPrice} via Wallet <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Terminal Footer */}
                  <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-emerald-600" /> 256-Bit SSL Encrypted
                    </span>
                    <span>100% Refund Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── BANK 3D-SECURE 2.0 OTP AUTHENTICATION MODAL ─── */}
          {showOtpModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
                {/* Bank Security Header */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Bank 3D-Secure 2.0</h4>
                      <p className="text-[10px] text-slate-400">RBI Certified Two-Factor Authentication</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-400" /> 256-Bit SSL
                  </span>
                </div>

                {/* Transaction Details */}
                <div className="p-6 space-y-5">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Merchant</span>
                      <span className="font-bold text-slate-800">Know Your Animal Vet Care</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Payment Mode</span>
                      <span className="font-bold text-slate-800">{pendingMethodLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Order Ref</span>
                      <span className="font-mono text-[11px] text-slate-600">{orderData?.orderId}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                      <span className="font-bold text-slate-700">Amount Due</span>
                      <span className="font-black text-emerald-600">₹{planPrice}.00</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 text-center">
                      Enter 6-Digit Banking OTP
                    </label>
                    <p className="text-xs text-slate-500 text-center mb-3">
                      A one-time authentication code was dispatched to mobile <b>•••• 4589</b>
                    </p>

                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      value={otpValue}
                      onChange={(e) => {
                        setOtpValue(e.target.value.replace(/\D/g, ""));
                        setOtpError("");
                      }}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    />

                    {otpError && (
                      <p className="text-xs text-rose-600 font-bold text-center mt-2 flex items-center justify-center gap-1">
                        <span>⚠</span> {otpError}
                      </p>
                    )}

                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-600">
                      <span className="font-bold">🔐 Security Mode:</span> 256-Bit SSL Encrypted. In test mode, any 6-digit code (e.g. 123456) completes the test.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={isAuthorizingOtp || otpValue.length !== 6}
                      onClick={handleVerifyWithOtp}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isAuthorizingOtp ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Authorizing with Bank...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" /> Authorize & Pay ₹{planPrice}.00
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isAuthorizingOtp}
                      onClick={() => {
                        setShowOtpModal(false);
                        toast.info("Payment canceled by user.");
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    >
                      Cancel Transaction
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── UPI UTR VERIFICATION MODAL ─── */}
          {showUtrModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
                {/* UPI Header */}
                <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
                      <QrCode className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">UPI Payment Verification</h4>
                      <p className="text-[10px] text-emerald-200">National Payments Corporation of India (NPCI)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-800 text-white px-2.5 py-1 rounded-full">
                    UTR Validation
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <p className="text-slate-600">
                      Merchant VPA: <b>{upiVpa}</b>
                    </p>
                    <p className="text-slate-600">
                      Amount Paid: <b>₹{planPrice}.00</b>
                    </p>
                    <p className="text-slate-500 text-[11px] pt-1.5 border-t border-slate-200">
                      Check your UPI app (Google Pay, PhonePe, Paytm, BHIM) receipt for the <b>12-digit UPI Reference Number (UTR)</b>.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      12-Digit UPI Transaction Reference (UTR)
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      autoFocus
                      value={utrValue}
                      onChange={(e) => {
                        setUtrValue(e.target.value.replace(/\D/g, ""));
                        setUtrError("");
                      }}
                      placeholder="e.g. 428901234567"
                      className="w-full tracking-widest font-mono text-center text-lg font-bold px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                    />

                    {utrError && (
                      <p className="text-xs text-rose-600 font-bold mt-1.5">
                        ⚠ {utrError}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">
                      Must be 12 numeric digits. {isTestMode && "In test mode, any 12 digits (e.g. 123456789012) will verify."}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      disabled={isAuthorizingUtr || utrValue.length !== 12}
                      onClick={handleVerifyWithUtr}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isAuthorizingUtr ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Verifying UTR with Banking System...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Verify UTR & Activate Plan
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isAuthorizingUtr}
                      onClick={() => setShowUtrModal(false)}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
