import axios from "axios";

const getBaseURL = () => {
    return "/api";
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true, // send cookies with every request
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically attach Authorization Bearer token to every outgoing request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Auth API calls ───────────────────────────────────────────────────

export const registerUser = async ({ username, email, phone, password, role }) => {
    const { data } = await api.post("/auth/register", {
        username,
        email,
        phone,
        password,
        role,
    });
    if (data.token) {
        localStorage.setItem("token", data.token);
    }
    return data;
};

export const loginUser = async ({ email, password }) => {
    const { data } = await api.post("/auth/login-user", { email, password });
    if (data.token) {
        localStorage.setItem("token", data.token);
    }
    return data;
};

export const loginDoctor = async ({ email, password }) => {
    const { data } = await api.post("/auth/login-doctor", { email, password });
    if (data.token) {
        localStorage.setItem("token", data.token);
    }
    return data;
};

export const loginMobile = async ({ phoneNumber, otp }) => {
    const { data } = await api.post("/auth/login-mobile", { phoneNumber, otp });
    if (data.token) {
        localStorage.setItem("token", data.token);
    }
    return data;
};

export const sendOtp = async (phoneNumber) => {
    const { data } = await api.post("/auth/send-otp", { phoneNumber });
    return data;
};

export const forgotPassword = async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
};

export const resetPassword = async ({ token, newPassword }) => {
    const { data } = await api.post("/auth/reset-password", { token, newPassword });
    return data;
};

export const logoutUser = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    const { data } = await api.post("/auth/logout");
    return data;
};

export const getProfile = async () => {
    const { data } = await api.get("/auth/profile");
    return data;
};

// ── Admin API calls ──────────────────────────────────────────────────

export const adminLogin = async ({ email, password }) => {
    const { data } = await api.post("/admin/login-admin", { email, password });
    if (data.token) {
        localStorage.setItem("adminToken", data.token);
    }
    return data;
};

export const adminLogout = async () => {
    localStorage.removeItem("adminToken");
    const { data } = await api.post("/admin/logout");
    return data;
};

export const getAdminProfile = async () => {
    const { data } = await api.get("/admin/profile");
    return data;
};

export const updateUserProfile = async (updateData) => {
    // If updateData is FormData (for file uploads), don't set JSON content type
    const config = updateData instanceof FormData 
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    
    const { data } = await api.put("/auth/profile", updateData, config);
    return data;
};

// ── Doctor API calls ─────────────────────────────────────────────────

export const getDoctorProfile = async () => {
    const { data } = await api.get("/doctor/profile");
    return data;
};

export const updateDoctorProfile = async (profileData) => {
    const { data } = await api.put("/doctor/profile", profileData);
    return data;
};

export const getDoctorPatients = async () => {
    const { data } = await api.get("/doctor/patients");
    return data;
};

export const addTreatmentNote = (data) => api.post("/doctor/treatment-notes", data);

export const getPublicDoctors = () => api.get("/auth/public/doctors");

// ── Appointment API calls ────────────────────────────────────────────────
export const bookAppointment = (apptData) => api.post("/appointments", apptData);
export const getMyAppointments = () => api.get("/appointments/my");

// ── Subscription & Razorpay API calls ────────────────────────────────────
export const getSubscriptionPlans = () => api.get("/subscription/plans");
export const getCurrentSubscription = () => api.get("/subscription/current");
export const createSubscriptionOrder = (planId) => api.post("/subscription/create-order", { planId });
export const verifySubscriptionPayment = (paymentData) => api.post("/subscription/verify-payment", paymentData);
export const getMyInvoices = () => api.get("/subscription/invoices");
export const resetSubscription = () => api.post("/subscription/reset");

export default api;
