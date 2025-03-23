import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Outlet,
  useNavigate,
  Navigate
} from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Toaster } from 'sonner';

// Import page components
import Index from '@/pages/Index';
import Therapists from '@/pages/Therapists';
import TherapistDetail from '@/pages/TherapistDetail';
import FollowedTherapists from '@/pages/FollowedTherapists';
import Booking from '@/pages/Booking';
import Blog from '@/pages/Blog';
import BlogDetail from '@/pages/BlogDetail';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import FAQ from '@/pages/FAQ';
import NotFound from '@/pages/NotFound';
import LineCallback from '@/pages/LineCallback';

// Import user profile components
import UserProfile from '@/pages/user/UserProfile';
import UserBookings from '@/pages/user/UserBookings';
import Messages from '@/pages/user/Messages';
import MessagesIndex from '@/pages/user/MessagesIndex';
import NotificationSettings from '@/pages/user/NotificationSettings';
import DeleteAccount from '@/pages/user/DeleteAccount';

// Import therapist components
import TherapistLayout from '@/components/therapist/TherapistLayout';
import TherapistDashboard from '@/pages/therapist/TherapistDashboard';
import TherapistLogin from '@/pages/therapist/TherapistLogin';
import TherapistSignup from '@/pages/therapist/TherapistSignup';

// Import admin components
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminAccounts from '@/pages/admin/AdminAccounts';
import AdminRequests from '@/pages/admin/AdminRequests';
import AdminInquiries from '@/pages/admin/AdminInquiries';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminAuth from '@/pages/admin/AdminAuth';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminStoreManagement from '@/pages/admin/AdminStoreManagement';
import AdminBlog from '@/pages/admin/AdminBlog';

// Import store admin components
import StoreAdminLayout from '@/components/admin/StoreAdminLayout';
import StoreAdminDashboard from '@/pages/admin/store/StoreAdminDashboard';
import StoreBookings from '@/pages/admin/store/StoreBookings';
import StoreTherapists from '@/pages/admin/store/StoreTherapists';
import StoreCourses from '@/pages/admin/store/StoreCourses';
import StoreBlog from '@/pages/admin/store/StoreBlog';
import StoreInquiries from '@/pages/admin/store/StoreInquiries';
import StoreAnalytics from '@/pages/admin/store/StoreAnalytics';
import StoreSettings from '@/pages/admin/store/StoreSettings';
import StoreLogin from '@/pages/StoreLogin';
import StoreSignup from '@/pages/StoreSignup';

// Import Layout component
import Layout from '@/components/Layout';

function App() {
  const [authView, setAuthView] = useState('sign_in');
  const supabaseClient = useSupabaseClient();
  const session = useSession();

  return (
    <>
      <Routes>
        {/* Layout with header and footer */}
        <Route path="/" element={<Layout><Outlet /></Layout>}>
          <Route index element={<Index />} />
          <Route path="therapists" element={<Therapists />} />
          <Route path="therapists/:id" element={<TherapistDetail />} />
          <Route path="followed-therapists" element={<FollowedTherapists />} />
          <Route path="booking" element={<Booking />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="line-callback" element={<LineCallback />} />
        </Route>

        {/* User profile routes */}
        <Route path="/user" element={<Layout><Outlet /></Layout>}>
          <Route path="profile" element={<UserProfile />} />
          <Route path="bookings" element={<UserBookings />} />
          <Route path="messages" element={<Messages />}>
            <Route index element={<MessagesIndex />} />
            <Route path=":userId" element={<Messages />} />
          </Route>
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="delete-account" element={<DeleteAccount />} />
        </Route>

        {/* Therapist routes */}
        <Route path="/therapist" element={<TherapistLayout />}>
          <Route path="dashboard" element={<TherapistDashboard />} />
          <Route path="login" element={<TherapistLogin />} />
          <Route path="signup" element={<TherapistSignup />} />
        </Route>

        {/* Store admin routes */}
        <Route path="/store-login" element={<StoreLogin />} />
        <Route path="/store-signup" element={<StoreSignup />} />
        
        <Route path="/admin/store" element={<StoreAdminLayout />}>
          <Route index element={<Navigate to="/admin/store/dashboard" />} />
          <Route path="dashboard" element={<StoreAdminDashboard />} />
          <Route path="bookings" element={<StoreBookings />} />
          <Route path="therapists" element={<StoreTherapists />} />
          <Route path="courses" element={<StoreCourses />} />
          <Route path="blog" element={<StoreBlog />} />
          <Route path="inquiries" element={<StoreInquiries />} />
          <Route path="analytics" element={<StoreAnalytics />} />
          <Route path="settings" element={<StoreSettings />} />
        </Route>

        {/* Admin dashboard routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="accounts" element={<AdminAccounts />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="store-management" element={<AdminStoreManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Auth routes */}
        <Route path="/admin/auth" element={<AdminAuth />} />

        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
