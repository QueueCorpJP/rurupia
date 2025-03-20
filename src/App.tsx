
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Therapists from "./pages/Therapists";
import TherapistDetail from "./pages/TherapistDetail";
import Booking from "./pages/Booking";
import TherapistDashboard from "./pages/TherapistDashboard";
import UserProfile from "./pages/UserProfile";
import UserBookings from "./pages/UserBookings";
import Messages from "./pages/Messages";
import MessagesIndex from "./pages/MessagesIndex";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import StoreAdminLayout from "./components/admin/StoreAdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAccounts from "./pages/admin/AdminAccounts";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminBlog from "./pages/admin/AdminBlog";
import StoreAdminDashboard from "./pages/store/StoreAdminDashboard";
import StoreTherapists from "./pages/store/StoreTherapists";
import StoreCourses from "./pages/store/StoreCourses";
import StoreInquiries from "./pages/store/StoreInquiries";
import StoreAnalytics from "./pages/store/StoreAnalytics";
import StoreBookings from "./pages/store/StoreBookings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TherapistLogin from "./pages/TherapistLogin";
import TherapistSignup from "./pages/TherapistSignup";
import StoreLogin from "./pages/StoreLogin";
import StoreSignup from "./pages/StoreSignup";
import NotificationSettings from "./pages/NotificationSettings";
import DeleteAccount from "./pages/DeleteAccount";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/therapists" element={<Therapists />} />
          <Route path="/therapists/:id" element={<TherapistDetail />} />
          <Route path="/book/:id" element={<Booking />} />
          <Route path="/therapist-dashboard" element={<TherapistDashboard />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/user-bookings" element={<UserBookings />} />
          <Route path="/messages" element={<MessagesIndex />} />
          <Route path="/messages/:id" element={<Messages />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/therapist-login" element={<TherapistLogin />} />
          <Route path="/therapist-signup" element={<TherapistSignup />} />
          <Route path="/store-login" element={<StoreLogin />} />
          <Route path="/store-signup" element={<StoreSignup />} />
          
          {/* Admin Routes - For Site Operation */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="accounts" element={<AdminAccounts />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          {/* Store Admin Routes - For Store Management */}
          <Route path="/store-admin" element={<StoreAdminLayout />}>
            <Route index element={<StoreAdminDashboard />} />
            <Route path="therapists" element={<StoreTherapists />} />
            <Route path="bookings" element={<StoreBookings />} />
            <Route path="courses" element={<StoreCourses />} />
            <Route path="inquiries" element={<StoreInquiries />} />
            <Route path="analytics" element={<StoreAnalytics />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/notification-settings" element={<NotificationSettings />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
