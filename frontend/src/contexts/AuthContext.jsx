import { createContext, useContext, useState, useEffect } from "react";
import {
    loginUser as apiLogin,
    registerUser as apiRegister,
    logoutUser as apiLogout,
    adminLogout as apiAdminLogout,
    getProfile,
    getAdminProfile,
    adminLogin as apiAdminLogin,
    loginDoctor as apiDoctorLogin,
} from "@/integrations/authApi";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true while checking cookie on mount

    // ── Check existing session on app load ─────────────────────────────
    useEffect(() => {
        const checkAuth = async () => {
            try {
                let data = null;
                // Try fetching user profile first as it's the more common case
                try {
                    data = await getProfile();
                } catch (e) {
                    // If regular profile fails, try admin profile
                    try {
                        data = await getAdminProfile();
                    } catch (e2) {
                        // If both fail, no session
                        data = null;
                    }
                }
                
                if (data && data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    // ── Login ──────────────────────────────────────────────────────────
    const login = async (credentials) => {
        const data = await apiLogin(credentials); // let errors propagate to caller
        setUser(data.user);
        return data;
    };

    // ── Register ───────────────────────────────────────────────────────
    const register = async (credentials) => {
        const data = await apiRegister(credentials);
        setUser(data.user);
        return data;
    };

    // ── Logout ─────────────────────────────────────────────────────────
    const logout = async () => {
        try {
            // Call both to be safe, regardless of role
            await Promise.allSettled([
                apiLogout(),
                apiAdminLogout()
            ]);
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setUser(null);
            localStorage.clear();
            sessionStorage.clear();
            
            // Force a hard reload to clear all memory states and redirect
            window.location.href = "/auth";
        }
    };

    const adminLogin = async (credentials) => {
        const data = await apiAdminLogin(credentials);
        setUser(data.user);
        return data;
    };

    // ── Doctor Login ───────────────────────────────────────────────────
    const doctorLogin = async (credentials) => {
        const data = await apiDoctorLogin(credentials);
        setUser(data.user);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, adminLogin, doctorLogin, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
