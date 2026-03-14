import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MobileNav } from "@/components/MobileNav";
import { CookieBanner } from "@/components/CookieBanner";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Sessions from "./pages/Sessions";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Information from "./pages/Information";
import CoachSessions from "./pages/coach/CoachSessions";
import SessionForm from "./pages/coach/SessionForm";
import Locations from "./pages/coach/Locations";
import Activities from "./pages/coach/Activities";
import Schedule from "./pages/coach/Schedule";
import Clients from "./pages/coach/Clients";
import Groups from "./pages/coach/Groups";
import AdminUsers from "./pages/admin/AdminUsers";
import Communications from "./pages/coach/Communications";
import NotFound from "./pages/NotFound";

/** Navigation mobile globale — masquée sur les pages publiques **/
function GlobalMobileNav() {
  const { user } = useAuth();
  const location = useLocation();
  const publicRoutes = ['/', '/login', '/signup', '/reset-password'];
  if (!user || publicRoutes.includes(location.pathname)) return null;
  return <MobileNav />;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessions"
              element={
                <ProtectedRoute>
                  <Sessions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/information"
              element={
                <ProtectedRoute>
                  <Information />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/sessions"
              element={
                <ProtectedRoute allowedRoles={['coach', 'admin']}>
                  <CoachSessions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/sessions/new"
              element={
                <ProtectedRoute allowedRoles={['coach', 'admin']}>
                  <SessionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/sessions/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['coach', 'admin']}>
                  <SessionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/locations"
              element={
                <ProtectedRoute allowedRoles={['coach', 'admin']}>
                  <Locations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/activities"
              element={
                <ProtectedRoute allowedRoles={['coach', 'admin']}>
                  <Activities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/schedule"
              element={
                <ProtectedRoute allowedRoles={['coach', 'admin']}>
                  <Schedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/clients"
              element={
                <ProtectedRoute allowedRoles={['coach', 'admin']}>
                  <Clients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/groups"
              element={
                <ProtectedRoute allowedRoles={['coach', 'admin']}>
                  <Groups />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach/communications"
              element={
                <ProtectedRoute allowedRoles={['coach', 'admin']}>
                  <Communications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <GlobalMobileNav />
          <CookieBanner />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
