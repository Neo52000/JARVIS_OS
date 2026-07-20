import { useEffect, useState } from 'react';
import { Sparkles, Volume2, X } from 'lucide-react';
import { aiAPI } from '@/api/endpoints';
import { speakText } from '@/hooks/useJarvisVoice';

const STORAGE_KEY = 'jarvis_briefing_date';

function todayKey(): string {
  // Local date, not UTC — otherwise the briefing fires twice around midnight.
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Morning briefing — on the first visit of the day, JARVIS composes a spoken-style
 * summary of the agenda (via the jarvis-agent get_agenda tool) and offers to read it.
 */
export default function JarvisBriefing() {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === todayKey()) return;
    let cancelled = false;
    setLoading(true);
    aiAPI
      .chat([
        {
          role: 'user',
          content:
            'Fais-moi le briefing du matin : mon agenda du jour, mes tâches à échéance ou en retard, et les événements à venir. Deux ou trois phrases, ton de majordome.',
        },
      ])
      .then((data) => {
        if (cancelled) return;
        setBriefing(data.reply);
        localStorage.setItem(STORAGE_KEY, todayKey());
      })
      .catch(() => {
        // Agent not deployed/configured yet — stay silent, no briefing panel.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (dismissed || (!briefing && !loading)) return null;

  return (
    <div className="card" style={{ borderColor: 'rgba(179,136,255,0.35)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles
            size={20}
            className="text-[#b388ff] shrink-0 mt-0.5"
            style={{ filter: 'drop-shadow(0 0 8px #b388ff)' }}
          />
          <div>
            <h2 className="text-sm font-orbitron font-bold text-[#b388ff] uppercase tracking-wider mb-1">
              Briefing du jour
            </h2>
            {loading ? (
              <p className="text-sm text-[#7a8ba0]">JARVIS prépare votre briefing…</p>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{briefing}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {briefing && 'speechSynthesis' in window && (
            <button
              onClick={() => speakText(briefing)}
              aria-label="Écouter le briefing"
              title="Écouter le briefing"
              className="p-2 rounded-sm text-[#7a8ba0] hover:text-[#b388ff] transition-colors"
            >
              <Volume2 size={16} />
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Fermer le briefing"
            className="p-2 rounded-sm text-[#7a8ba0] hover:text-[#00f0ff] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
