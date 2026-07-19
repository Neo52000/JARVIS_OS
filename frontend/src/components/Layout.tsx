import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import JarvisVoiceOverlay from './JarvisVoiceOverlay';
import JarvisAlerts from './JarvisAlerts';
import { useAuthStore } from '@/store/authStore';
import { Menu, LogOut, Wifi, Mic } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function Layout() {
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const [voiceOpen, setVoiceOpen] = useState(false);

  // Ctrl+J summons JARVIS from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setVoiceOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email || '';

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6" style={{ borderBottom: '1px solid rgba(0,240,255,0.2)', background: 'linear-gradient(180deg, rgba(0,240,255,0.05), transparent)' }}>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-sm text-[#7a8ba0] hover:text-[#00f0ff] transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setVoiceOpen(true)}
              aria-label="Parler à JARVIS (Ctrl+J)"
              title="Parler à JARVIS (Ctrl+J)"
              className="p-2 rounded-sm text-[#00f0ff] transition-all hover:shadow-cyan-glow-sm"
              style={{ border: '1px solid rgba(0,240,255,0.3)', background: 'rgba(0,240,255,0.08)' }}
            >
              <Mic size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" style={{ boxShadow: '0 0 8px #00e676' }} />
              <Wifi size={14} className="text-[#00e676]" />
              <span className="text-xs text-[#7a8ba0] uppercase tracking-wider">Online</span>
            </div>
            <span className="text-sm text-[#7a8ba0]">
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
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
      <JarvisVoiceOverlay open={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <JarvisAlerts />
    </div>
  );
}
