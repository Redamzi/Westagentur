import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { ChatView } from './ToniChat';
import type { ToniChatState } from './useToniChat';

interface ChatOverlayProps {
  chat: ToniChatState;
  examples: string[];
  open: boolean;
  onClose: () => void;
}

/** Visible area above the on-screen keyboard (iOS keeps 100dvh behind the keyboard). */
const useVisualViewport = (active: boolean) => {
  const [box, setBox] = useState<{ height: number; top: number }>();
  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) return;
    const update = () => setBox({ height: vv.height, top: vv.offsetTop });
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [active]);
  return box;
};

/** Full-screen chat with Toni on smartphones; the page behind it is locked. */
const ChatOverlay: React.FC<ChatOverlayProps> = ({ chat, examples, open, onClose }) => {
  const de = chat.lang === 'de';
  const viewport = useVisualViewport(open);

  // Lock the page behind the chat and close with Escape.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const previous = [html.style.overflow, document.body.style.overflow];
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      [html.style.overflow, document.body.style.overflow] = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  // Keyboard open: the visible area is clearly smaller than the screen.
  const keyboard = !!viewport && viewport.height < window.innerHeight * 0.8;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={de ? 'Chat mit Toni' : 'Chat with Toni'}
      // The dark backdrop covers the whole screen (also behind keyboard and browser bars) ...
      // chat-open: grows from the card to full screen (index.css)
      className="chat-open section-dark fixed inset-0 z-[60] bg-background"
    >
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      {/* ... while the chat itself only uses the area above the keyboard. */}
      <div
        style={viewport ? { top: viewport.top, height: viewport.height } : undefined}
        className="absolute inset-x-0 top-0 h-full flex flex-col"
      >
        <header className={`relative flex items-center gap-3 px-4 ${keyboard ? 'py-2' : 'pt-[max(0.75rem,env(safe-area-inset-top))] pb-3'} border-b border-border bg-surface`}>
          <div className={`${keyboard ? 'w-9 h-9 text-base' : 'w-11 h-11 text-lg'} shrink-0 rounded-full bg-gradient-to-br from-accent to-[#0E7490] flex items-center justify-center font-display font-bold text-background`}>
            T
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-primary leading-tight">Toni</p>
            <p role="status" className="flex items-center gap-1.5 text-xs text-muted">
              <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${chat.sending ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
              {chat.sending ? (de ? 'schreibt …' : 'typing …') : de ? 'online · KI-Assistent' : 'online · AI assistant'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={de ? 'Chat schließen' : 'Close chat'}
            className="w-11 h-11 flex items-center justify-center border border-border text-primary hover:border-accent"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </header>
        <div className={`relative flex-1 min-h-0 flex flex-col px-3 pt-3 ${keyboard ? 'pb-2' : 'pb-[max(0.75rem,env(safe-area-inset-bottom))]'}`}>
          <ChatView chat={chat} examples={examples} fill compact={keyboard} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChatOverlay;
