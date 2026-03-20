import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Role-based access control
    if (role && user.role !== role) {
        // Redirect to their own dashboard if they try to access wrong one
        const fallback = user.role === "admin" ? "/admin/dashboard" : (user.role === "doctor" ? "/doctor/dashboard" : "/dashboard");
        return <Navigate to={fallback} replace />;
    }

    return children;
};

export default ProtectedRoute;
