// ─────────────────────────────────────────────────────────────
// LifeOS – useChatbot : logique d'envoi de messages (typing
// simulé + moteur de réponses contextuel)
// ─────────────────────────────────────────────────────────────

import { useCallback, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { buildReply } from '../components/chatbot/Chatbot';

export function useChatbot() {
  const { state, lang, pushChat } = useApp();
  const [typing, setTyping] = useState(false);
  const timerRef = useRef<number | null>(null);

  const send = useCallback(
    (text: string) => {
      const msg = text.trim();
      if (!msg || typing) return;
      pushChat('user', msg);
      setTyping(true);
      timerRef.current = window.setTimeout(() => {
        pushChat('bot', buildReply(msg, state, lang, state.settings.coachMode));
        setTyping(false);
      }, 900 + Math.random() * 700);
    },
    [pushChat, typing, state, lang],
  );

  const cancel = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setTyping(false);
  }, []);

  return { typing, send, cancel };
}
