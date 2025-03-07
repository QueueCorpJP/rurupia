
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { UserNav } from './UserNav';
import { cn } from '@/lib/utils';
import { LayoutDashboard } from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <SidebarNav isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isSidebarOpen ? "md:ml-64" : "md:ml-20"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-primary-foreground bg-primary hover:bg-primary/90 mr-2 md:hidden"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </button>
          <h1 className="font-semibold text-lg md:text-xl">運営管理システム</h1>
          <div className="ml-auto flex items-center gap-4">
            <UserNav />
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
