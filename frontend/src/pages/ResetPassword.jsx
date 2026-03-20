import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { resetPassword } from "@/integrations/authApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsSubmitting(true);
        try {
            await resetPassword({ token, newPassword });
            setIsSuccess(true);
            toast.success("Password reset successfully!");
            setTimeout(() => navigate("/auth"), 3000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reset password. Link may be expired.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Invalid Token</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-inter">
            <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100">
                {isSuccess ? (
                    <div className="text-center space-y-4 animate-in zoom-in-95">
                        <div className="bg-emerald-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Success!</h2>
                        <p className="text-slate-500 text-sm">Your password has been reset. Redirecting to login...</p>
                        <Button onClick={() => navigate("/auth")} className="w-full bg-primary font-bold rounded-xl h-11">Login Now</Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 text-center space-y-2">
                            <h1 className="text-3xl font-black text-slate-900">Reset Password</h1>
                            <p className="text-slate-500 text-sm">Secure your account with a new password</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full py-7 font-black text-md bg-primary hover:bg-primary/95 shadow-xl shadow-primary/20 rounded-2xl transition-all"
                            >
                                {isSubmitting ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
