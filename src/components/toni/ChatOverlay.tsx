import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { ChatView, type ToniChatState } from './ToniChat';

interface ChatOverlayProps {
  chat: ToniChatState;
  examples: string[];
  /** "typing" focuses the input (keyboard opens), "reading" does not. */
  open: false | 'typing' | 'reading';
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
  const reduceMotion = useReducedMotion();
  const viewport = useVisualViewport(!!open);

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

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={de ? 'Chat mit Toni' : 'Chat with Toni'}
      initial={reduceMotion ? false : { clipPath: 'inset(45% 16px 16px 16px round 28px)', opacity: 0.6 }}
      animate={{ clipPath: 'inset(0% 0px 0px 0px round 0px)', opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={viewport ? { height: viewport.height, top: viewport.top } : undefined}
      className="section-dark fixed inset-x-0 top-0 h-[100dvh] z-[60] flex flex-col bg-background"
    >
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <header className="relative flex items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b border-border bg-surface">
        <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-accent to-[#0E7490] flex items-center justify-center text-lg font-display font-bold text-background">
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
      <div className="relative flex-1 min-h-0 flex flex-col px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <ChatView chat={chat} examples={examples} fill autoFocus={open === 'typing'} />
      </div>
    </motion.div>,
    document.body
  );
};

export default ChatOverlay;
