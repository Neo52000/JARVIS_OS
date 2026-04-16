import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="w-full max-w-lg mx-4 max-h-[90vh] overflow-auto rounded-sm relative"
        style={{ background: '#0d1321', border: '1px solid rgba(0,240,255,0.3)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)' }} />
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid rgba(0,240,255,0.2)' }}
        >
          <h2 className="text-lg font-orbitron font-bold text-[#00f0ff] uppercase tracking-wider text-sm">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-sm text-[#7a8ba0] hover:text-[#00f0ff] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
