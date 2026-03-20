import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    withCredentials: true, // send cookies with every request
    headers: {
        "Content-Type": "application/json",
    },
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
    return data;
};

export const loginUser = async ({ email, password }) => {
    const { data } = await api.post("/auth/login-user", { email, password });
    return data;
};

export const loginDoctor = async ({ email, password }) => {
    const { data } = await api.post("/auth/login-doctor", { email, password });
    return data;
};

export const loginMobile = async ({ phoneNumber, otp }) => {
    const { data } = await api.post("/auth/login-mobile", { phoneNumber, otp });
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

export default api;
