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
      } bg-jarvis-950 text-white flex flex-col transition-all duration-300 shrink-0`}
    >
      <div className="h-16 flex items-center justify-center border-b border-jarvis-800">
        <h1 className={`font-bold ${sidebarOpen ? 'text-xl' : 'text-sm'}`}>
          {sidebarOpen ? 'JARVIS OS' : 'J'}
        </h1>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-jarvis-800 text-white border-r-2 border-jarvis-400'
                  : 'text-jarvis-300 hover:bg-jarvis-900 hover:text-white'
              }`
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
