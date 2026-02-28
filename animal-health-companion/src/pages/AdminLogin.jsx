import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import { adminLogin } from "@/integrations/authApi";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await adminLogin({ email: formData.email, password: formData.password });
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-accent/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50" />

      <div className="w-full max-w-sm relative z-10">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        <div className="mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Admin Access
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Restricted area — authorised personnel only
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-[#3c3226] text-white font-medium hover:bg-[#2a231a] transition-colors text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Please wait..." : "Sign In as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
