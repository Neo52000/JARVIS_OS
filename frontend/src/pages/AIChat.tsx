import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { aiAPI } from '@/api/endpoints';
import type { ChatMessage } from '@/types';

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMessage: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const data = await aiAPI.chat(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'AI assistant is not configured yet. Deploy the ai-chat Edge Function to enable this feature.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <h1 className="text-2xl font-orbitron font-bold text-[#00f0ff] uppercase tracking-wider mb-4" style={{ textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>
        AI Assistant
      </h1>
      <div className="flex-1 card !p-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 space-y-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-[#7a8ba0] py-20">
              <Bot size={48} className="mb-4 text-[#00f0ff]" style={{ filter: 'drop-shadow(0 0 12px rgba(0,240,255,0.5))' }} />
              <p className="text-lg font-orbitron font-bold text-[#00f0ff]">Hello! I'm JARVIS</p>
              <p className="text-sm">Your AI business assistant. How can I help you?</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-sm flex items-center justify-center text-[#b388ff] shrink-0" style={{ background: 'rgba(179,136,255,0.15)', border: '1px solid rgba(179,136,255,0.3)' }}>
                  <Bot size={16} />
                </div>
              )}
              <div
                className={`max-w-[70%] px-4 py-2 rounded-sm ${
                  msg.role === 'user' ? '' : ''
                }`}
                style={
                  msg.role === 'user'
                    ? { background: 'rgba(0,240,255,0.1)', borderLeft: '3px solid #00f0ff' }
                    : { background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #b388ff' }
                }
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-sm flex items-center justify-center text-[#00f0ff] shrink-0" style={{ background: 'rgba(0,240,255,0.15)', border: '1px solid rgba(0,240,255,0.3)' }}>
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-sm flex items-center justify-center text-[#b388ff] shrink-0" style={{ background: 'rgba(179,136,255,0.15)', border: '1px solid rgba(179,136,255,0.3)' }}>
                <Bot size={16} />
              </div>
              <div className="px-4 py-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #b388ff' }}>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="p-4" style={{ borderTop: '1px solid rgba(0,240,255,0.2)' }}>
          <div className="flex gap-2">
            <textarea className="input !py-2 resize-none" rows={1} placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} />
            <button onClick={handleSend} disabled={!input.trim() || loading} className="btn-primary !px-3 shrink-0 disabled:opacity-50"><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
