import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SESSION_KEY = 'jarvis_due_alert_shown';
const CHECK_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Proactive due-task alert — checks periodically for open tasks due today and
 * surfaces a discreet HUD toast once per session.
 */
export default function JarvisAlerts() {
  const [dueCount, setDueCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    let cancelled = false;

    const check = async () => {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(); dayEnd.setHours(23, 59, 59, 999);
      const { count, error } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'done')
        .gte('due_date', dayStart.toISOString())
        .lte('due_date', dayEnd.toISOString());
      if (cancelled || error || !count) return;
      setDueCount(count);
      setVisible(true);
      sessionStorage.setItem(SESSION_KEY, '1');
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 rounded-sm"
      style={{
        background: 'rgba(13,19,33,0.95)',
        border: '1px solid rgba(255,145,0,0.45)',
        boxShadow: '0 0 24px rgba(255,145,0,0.15)',
      }}
    >
      <AlertCircle size={18} className="text-[#ff9100]" style={{ filter: 'drop-shadow(0 0 6px #ff9100)' }} />
      <Link
        to="/tasks"
        onClick={() => setVisible(false)}
        className="text-sm hover:text-[#ff9100] transition-colors"
      >
        {dueCount === 1
          ? 'Monsieur, une tâche arrive à échéance aujourd’hui.'
          : `Monsieur, ${dueCount} tâches arrivent à échéance aujourd’hui.`}
      </Link>
      <button
        onClick={() => setVisible(false)}
        aria-label="Fermer l'alerte"
        className="p-1 rounded-sm text-[#7a8ba0] hover:text-[#00f0ff] transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
