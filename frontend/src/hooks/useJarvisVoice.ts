import { useCallback, useEffect, useRef, useState } from 'react';
import { aiAPI } from '@/api/endpoints';
import type { ChatMessage } from '@/types';

export type JarvisVoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

const WAKE_WORD = /\bjarvis\b/i;

// Minimal typings for the Web Speech API (not in the TS DOM lib).
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null;
}

function pickFrenchVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.startsWith('fr') && /google/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith('fr')) ??
    null
  );
}

export // Chrome garbage-collects unreferenced utterances mid-speech, which silently
// drops the onend event — keep the active one referenced at module level.
let activeUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(text: string, onEnd?: () => void) {
  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance;
  utterance.lang = 'fr-FR';
  const voice = pickFrenchVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 1.02;
  utterance.pitch = 0.85; // slightly lower — calm butler register
  const handleEnd = () => {
    if (activeUtterance === utterance) activeUtterance = null;
    onEnd?.();
  };
  utterance.onend = handleEnd;
  utterance.onerror = handleEnd;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function useJarvisVoice(active: boolean) {
  const supported =
    typeof window !== 'undefined' &&
    getRecognitionCtor() !== null &&
    'speechSynthesis' in window;

  const [state, setState] = useState<JarvisVoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Refs mirror state for use inside recognition callbacks.
  const stateRef = useRef<JarvisVoiceState>('idle');
  const activeRef = useRef(false);
  const awakeRef = useRef(false); // wake word heard, next utterance is the command
  const messagesRef = useRef<ChatMessage[]>([]);
  stateRef.current = state;
  messagesRef.current = messages;

  const stopRecognition = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
  }, []);

  const handleCommand = useCallback(async (command: string) => {
    // Update the ref synchronously: stopRecognition() fires onend before React
    // re-renders, and onend must not restart recognition while we think.
    stateRef.current = 'thinking';
    stopRecognition();
    setState('thinking');
    setTranscript(command);
    const userMessage: ChatMessage = { role: 'user', content: command };
    const history = [...messagesRef.current, userMessage];
    setMessages(history);
    let reply: string;
    let actions: ChatMessage['actions'];
    try {
      const data = await aiAPI.chat(history);
      reply = data.reply;
      actions = data.actions;
    } catch {
      reply = "Je suis désolé, je n'arrive pas à joindre mes serveurs.";
    }
    setMessages([...history, { role: 'assistant', content: reply, actions }]);
    if (!activeRef.current) return;
    setState('speaking');
    speakText(reply, () => {
      if (activeRef.current) {
        setState('listening');
        setTranscript('');
        startRecognitionRef.current?.();
      }
    });
  }, [stopRecognition]);

  const handleCommandRef = useRef(handleCommand);
  handleCommandRef.current = handleCommand;
  const startRecognitionRef = useRef<(() => void) | null>(null);

  const startRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || recognitionRef.current) return;
    const recognition = new Ctor();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();
        if (!result.isFinal) {
          interim += text;
          continue;
        }
        if (!text) continue;
        if (awakeRef.current) {
          awakeRef.current = false;
          handleCommandRef.current(text);
          return;
        }
        const match = WAKE_WORD.exec(text);
        if (match) {
          const command = text.slice(match.index + match[0].length).replace(/^[,.:;!?\s]+/, '');
          if (command) {
            handleCommandRef.current(command);
          } else {
            // "Jarvis" alone — wake up and wait for the command.
            awakeRef.current = true;
            setTranscript('Oui ?');
          }
          return;
        }
      }
      if (interim && stateRef.current === 'listening') setTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError("Accès au micro refusé — autorisez le micro pour parler à JARVIS.");
        setState('idle');
      }
      // 'no-speech' and 'aborted' are routine; onend handles the restart.
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      // Chrome stops after silence — restart while we're supposed to listen.
      if (activeRef.current && stateRef.current === 'listening') {
        startRecognitionRef.current?.();
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
    }
  }, []);
  startRecognitionRef.current = startRecognition;

  // Open/close lifecycle.
  useEffect(() => {
    activeRef.current = active;
    if (!supported) return;
    if (active) {
      setError(null);
      setState('listening');
      setTranscript('');
      setMessages([]);
      startRecognition();
    } else {
      awakeRef.current = false;
      stopRecognition();
      window.speechSynthesis.cancel();
      setState('idle');
      setTranscript('');
    }
    return () => {
      activeRef.current = false;
      stopRecognition();
      window.speechSynthesis.cancel();
    };
  }, [active, supported, startRecognition, stopRecognition]);

  // Pause listening when the tab is hidden.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        stopRecognition();
        window.speechSynthesis.cancel();
        // cancel() may not fire the utterance callback — don't stay stuck in
        // 'speaking' with nothing playing.
        if (stateRef.current === 'speaking') {
          stateRef.current = 'listening';
          setState('listening');
          setTranscript('');
        }
      } else if (activeRef.current && stateRef.current === 'listening') {
        startRecognition();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [startRecognition, stopRecognition]);

  return { supported, state, transcript, messages, error };
}
