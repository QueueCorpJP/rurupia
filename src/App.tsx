
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Therapists from "./pages/Therapists";
import TherapistDetail from "./pages/TherapistDetail";
import Messages from "./pages/Messages";
import MessagesIndex from "./pages/MessagesIndex";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAccounts from "./pages/admin/AdminAccounts";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminStoreManagement from "./pages/admin/AdminStoreManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/therapists" element={<Therapists />} />
          <Route path="/therapists/:id" element={<TherapistDetail />} />
          <Route path="/messages" element={<MessagesIndex />} />
          <Route path="/messages/:id" element={<Messages />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="accounts" element={<AdminAccounts />} />
            <Route path="store" element={<AdminStoreManagement />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
