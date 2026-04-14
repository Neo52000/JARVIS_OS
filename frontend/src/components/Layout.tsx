import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { Menu, Moon, Sun, LogOut } from 'lucide-react';

export default function Layout() {
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useUIStore();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-6">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.full_name}
            </span>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>
        <main className={`flex-1 overflow-auto p-6 transition-all ${sidebarOpen ? '' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
