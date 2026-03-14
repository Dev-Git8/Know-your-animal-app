import { createContext, useContext, useState, useEffect } from "react";
import {
    loginUser as apiLogin,
    registerUser as apiRegister,
    logoutUser as apiLogout,
    getProfile,
} from "@/integrations/authApi";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true while checking cookie on mount

    // ── Check existing session on app load ─────────────────────────────
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await getProfile();
                setUser(data.user);
            } catch {
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
        await apiLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
