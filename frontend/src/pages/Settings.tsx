import { useAuthStore } from '@/store/authStore';

export default function Settings() {
  const { user } = useAuthStore();

  const displayName = user?.user_metadata?.full_name || user?.email || '';

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-orbitron font-bold text-[#00f0ff] uppercase tracking-wider" style={{ textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>Settings</h1>
      <div className="card">
        <h2 className="text-sm font-orbitron font-bold text-[#00f0ff] uppercase tracking-wider mb-4">Profile</h2>
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold text-[#7a8ba0] uppercase tracking-wider">Full Name</label><p className="mt-1">{displayName}</p></div>
          <div><label className="block text-xs font-semibold text-[#7a8ba0] uppercase tracking-wider">Email</label><p className="mt-1">{user?.email}</p></div>
          <div><label className="block text-xs font-semibold text-[#7a8ba0] uppercase tracking-wider">Member Since</label><p className="mt-1">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '\u2014'}</p></div>
        </div>
      </div>
      <div className="card">
        <h2 className="text-sm font-orbitron font-bold text-[#00f0ff] uppercase tracking-wider mb-4">About</h2>
        <div className="space-y-2 text-sm text-[#7a8ba0]">
          <p><strong className="text-[#00f0ff]">JARVIS OS</strong> \u2014 Business Operating System</p>
          <p>Version 1.0.0</p>
          <p>Powered by Supabase + React + TypeScript</p>
          <p className="text-xs mt-4 uppercase tracking-wider">Iron Man HUD Interface</p>
        </div>
      </div>
    </div>
  );
}
