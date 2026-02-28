import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    withCredentials: true, // send cookies with every request
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Auth API calls ───────────────────────────────────────────────────

export const registerUser = async ({ username, email, password }) => {
    const { data } = await api.post("/auth/register", {
        username,
        email,
        password,
    });
    return data;
};

export const loginUser = async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
};

export const logoutUser = async () => {
    const { data } = await api.post("/auth/logout");
    return data;
};

export const getProfile = async () => {
    const { data } = await api.get("/auth/profile");
    return data;
};

// ── Admin API calls ──────────────────────────────────────────────────

export const adminLogin = async ({ email, password }) => {
    const { data } = await api.post("/admin/login", { email, password });
    return data;
};

export const adminLogout = async () => {
    const { data } = await api.post("/admin/logout");
    return data;
};

export const getAdminProfile = async () => {
    const { data } = await api.get("/admin/profile");
    return data;
};

export default api;
