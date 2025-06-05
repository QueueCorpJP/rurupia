import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useScrollToTop } from './hooks/useScrollToTop';
import Index from './pages/Index';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LineCallback from './pages/LineCallback';
import Therapists from './pages/Therapists';
import TherapistDetail from './pages/TherapistDetail';
import Booking from './pages/Booking';
import Messages from './pages/Messages';
import MessagesIndex from './pages/MessagesIndex';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import BlogCategory from './pages/BlogCategory';
import BlogTag from './pages/BlogTag';
import UserProfile from './pages/UserProfile';
import UserBookings from './pages/UserBookings';
import FollowedTherapists from './pages/FollowedTherapists';
import NotificationSettings from './pages/NotificationSettings';
import UserNotifications from './pages/UserNotifications';
import DeleteAccount from './pages/DeleteAccount';
import StoreSignup from './pages/StoreSignup';
import StoreLogin from './pages/StoreLogin';
import StoreAdminLayout from './components/admin/StoreAdminLayout';
import StoreAdminDashboard from './pages/store/StoreAdminDashboard';
import StoreBookings from './pages/store/StoreBookings';
import StoreTherapists from './pages/store/StoreTherapists';
import StoreCourses from './pages/store/StoreCourses';
import StoreBlog from './pages/store/StoreBlog';
import StoreAnalytics from './pages/store/StoreAnalytics';
import StoreInquiries from './pages/store/StoreInquiries';
import StoreSettings from './pages/store/StoreSettings';
import TherapistLogin from './pages/TherapistLogin';
import TherapistSignup from './pages/TherapistSignup';
import TherapistDashboard from './pages/TherapistDashboard';
import TherapistProfile from './pages/TherapistProfile';
import TherapistBookings from './pages/TherapistBookings';
import TherapistMessagesFix from './pages/TherapistMessagesFix';
import TherapistPosts from './pages/TherapistPosts';
import TherapistSettings from './pages/TherapistSettings';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAccounts from './pages/admin/AdminAccounts';
import AdminBlog from './pages/admin/AdminBlog';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminRequests from './pages/admin/AdminRequests';
import AdminAuth from './pages/admin/AdminAuth';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import NotFound from './pages/NotFound';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSetup from './pages/admin/AdminSetup';
import VerificationDocument from './pages/admin/VerificationDocument';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import TherapistPublicPosts from './pages/TherapistPublicPosts';
import AllTherapistPosts from './pages/AllTherapistPosts';

// Create a wrapper component that applies scroll restoration
function ScrollToTop({ children }: { children: React.ReactNode }) {
  useScrollToTop();
  return <span className="contents">{children}</span>;
}

function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <ScrollToTop>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/therapist/reset-password" element={<ResetPassword />} />
            <Route path="/store/reset-password" element={<ResetPassword />} />
            <Route path="/line-callback" element={<LineCallback />} />
            <Route path="/therapists" element={<Therapists />} />
            <Route path="/therapist/:id" element={<TherapistDetail />} />
            <Route path="/therapist/:id/posts" element={<TherapistPublicPosts />} />
            <Route path="/all-posts" element={<AllTherapistPosts />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/messages" element={<MessagesIndex />} />
            <Route path="/messages/:id" element={<Messages />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/category/:category" element={<BlogCategory />} />
            <Route path="/blog/tag/:tag" element={<BlogTag />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/user-bookings" element={<UserBookings />} />
            <Route path="/followed-therapists" element={<FollowedTherapists />} />
            <Route path="/notification-settings" element={<NotificationSettings />} />
            <Route path="/notifications" element={<UserNotifications />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            
            {/* Store Admin Routes */}
            <Route path="/store-signup" element={<StoreSignup />} />
            <Route path="/store-login" element={<StoreLogin />} />
            <Route path="/store-admin" element={<StoreAdminLayout />}>
              <Route index element={<StoreAdminDashboard />} />
              <Route path="bookings" element={<StoreBookings />} />
              <Route path="therapists" element={<StoreTherapists />} />
              {/* Courses page is temporarily disabled
              <Route path="courses" element={<StoreCourses />} />
              */}
              <Route path="blog" element={<StoreBlog />} />
              <Route path="analytics" element={<StoreAnalytics />} />
              <Route path="inquiries" element={<StoreInquiries />} />
              <Route path="settings" element={<StoreSettings />} />
            </Route>
            
            {/* Therapist Routes */}
            <Route path="/therapist-login" element={<TherapistLogin />} />
            <Route path="/therapist-signup" element={<TherapistSignup />} />
            <Route path="/therapist-dashboard" element={<TherapistDashboard />} />
            <Route path="/therapist-profile" element={<TherapistProfile />} />
            <Route path="/therapist-bookings" element={<TherapistBookings />} />
            <Route path="/therapist-messages" element={<TherapistMessagesFix />} />
            <Route path="/therapist-messages/:id" element={<TherapistMessagesFix />} />
            <Route path="/therapist-posts" element={<TherapistPosts />} />
            <Route path="/therapist-settings" element={<TherapistSettings />} />
            <Route path="/therapist-posts/:id" element={<TherapistPublicPosts />} />
            
            {/* Admin Routes */}
            <Route path="/admin/setup" element={<AdminSetup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="accounts" element={<AdminAccounts />} />
              <Route path="verification/:userId" element={<AdminProtectedRoute><VerificationDocument /></AdminProtectedRoute>} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="inquiries" element={<AdminInquiries />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="auth" element={<AdminAuth />} />
            </Route>
            
            <Route path="/google-auth-callback" element={<GoogleAuthCallback />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ScrollToTop>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;
