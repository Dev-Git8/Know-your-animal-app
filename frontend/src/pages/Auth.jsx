import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowLeft, Phone, KeyRound, ShieldCheck, UserCheck, Stethoscope } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { forgotPassword } from "@/integrations/authApi";
import { toast } from "sonner";

const Auth = () => {
  const [role, setRole] = useState("user"); // "user", "doctor", "admin"
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState("email"); // "email" or "phone"
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "", otp: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { user, login, adminLogin, doctorLogin, register, loginMobile, sendOtp } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin/dashboard", { replace: true });
      else if (user.role === "doctor") navigate("/doctor/dashboard", { replace: true });
      else navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSendOtp = async () => {
    if (!formData.phone) {
      setError("Please enter your phone number");
      return;
    }
    setIsSubmitting(true);
    try {
      await sendOtp(formData.phone);
      setShowOtpInput(true);
      toast.success("OTP sent successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email first");
      return;
    }
    try {
      const res = await forgotPassword(formData.email);
      toast.success("Password reset link sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isLogin) {
        if (loginMethod === "phone" && role !== "admin") {
          await loginMobile({ phoneNumber: formData.phone, otp: formData.otp });
        } else {
          if (role === "admin") {
            await adminLogin({ email: formData.email, password: formData.password });
          } else if (role === "doctor") {
            await doctorLogin({ email: formData.email, password: formData.password });
          } else {
            await login({ email: formData.email, password: formData.password });
          }
        }
      } else {
        await register({
          username: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: role,
        });
      }
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleConfig = {
    user: { title: "Pet Owner", icon: <UserCheck className="h-6 w-6" />, color: "primary" },
    doctor: { title: "Veterinary Expert", icon: <Stethoscope className="h-6 w-6" />, color: "indigo-600" },
    admin: { title: "Administrator", icon: <ShieldCheck className="h-6 w-6" />, color: "slate-900" }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 relative overflow-hidden font-inter">
      {/* Decorative Blur Elements */}
      <div className={`absolute top-0 left-0 w-80 h-80 bg-${roleConfig[role].color}/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl`} />
      <div className={`absolute bottom-0 right-0 w-96 h-96 bg-${roleConfig[role].color}/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl`} />
      
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white/40">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-8 text-sm font-bold">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          {/* Role Selection */}
          <div className="mb-10">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Select Your Role</h2>
            <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/50">
              {Object.entries(roleConfig).map(([key, config]) => (
                <button
                  key={key}
                  disabled={!isLogin && key === "admin"}
                  onClick={() => { setRole(key); setLoginMethod("email"); setError(""); }}
                  className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl transition-all ${role === key ? `bg-white text-${config.color} shadow-lg ring-1 ring-slate-200` : "text-slate-500 hover:bg-white/50"} ${!isLogin && key === "admin" ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  {config.icon}
                  <span className="text-[10px] font-black uppercase tracking-tighter">{config.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className={`text-4xl font-black text-slate-900 tracking-tight mb-2`}>
              {isLogin ? "Welcome back" : "Join our Registry"}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Access the {roleConfig[role].title} Workspace
            </p>
          </div>

          {isLogin && role !== "admin" && (
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
              <button
                 type="button"
                 onClick={() => setLoginMethod("email")}
                 className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${loginMethod === "email" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              > Email </button>
              <button
                 type="button"
                 onClick={() => setLoginMethod("phone")}
                 className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${loginMethod === "phone" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              > Mobile </button>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-[15px] font-medium"
                  />
                </div>
              </div>
            )}

            {(!isLogin || (isLogin && loginMethod === "email")) && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@office.com" 
                    required={!isLogin || (isLogin && loginMethod === "email")}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-[15px] font-medium"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-[15px] font-medium"
                  />
                </div>
              </div>
            )}

            {isLogin && loginMethod === "phone" && role !== "admin" && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-[15px] font-medium"
                    />
                    {!showOtpInput && (
                      <button
                        type="button" onClick={handleSendOtp} disabled={isSubmitting}
                        className="absolute right-3 top-2 bottom-2 px-4 rounded-xl bg-primary text-white text-xs font-black uppercase hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                      > Send OTP </button>
                    )}
                  </div>
                </div>

                {showOtpInput && (
                  <div className="animate-in fade-in slide-in-from-top-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">Verification Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text" name="otp" value={formData.otp} onChange={handleChange} placeholder="6-digit code" maxLength={6}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-slate-200 focus:border-primary outline-none transition-all tracking-[1em] text-center font-black text-2xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {(!isLogin || (isLogin && loginMethod === "email")) && (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                  {isLogin && (
                    <button type="button" onClick={handleForgotPassword} className="text-xs text-primary font-black hover:underline">
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required
                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-[15px] font-medium"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit" disabled={isSubmitting}
              className={`w-full py-5 rounded-[1.5rem] bg-${roleConfig[role].color} text-white font-black hover:opacity-90 transition-all text-md mt-4 shadow-2xl shadow-${roleConfig[role].color}/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2`}
            >
              {isSubmitting ? <span className="animate-pulse">Authenticating...</span> : (isLogin ? "Sign In Now" : "Create Registry Account")}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-500 text-sm font-bold">
            {isLogin ? "Need a platform account? " : "Already have an workspace? "}
            <button onClick={() => { setIsLogin(!isLogin); setRole("user"); setError(""); }} className="text-primary font-black hover:underline">
              {isLogin ? "Join Now" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
