
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { StoreSidebarNav } from "./StoreSidebarNav";
import { UserNav } from "./UserNav";
import { cn } from "@/lib/utils";

const StoreAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <StoreSidebarNav isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div
        className={cn(
          "transition-all duration-300 min-h-screen",
          sidebarOpen ? "pl-64" : "pl-20"
        )}
      >
        <header className="h-16 border-b flex items-center justify-end px-4">
          <UserNav />
        </header>
        
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StoreAdminLayout;
