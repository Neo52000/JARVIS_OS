import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/authStore';
import { Menu, LogOut, Wifi } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function Layout() {
  const { toggleSidebar, setMobileSidebarOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const displayName = user?.user_metadata?.full_name || user?.email || '';

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-3 md:px-6" style={{ borderBottom: '1px solid rgba(0,240,255,0.2)', background: 'linear-gradient(180deg, rgba(0,240,255,0.05), transparent)' }}>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-sm text-[#7a8ba0] hover:text-[#00f0ff] transition-colors md:hidden"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-sm text-[#7a8ba0] hover:text-[#00f0ff] transition-colors hidden md:block"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" style={{ boxShadow: '0 0 8px #00e676' }} />
              <Wifi size={14} className="text-[#00e676] hidden md:block" />
              <span className="text-xs text-[#7a8ba0] uppercase tracking-wider hidden md:inline">Online</span>
            </div>
            <span className="text-sm text-[#7a8ba0] hidden sm:inline truncate max-w-[150px]">
              {displayName}
            </span>
            <button
              onClick={() => logout()}
              className="p-2 rounded-sm text-[#ff3860] hover:bg-[rgba(255,56,96,0.1)] transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-3 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
