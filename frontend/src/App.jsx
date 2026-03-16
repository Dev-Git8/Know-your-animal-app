import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import DoctorRoute from "./components/DoctorRoute.jsx";
import Index from "./pages/Index.jsx";
import Animals from "./pages/Animals.jsx";
import AnimalDetail from "./pages/AnimalDetail.jsx";
import Auth from "./pages/Auth.jsx";
import Chat from "./pages/Chat.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import About from "./pages/About.jsx";
import Vets from "./pages/Vets.jsx";
import DoctorProfiles from "./pages/DoctorProfiles.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import FloatingEmergency from "./components/FloatingEmergency.jsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <FloatingEmergency />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/animals" element={<Animals />} />
              <Route path="/animals/:animalName" element={<AnimalDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/vets" element={<Vets />} />
              <Route path="/doctor-profiles" element={<DoctorProfiles />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login-user" element={<Auth />} />
              <Route path="/login-doctor" element={<Auth />} />
              <Route path="/admin-login" element={<Auth />} />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/dashboard"
                element={
                  <DoctorRoute>
                    <DoctorDashboard />
                  </DoctorRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
