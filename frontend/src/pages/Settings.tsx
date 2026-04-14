import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Moon, Sun } from 'lucide-react';

export default function Settings() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [saved, setSaved] = useState(false);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Full Name</label>
            <p className="mt-1">{user?.full_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Member Since</label>
            <p className="mt-1">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm text-gray-500">Switch between light and dark mode</p>
          </div>
          <button
            onClick={handleThemeToggle}
            className="flex items-center gap-2 btn-secondary"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
        {saved && <p className="text-sm text-green-600 mt-2">Theme updated!</p>}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">About</h2>
        <div className="space-y-2 text-sm text-gray-500">
          <p><strong className="text-gray-700 dark:text-gray-300">JARVIS OS</strong> — Business Operating System</p>
          <p>Version 1.0.0</p>
          <p>Built with FastAPI + React + TypeScript</p>
        </div>
      </div>
    </div>
  );
}
