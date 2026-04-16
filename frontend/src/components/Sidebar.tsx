import { NavLink } from 'react-router-dom';
import { useUIStore } from '@/store/uiStore';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  CalendarDays,
  StickyNote,
  Bot,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/notes', icon: StickyNote, label: 'Notes' },
  { to: '/ai', icon: Bot, label: 'AI Chat' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { sidebarOpen } = useUIStore();

  return (
    <aside
      className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } flex flex-col transition-all duration-300 shrink-0`}
      style={{ background: '#0d1321', borderRight: '1px solid rgba(0,240,255,0.2)' }}
    >
      <div
        className="h-16 flex items-center justify-center"
        style={{ borderBottom: '1px solid rgba(0,240,255,0.2)' }}
      >
        <h1
          className={`font-orbitron font-black text-[#00f0ff] ${sidebarOpen ? 'text-xl tracking-[3px]' : 'text-sm'}`}
          style={{ textShadow: '0 0 20px rgba(0,240,255,0.4)' }}
        >
          {sidebarOpen ? 'JARVIS' : 'J'}
        </h1>
        {sidebarOpen && (
          <span className="text-[#7a8ba0] text-xs font-normal ml-3 tracking-wider">OS v1.0</span>
        )}
      </div>
      <nav className="flex-1 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? 'text-[#00f0ff] border-r-2 border-[#00f0ff]'
                  : 'text-[#7a8ba0] hover:text-[#00f0ff]'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { background: 'rgba(0,240,255,0.1)', textShadow: '0 0 20px rgba(0,240,255,0.4)' }
                : { background: 'transparent' }
            }
          >
            <Icon size={20} />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
