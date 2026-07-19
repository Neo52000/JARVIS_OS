import { useEffect, useMemo } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import NeuralCore, { type ActivityMap } from '@/components/NeuralCore';
import { useJarvisVoice, type JarvisVoiceState } from '@/hooks/useJarvisVoice';

interface JarvisVoiceOverlayProps {
  open: boolean;
  onClose: () => void;
  /** Force a visual state — used only by dev previews/screenshots. */
  debugState?: JarvisVoiceState;
}

const STATE_ACTIVITY: Record<JarvisVoiceState, ActivityMap> = {
  idle: {},
  listening: { sensory: 0.95, language: 0.75, feature: 0.5 },
  thinking: { prefrontal: 1, concept: 0.9, association: 0.85, hippocampus: 0.6 },
  speaking: { motor: 1, language: 0.85, prefrontal: 0.4 },
};

const STATE_LABEL: Record<JarvisVoiceState, string> = {
  idle: 'EN VEILLE',
  listening: 'EN ÉCOUTE — DITES « JARVIS »',
  thinking: 'ANALYSE EN COURS',
  speaking: 'RÉPONSE',
};

const STATE_COLOR: Record<JarvisVoiceState, string> = {
  idle: '#7a8ba0',
  listening: '#00f0ff',
  thinking: '#b388ff',
  speaking: '#00e676',
};

export default function JarvisVoiceOverlay({ open, onClose, debugState }: JarvisVoiceOverlayProps) {
  const voice = useJarvisVoice(open && !debugState);
  const state = debugState ?? voice.state;
  const activity = useMemo(() => STATE_ACTIVITY[state], [state]);
  const lastAssistant = [...voice.messages].reverse().find((m) => m.role === 'assistant');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#070a12' }}>
      <div className="absolute inset-0">
        <NeuralCore activity={activity} />
      </div>

      <div className="relative flex items-center justify-between px-6 h-16 shrink-0">
        <h2 className="font-orbitron font-bold text-[#00f0ff] uppercase tracking-widest text-sm"
            style={{ textShadow: '0 0 16px rgba(0,240,255,0.5)' }}>
          J.A.R.V.I.S
        </h2>
        <button
          onClick={onClose}
          aria-label="Fermer le mode vocal"
          className="p-2 rounded-sm text-[#7a8ba0] hover:text-[#00f0ff] transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-end pb-16 px-6 pointer-events-none">
        {!voice.supported && !debugState ? (
          <div className="card !bg-[rgba(13,19,33,0.9)] max-w-md text-center pointer-events-auto">
            <MicOff size={28} className="mx-auto mb-3 text-[#ff3860]" />
            <p className="text-sm">
              La reconnaissance vocale n'est pas disponible dans ce navigateur.
              Utilisez Chrome ou Edge pour parler à JARVIS.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-2xl text-center space-y-4">
            {lastAssistant && state !== 'listening' && (
              <div
                className="mx-auto px-5 py-3 rounded-sm text-sm"
                style={{
                  background: 'rgba(13,19,33,0.85)',
                  border: '1px solid rgba(0,240,255,0.25)',
                  backdropFilter: 'blur(2px)',
                }}
              >
                <p className="whitespace-pre-wrap">{lastAssistant.content}</p>
                {lastAssistant.actions && lastAssistant.actions.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                    {lastAssistant.actions.map((action, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-rajdhani font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm text-[#00e676]"
                        style={{ background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.35)' }}
                      >
                        ✓ {action.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {voice.transcript && (
              <p className="text-lg text-[#e0e6ed] font-rajdhani" style={{ textShadow: '0 0 12px rgba(0,0,0,0.8)' }}>
                « {voice.transcript} »
              </p>
            )}

            {voice.error && (
              <p className="text-sm text-[#ff3860]">{voice.error}</p>
            )}

            <div className="flex items-center justify-center gap-3">
              <span
                className="relative flex items-center justify-center w-12 h-12 rounded-full"
                style={{
                  border: `1px solid ${STATE_COLOR[state]}`,
                  boxShadow: `0 0 24px ${STATE_COLOR[state]}55`,
                  background: 'rgba(13,19,33,0.7)',
                }}
              >
                <Mic size={20} style={{ color: STATE_COLOR[state] }} />
                {state === 'listening' && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ border: '1px solid rgba(0,240,255,0.5)' }}
                  />
                )}
              </span>
              <span
                className="font-orbitron font-bold text-xs uppercase tracking-widest"
                style={{ color: STATE_COLOR[state], textShadow: `0 0 12px ${STATE_COLOR[state]}88` }}
              >
                {STATE_LABEL[state]}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
