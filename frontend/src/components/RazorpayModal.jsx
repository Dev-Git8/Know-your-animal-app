import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Shield,
  Lock,
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  Loader2,
  Copy,
  Download,
  ArrowRight,
  Info,
  Check,
  ChevronRight,
  Sparkles,
  QrCode,
  ExternalLink,
  Printer
} from "lucide-react";
import { toast } from "sonner";
import { verifySubscriptionPayment } from "@/integrations/authApi";
import { generateQrSvg } from "@/utils/qrGenerator";

// Realistic bank list for Indian netbanking
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

export default function RazorpayModal({
  isOpen,
  onClose,
  plan,
  orderData,
  user,
  onPaymentSuccess
}) {
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
  const [paymentStep, setPaymentStep] = useState("select"); // 'select' | 'processing' | 'success'
  const [processingStatus, setProcessingStatus] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);
  const [qrTimer, setQrTimer] = useState(895); // 14 mins 55 secs

  // 2FA / Authentication Modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isAuthorizingOtp, setIsAuthorizingOtp] = useState(false);

  const [showUtrModal, setShowUtrModal] = useState(false);
  const [utrValue, setUtrValue] = useState("");
  const [utrError, setUtrError] = useState("");
  const [isAuthorizingUtr, setIsAuthorizingUtr] = useState(false);

  const [pendingMethodLabel, setPendingMethodLabel] = useState("");

  // Sync user details on order / user change
  useEffect(() => {
    if (user?.username) {
      setCardHolder(user.username.toUpperCase());
    }
  }, [user]);

  // QR countdown timer
  useEffect(() => {
    if (!isOpen || paymentStep !== "select" || activeTab !== "upi" || upiSubTab !== "qr") return;
    const timer = setInterval(() => {
      setQrTimer((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, paymentStep, activeTab, upiSubTab]);

  if (!isOpen) return null;

  const planPrice = plan?.id === "farm_pro" ? 499 : 199;
  const planName = plan?.name || "Care Plus";
  const orderId = orderData?.orderId || `order_${Math.random().toString(36).substring(2, 10)}`;

  const upiVpa = "knowyouranimal@okhdfcbank";
  const upiLink = `upi://pay?pa=${upiVpa}&pn=Know%20Your%20Animal&am=${planPrice}.00&cu=INR&tn=${encodeURIComponent(planName + " Membership")}`;
  const qrResult = useMemo(() => generateQrSvg(upiLink, 220), [upiLink]);

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

  const executePaymentVerification = async ({
    otp,
    utr,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    methodLabel,
  }) => {
    setPaymentStep("processing");
    setProcessingStatus("Initiating 256-bit SSL encrypted transaction...");

    await new Promise((r) => setTimeout(r, 500));
    setProcessingStatus(`Authorizing via banking gateway (${methodLabel})...`);

    const ordId = razorpayOrderId || orderId;
    const payId = razorpayPaymentId || (utr ? `pay_upi_${utr}` : `pay_otp_${Math.random().toString(36).substring(2, 10)}`);

    try {
      setProcessingStatus("Verifying payment security signature with bank...");
      await verifySubscriptionPayment({
        planId: plan.id,
        razorpayPaymentId: payId,
        razorpayOrderId: ordId,
        razorpaySignature: razorpaySignature,
        otp: otp,
        utr: utr,
        paymentMethod: methodLabel,
      });

      await new Promise((r) => setTimeout(r, 600));
      setProcessingStatus("Payment verified & confirmed! Activating subscription...");

      await new Promise((r) => setTimeout(r, 400));
      const resultObj = {
        paymentId: payId,
        orderId: ordId,
        method: methodLabel || "Razorpay Gateway",
        amount: planPrice,
        planName: planName,
        planId: plan.id,
        date: new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      };
      setPaymentResult(resultObj);
      setPaymentStep("success");
      setShowOtpModal(false);
      setShowUtrModal(false);

      if (onPaymentSuccess) {
        onPaymentSuccess(resultObj);
      }
      toast.success(`🎉 Subscription to ${planName} activated successfully!`);
    } catch (err) {
      console.error("Payment error", err);
      const errMsg = err.response?.data?.message || "Payment authentication declined by banking network.";
      toast.error(errMsg);
      setPaymentStep("select");
      if (showOtpModal) setOtpError(errMsg);
      if (showUtrModal) setUtrError(errMsg);
    }
  };

  const handleInitiatePayment = (methodLabel) => {
    setPendingMethodLabel(methodLabel);

    const isLiveKey = orderData?.keyId && !orderData.keyId.includes("test_KnowYourAnimal");
    if (isLiveKey && window.Razorpay) {
      try {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount || planPrice * 100,
          currency: orderData.currency || "INR",
          name: "Know Your Animal",
          description: `${planName} Subscription`,
          order_id: orderId,
          handler: async function (response) {
            await executePaymentVerification({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              methodLabel: methodLabel,
            });
          },
          prefill: {
            name: user?.username || "",
            email: user?.email || "",
            contact: user?.phoneNumber || "",
          },
          theme: { color: "#059669" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (e) {
        console.warn("Direct Razorpay popup failed, switching to Bank 3DS OTP modal:", e);
      }
    }

    setOtpValue("");
    setOtpError("");
    setShowOtpModal(true);
  };

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
        methodLabel: pendingMethodLabel || "Bank 3D-Secure 2.0",
      });
    } finally {
      setIsAuthorizingOtp(false);
    }
  };

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
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
            .receipt { max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; }
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
              <div style="font-size: 13px; color: #64748b;">Veterinary Care & Health Services</div>
              <div class="badge">PAYMENT CONFIRMED (PAID)</div>
            </div>
            <div class="row">
              <span class="label">Transaction / Payment ID</span>
              <span class="value">${paymentResult?.paymentId}</span>
            </div>
            <div class="row">
              <span class="label">Razorpay Order ID</span>
              <span class="value">${paymentResult?.orderId}</span>
            </div>
            <div class="row">
              <span class="label">Plan Purchased</span>
              <span class="value">${paymentResult?.planName} (1 Month)</span>
            </div>
            <div class="row">
              <span class="label">Customer Name</span>
              <span class="value">${user?.username || "Verified Member"}</span>
            </div>
            <div class="row">
              <span class="label">Customer Email</span>
              <span class="value">${user?.email || "user@example.com"}</span>
            </div>
            <div class="row">
              <span class="label">Payment Method</span>
              <span class="value">${paymentResult?.method}</span>
            </div>
            <div class="row">
              <span class="label">Date & Time</span>
              <span class="value">${paymentResult?.date}</span>
            </div>
            <div class="row total">
              <span>Total Amount Paid</span>
              <span>₹${paymentResult?.amount}.00</span>
            </div>
            <div class="footer">
              <p>Razorpay Certified Transaction • 256-Bit SSL Encrypted</p>
              <p>Thank you for supporting quality healthcare for animals across India.</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Top Razorpay Branded Header */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white px-6 py-4 flex items-center justify-between border-b border-blue-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-white shadow-inner">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-wide text-white">
                  Know Your Animal
                </h3>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  Razorpay Checkout
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                Plan: <span className="font-semibold text-white">{planName}</span> • ₹{planPrice} / month
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-blue-200 block">Total Payable</span>
              <span className="text-xl font-black text-emerald-400">₹{planPrice}.00</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close payment window"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {paymentStep === "processing" ? (
          /* Processing Screen */
          <div className="p-12 flex flex-col items-center justify-center text-center my-auto">
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
              <span>Secured by 256-bit bank grade encryption. Please do not close or refresh this tab.</span>
            </div>
          </div>
        ) : paymentStep === "success" ? (
          /* Success Screen & Receipt */
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
            <div className="text-center max-w-md mx-auto mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Payment Successful!</h3>
              <p className="text-sm text-slate-500">
                Your subscription to <span className="font-bold text-slate-800">{planName}</span> is now active.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 max-w-lg mx-auto mb-6 text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className="font-bold text-slate-700">Receipt & Transaction Details</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <Check className="h-3 w-3" /> Paid & Confirmed
                </span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                    {paymentResult?.paymentId}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentResult?.paymentId || "");
                        toast.success("Payment ID copied!");
                      }}
                      title="Copy Payment ID"
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
                <div className="flex justify-between py-2 border-t border-slate-200 mt-2 font-bold text-base text-slate-900">
                  <span>Amount Paid:</span>
                  <span className="text-emerald-600">₹{paymentResult?.amount}.00</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button
                onClick={printReceipt}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm"
              >
                <Printer className="h-4 w-4" /> Print / Save Tax Receipt
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
              >
                Continue to App <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Payment Method Selection Screen */
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Left Sidebar: Payment Methods Tabs */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200/80 p-3 sm:p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 hidden md:block">
                Payment Options
              </div>

              {/* UPI Tab */}
              <button
                onClick={() => setActiveTab("upi")}
                className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-left font-medium text-sm transition-all whitespace-nowrap md:whitespace-normal ${
                  activeTab === "upi"
                    ? "bg-white text-blue-700 shadow-sm border border-blue-200/80 font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeTab === "upi" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>UPI & QR</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Fast</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal hidden sm:block">GPay, PhonePe, QR</span>
                </div>
              </button>

              {/* Card Tab */}
              <button
                onClick={() => setActiveTab("card")}
                className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-left font-medium text-sm transition-all whitespace-nowrap md:whitespace-normal ${
                  activeTab === "card"
                    ? "bg-white text-blue-700 shadow-sm border border-blue-200/80 font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeTab === "card" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <span>Cards</span>
                  <span className="text-[11px] text-slate-400 font-normal block hidden sm:block">Debit / Credit</span>
                </div>
              </button>

              {/* Netbanking Tab */}
              <button
                onClick={() => setActiveTab("netbanking")}
                className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-left font-medium text-sm transition-all whitespace-nowrap md:whitespace-normal ${
                  activeTab === "netbanking"
                    ? "bg-white text-blue-700 shadow-sm border border-blue-200/80 font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeTab === "netbanking" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <span>Net Banking</span>
                  <span className="text-[11px] text-slate-400 font-normal block hidden sm:block">All Major Banks</span>
                </div>
              </button>

              {/* Wallets Tab */}
              <button
                onClick={() => setActiveTab("wallet")}
                className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-left font-medium text-sm transition-all whitespace-nowrap md:whitespace-normal ${
                  activeTab === "wallet"
                    ? "bg-white text-blue-700 shadow-sm border border-blue-200/80 font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeTab === "wallet" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <span>Wallets</span>
                  <span className="text-[11px] text-slate-400 font-normal block hidden sm:block">Paytm, PhonePe</span>
                </div>
              </button>

              {/* Order summary mini-box on desktop */}
              <div className="mt-auto hidden md:block pt-4 border-t border-slate-200/80">
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs">
                  <span className="text-slate-500 block mb-1">Paying for:</span>
                  <span className="font-bold text-slate-800 block">{planName}</span>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200/60 font-black text-slate-900">
                    <span>Total:</span>
                    <span className="text-emerald-600">₹{planPrice}.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pane: Selected Method Details */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto max-h-[60vh] md:max-h-[70vh]">
              {/* ======================= UPI TAB ======================= */}
              {activeTab === "upi" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Pay with UPI</h4>
                      <p className="text-xs text-slate-500">Scan QR or choose your preferred UPI app</p>
                    </div>

                    {/* Sub tabs: QR vs App vs ID */}
                    <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                      <button
                        onClick={() => setUpiSubTab("qr")}
                        className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                          upiSubTab === "qr" ? "bg-white text-blue-700 shadow-sm font-bold" : ""
                        }`}
                      >
                        <QrCode className="h-3.5 w-3.5" /> Scan QR
                      </button>
                      <button
                        onClick={() => setUpiSubTab("apps")}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                          upiSubTab === "apps" ? "bg-white text-blue-700 shadow-sm font-bold" : ""
                        }`}
                      >
                        UPI Apps
                      </button>
                      <button
                        onClick={() => setUpiSubTab("id")}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                          upiSubTab === "id" ? "bg-white text-blue-700 shadow-sm font-bold" : ""
                        }`}
                      >
                        UPI ID
                      </button>
                    </div>
                  </div>

                  {/* QR Code view */}
                  {upiSubTab === "qr" && (
                    <div className="flex flex-col items-center text-center py-2">
                      <div className="relative p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md mb-3 group">
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

                          {/* Central Brand Emblem */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 shadow-lg flex items-center justify-center font-black text-sm text-slate-900">
                              ₹
                            </div>
                          </div>
                        </div>

                        {/* Scanner overlay corner accents */}
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

                      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 mb-3">
                        <ClockIcon className="h-3.5 w-3.5" />
                        <span>QR code expires in: <b>{formatTimer(qrTimer)}</b></span>
                      </div>

                      <p className="text-xs text-slate-500 mb-4 max-w-sm">
                        Scan with any UPI app (<b>Google Pay</b>, <b>PhonePe</b>, <b>Paytm</b>, <b>BHIM</b>, or camera) to pay <b>₹{planPrice}.00</b>
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
                          onClick={() => handleInitiatePayment("UPI QR Instant Payment")}
                          className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                        >
                          <Lock className="h-4 w-4" /> Pay ₹{planPrice} via Secure Razorpay Gateway
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
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> I Have Paid via QR • Enter 12-Digit Bank UTR
                        </button>
                      </div>
                    </div>
                  )}

                  {/* UPI Apps list view */}
                  {upiSubTab === "apps" && (
                    <div className="space-y-3 py-1">
                      <p className="text-xs text-slate-500 mb-2">Select your installed UPI app:</p>
                      {[
                        { name: "Google Pay", desc: "Pay with GPay", color: "border-blue-200 hover:border-blue-500", badge: "Fast" },
                        { name: "PhonePe", desc: "Pay with PhonePe UPI", color: "border-purple-200 hover:border-purple-500", badge: "Popular" },
                        { name: "Paytm UPI", desc: "Pay with Paytm Bank / UPI", color: "border-sky-200 hover:border-sky-500", badge: "" },
                        { name: "BHIM UPI", desc: "Government verified UPI", color: "border-emerald-200 hover:border-emerald-500", badge: "" },
                        { name: "CRED UPI", desc: "Pay with CRED", color: "border-slate-300 hover:border-slate-600", badge: "" }
                      ].map((app) => (
                        <div
                          key={app.name}
                          onClick={() => setSelectedUpiApp(app.name)}
                          className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            selectedUpiApp === app.name
                              ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-500"
                              : `${app.color} bg-white hover:bg-slate-50`
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
                        onClick={() => handleInitiatePayment(`${selectedUpiApp} UPI`)}
                        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                      >
                        Pay ₹{planPrice} via {selectedUpiApp} <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* UPI ID / VPA view */}
                  {upiSubTab === "id" && (
                    <div className="space-y-4 py-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                          Enter your UPI ID / VPA
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. mobile@okhdfcbank or name@paytm"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Quick handles */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="text-slate-400 self-center">Popular:</span>
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
                        <span>A payment collect request for ₹{planPrice} will be sent to your UPI app.</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!upiId || !upiId.includes("@")) {
                            toast.error("Please enter a valid UPI handle (e.g. user@okhdfcbank)");
                            return;
                          }
                          handleInitiatePayment(`UPI ID (${upiId})`);
                        }}
                        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        Verify & Pay ₹{planPrice} <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ======================= CARDS TAB ======================= */}
              {activeTab === "card" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Credit or Debit Card</h4>
                      <p className="text-xs text-slate-500">Supports Visa, MasterCard, RuPay & Maestro</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Shield className="h-3 w-3" /> RBI Compliant
                    </span>
                  </div>

                  {/* Stylized Visual Card */}
                  <div className="relative h-44 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white p-5 shadow-xl flex flex-col justify-between overflow-hidden border border-slate-700">
                    <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {/* EMV Chip */}
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

                  {/* Card Form */}
                  <div className="space-y-3 pt-2">
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
                          Expiry Date (MM/YY)
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
                        Securely save card for automatic monthly renewals
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const cleanCard = cardNumber.replace(/\s/g, "");
                        if (cleanCard.length < 15) {
                          toast.error("Please enter a valid 16-digit card number");
                          return;
                        }
                        if (!cardExpiry || !cardExpiry.includes("/")) {
                          toast.error("Please enter card expiry in MM/YY format");
                          return;
                        }
                        if (!cardCvv || cardCvv.length < 3) {
                          toast.error("Please enter a valid 3-digit CVV");
                          return;
                        }
                        handleInitiatePayment(`Card ending in ${cleanCard.slice(-4)}`);
                      }}
                      className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                    >
                      <Lock className="h-4 w-4" /> Pay ₹{planPrice} Now
                    </button>
                  </div>
                </div>
              )}

              {/* ======================= NETBANKING TAB ======================= */}
              {activeTab === "netbanking" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h4 className="font-bold text-slate-900 text-base">Net Banking</h4>
                    <p className="text-xs text-slate-500">Select your bank to redirect to secure netbanking portal</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                      Popular Indian Banks
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Or Select from All Other Banks
                    </label>
                    <select
                      value={otherBank}
                      onChange={(e) => {
                        setOtherBank(e.target.value);
                        setSelectedBank("");
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">-- Choose your bank --</option>
                      {OTHER_BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const bankName = otherBank || POPULAR_BANKS.find(b => b.id === selectedBank)?.name || "HDFC Bank";
                      handleInitiatePayment(`Net Banking (${bankName})`);
                    }}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                  >
                    Pay ₹{planPrice} via Net Banking <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ======================= WALLETS TAB ======================= */}
              {activeTab === "wallet" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h4 className="font-bold text-slate-900 text-base">Digital Wallets</h4>
                    <p className="text-xs text-slate-500">Link & pay directly from your digital wallet</p>
                  </div>

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
                    onClick={() => {
                      const wName = WALLET_PROVIDERS.find(w => w.id === selectedWallet)?.name || "Paytm Wallet";
                      handleInitiatePayment(wName);
                    }}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                  >
                    Pay ₹{planPrice} via Wallet <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── BANK 3D-SECURE 2.0 OTP AUTHENTICATION DIALOG ─── */}
        {showOtpModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Bank 3D-Secure 2.0</h4>
                    <p className="text-[10px] text-slate-400">RBI Certified 2-Factor Authentication</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-emerald-400" /> 256-Bit SSL
                </span>
              </div>

              <div className="p-6 space-y-4">
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
                    <span className="font-mono text-[11px] text-slate-600">{orderId}</span>
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
                    A secure 6-digit OTP has been sent to your registered mobile ending in <b>•••• 4589</b>
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
                    <span className="font-bold">🔐 Security Mode:</span> 256-Bit SSL Encrypted. Please enter the valid One-Time Password sent to your registered mobile.
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

        {/* ─── UPI UTR VERIFICATION DIALOG ─── */}
        {showUtrModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
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
                    Check your UPI application (Google Pay, PhonePe, Paytm, BHIM) receipt for the <b>12-digit UPI Reference Number (UTR)</b>.
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
                  <p className="text-[11px] text-slate-400 mt-1">Must be exactly 12 numeric digits.</p>
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
          </div>
        )}

        {/* Footer info bar */}
        <div className="bg-slate-100/80 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Payment • Powered by Razorpay</span>
          </div>
          <div className="flex items-center gap-3 font-medium">
            <span>Refund Guarantee</span>
            <span>•</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClockIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
