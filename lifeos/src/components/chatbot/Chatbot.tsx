// ─────────────────────────────────────────────────────────────
// LifeOS – Agent IA intégré (widget de chat)
// Moteur de règles : lit les données du dashboard en temps réel,
// base de connaissances (conseils finances/productivité,
// citations), mode Coach, historique persistant.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, MessageSquare, Send, Sparkles, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KNOWLEDGE, SUGGESTED } from '../../data/knowledge';
import { formatDate, formatMoney, monthKey, percent, todayISO } from '../../utils/helpers';
import type { AppState } from '../../types';
import { ConfirmDialog } from '../ui';

/* ── Moteur de réponse ── */
export function buildReply(raw: string, state: AppState, lang: 'fr' | 'en', coach: boolean): string {
  const K = KNOWLEDGE[lang];
  const input = raw.toLowerCase();
  const fr = lang === 'fr';
  const cur = state.settings.currency;

  const thisMonth = monthKey(todayISO());
  const monthTx = state.transactions.filter((x) => monthKey(x.date) === thisMonth);
  const revenue = monthTx.filter((x) => x.type === 'income').reduce((s, x) => s + x.amount, 0);
  const expenses = monthTx.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0);

  const spentByCat = new Map<string, number>();
  monthTx.filter((x) => x.type === 'expense').forEach((x) => spentByCat.set(x.category, (spentByCat.get(x.category) ?? 0) + x.amount));
  const overCats = state.budget.filter((c) => (spentByCat.get(c.name) ?? 0) > c.planned);

  const activeTasks = state.tasks.filter((x) => !x.done);
  const dueToday = activeTasks.filter((x) => x.due === todayISO());
  const eventsToday = state.events.filter((x) => x.date === todayISO()).sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'));
  const habitsDoneToday = state.habits.filter((h) => h.days[todayISO()]).length;

  const has = (...words: string[]) => words.some((w) => input.includes(w));

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // ── Intents ──
  if (has('bonjour', 'salut', 'hello', 'hi', 'salam', 'coucou', 'hey')) {
    const name = state.profile.name.split(' ')[0];
    return fr
      ? `Bonjour ${name} ! 👋 Ravi de vous revoir.\n\nEn un coup d'œil : vous avez ${activeTasks.length} tâche${activeTasks.length > 1 ? 's' : ''} en cours, ${eventsToday.length} événement${eventsToday.length > 1 ? 's' : ''} aujourd'hui, et votre solde du mois est de ${formatMoney(revenue - expenses, cur)}.\n\nQue puis-je faire pour vous ?`
      : `Hello ${name}! 👋 Great to see you.\n\nAt a glance: you have ${activeTasks.length} active task${activeTasks.length > 1 ? 's' : ''}, ${eventsToday.length} event${eventsToday.length > 1 ? 's' : ''} today, and your monthly balance is ${formatMoney(revenue - expenses, cur)}.\n\nWhat can I do for you?`;
  }

  if (has('merci', 'thanks', 'thank you', 'choukran')) {
    return fr
      ? 'Avec plaisir ! 😊 Je suis là 24h/24. N\'hésitez pas à me demander un conseil ou un résumé de votre dashboard.'
      : 'You are welcome! 😊 I am here 24/7. Feel free to ask for a tip or a dashboard summary.';
  }

  if (has('budget')) {
    const totalPlanned = state.budget.reduce((s, c) => s + c.planned, 0);
    const totalSpent = state.budget.reduce((s, c) => s + (spentByCat.get(c.name) ?? 0), 0);
    const left = totalPlanned - totalSpent;
    let msg = fr
      ? `📊 Voici votre budget du mois :\n\n• Prévu : ${formatMoney(totalPlanned, cur)}\n• Dépensé : ${formatMoney(totalSpent, cur)}\n• Restant : ${formatMoney(left, cur)} (${totalPlanned > 0 ? percent(totalSpent, totalPlanned) : 0}% utilisé)`
      : `📊 Here is your monthly budget:\n\n• Planned: ${formatMoney(totalPlanned, cur)}\n• Spent: ${formatMoney(totalSpent, cur)}\n• Left: ${formatMoney(left, cur)} (${totalPlanned > 0 ? percent(totalSpent, totalPlanned) : 0}% used)`;
    if (overCats.length > 0) {
      msg +=
        '\n\n⚠️ ' +
        (fr ? 'Catégories dépassées : ' : 'Over budget: ') +
        overCats.map((c) => `${c.name} (+${formatMoney((spentByCat.get(c.name) ?? 0) - c.planned, cur)})`).join(', ');
      msg += fr ? '\n\nConseil : réduisez ces catégories le reste du mois ou ajustez leur budget prévu.' : '\n\nTip: reduce these categories for the rest of the month or adjust their planned budget.';
    } else {
      msg += fr ? '\n\nBravo, tout est sous contrôle ! 👏' : '\n\nWell done, everything is under control! 👏';
    }
    return msg;
  }

  if (has('économis', 'epargn', 'save', 'saving', 'économies')) {
    const savGoals = state.savingsGoals;
    const progressInfo = savGoals.length
      ? savGoals
          .map((g) => `• ${g.name} : ${formatMoney(g.saved, cur)} / ${formatMoney(g.target, cur)} (${percent(g.saved, g.target)}%)`)
          .join('\n')
      : '';
    const topTip = pick(K.finance);
    return fr
      ? `💰 ${progressInfo ? 'Vos objectifs d\'épargne :\n' + progressInfo + '\n\n' : ''}Mes conseils personnalisés :\n\n1. ${topTip}\n2. ${pick(K.finance)}\n3. ${pick(K.finance)}\n\n💡 Avec le simulateur du module Épargne, vous pouvez projeter vos intérêts composés !`
      : `💰 ${progressInfo ? 'Your savings goals:\n' + progressInfo + '\n\n' : ''}My personalized advice:\n\n1. ${topTip}\n2. ${pick(K.finance)}\n3. ${pick(K.finance)}\n\n💡 Use the Savings simulator to project your compound interest!`;
  }

  if (has('planif', 'organis', 'journée', 'plan my day', 'schedule', 'journee')) {
    const taskLines = activeTasks.length
      ? activeTasks
          .sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999'))
          .slice(0, 5)
          .map((x) => `• ${x.title}${x.due ? ` (${formatDate(x.due, state.settings.dateFormat)})` : ''}`)
          .join('\n')
      : (fr ? '• Aucune tâche en attente 🎉' : '• No pending tasks 🎉');
    const eventLines = eventsToday.length
      ? eventsToday.map((e) => `• ${e.time ?? (fr ? 'Toute la journée' : 'All day')} — ${e.title}`).join('\n')
      : (fr ? '• Aucun événement aujourd\'hui' : '• No events today');
    return fr
      ? `🗓️ Plan de la journée ${formatDate(todayISO(), state.settings.dateFormat)} :\n\n📌 Priorités :\n${taskLines}\n\n📅 Agenda du jour :\n${eventLines}\n\n✅ Habitudes déjà cochées aujourd'hui : ${habitsDoneToday}/${state.habits.length}\n\nSuggestion : commencez par la tâche la plus importante pendant 25 minutes (Pomodoro !).`
      : `🗓️ Day plan for ${formatDate(todayISO(), state.settings.dateFormat)}:\n\n📌 Priorities:\n${taskLines}\n\n📅 Today's agenda:\n${eventLines}\n\n✅ Habits checked today: ${habitsDoneToday}/${state.habits.length}\n\nSuggestion: start with the most important task for 25 minutes (Pomodoro!).`;
  }

  if (has('conseil financier', 'financ', 'invest', 'financial', 'money', 'argent', 'dette', 'credit')) {
    const rnd = pick(K.finance);
    return fr ? `💡 Conseil financier du jour :\n\n${rnd}\n\nVous voulez un autre conseil ? Dites "un autre conseil" 😉` : `💡 Financial tip of the day:\n\n${rnd}\n\nWant another one? Just say "another tip" 😉`;
  }

  if (has('productiv', 'focus', 'concentr', 'motivation', 'procrastin')) {
    const rnd = pick(K.productivity);
    return fr ? `⚡ Conseil productivité :\n\n${rnd}` : `⚡ Productivity tip:\n\n${rnd}`;
  }

  if (has('citation', 'quote', 'inspir', 'motiv')) {
    return `✨ ${pick(K.quotes)}`;
  }

  if (has('résum', 'resum', 'point', 'synthèse', 'synth', 'overview', 'summary', 'dashboard', 'tableau')) {
    const balance = revenue - expenses;
    const goalAvg = state.goals.length ? Math.round(state.goals.reduce((s, g) => s + g.progress, 0) / state.goals.length) : 0;
    const savingsTotal = state.savingsGoals.reduce((s, g) => s + g.saved, 0);
    const invTotal = state.investments.reduce((s, x) => s + x.amount, 0);
    return fr
      ? `📈 Le point sur votre dashboard :\n\n💰 Finances du mois :\n• Revenus : ${formatMoney(revenue, cur)}\n• Dépenses : ${formatMoney(expenses, cur)}\n• Solde : ${formatMoney(balance, cur)}\n\n🎯 Objectifs : progression moyenne de ${goalAvg}%\n🏦 Épargne : ${formatMoney(savingsTotal, cur)} cumulée\n📊 Investissements : ${formatMoney(invTotal, cur)}\n✅ Tâches : ${state.tasks.filter((x) => x.done).length}/${state.tasks.length} terminées\n\n${overCats.length ? `⚠️ Attention : ${overCats.length} catégorie(s) de budget dépassée(s).` : 'Tout est sous contrôle 👏'}`
      : `📈 Your dashboard summary:\n\n💰 Monthly finances:\n• Income: ${formatMoney(revenue, cur)}\n• Expenses: ${formatMoney(expenses, cur)}\n• Balance: ${formatMoney(balance, cur)}\n\n🎯 Goals: average progress ${goalAvg}%\n🏦 Savings: ${formatMoney(savingsTotal, cur)} total\n📊 Investments: ${formatMoney(invTotal, cur)}\n✅ Tasks: ${state.tasks.filter((x) => x.done).length}/${state.tasks.length} completed\n\n${overCats.length ? `⚠️ Heads up: ${overCats.length} budget categor${overCats.length > 1 ? 'ies' : 'y'} over limit.` : 'Everything is under control 👏'}`;
  }

  if (has('tâche', 'tache', 'task', 'todo')) {
    const next = activeTasks.sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999'))[0];
    return fr
      ? `✅ Vous avez ${activeTasks.length} tâche(s) en cours.\n\n${next ? `Prochaine échéance : "${next.title}" ${next.due ? `(le ${formatDate(next.due, state.settings.dateFormat)})` : ''}` : 'Rien de pressant, profitez-en !'}\n\nAstuce : filtrez par priorité dans le module Tâches.`
      : `✅ You have ${activeTasks.length} active task(s).\n\n${next ? `Next due: "${next.title}" ${next.due ? `(on ${formatDate(next.due, state.settings.dateFormat)})` : ''}` : 'Nothing pressing, enjoy!'}\n\nTip: filter by priority in the Tasks module.`;
  }

  if (has('météo', 'meteo', 'weather', 'temp', 'pluie', 'rain')) {
    return fr
      ? '🌤️ Consultez le module Météo pour les conditions actuelles et les prévisions à 3 jours. La météo est récupérée en temps réel via Open-Meteo (ou en mode démo si l\'API est indisponible).'
      : '🌤️ Check the Weather module for current conditions and the 3-day forecast. Weather is fetched in real time from Open-Meteo (or demo mode if the API is unavailable).';
  }

  if (has('pomodoro', 'timer', 'minuteur')) {
    return fr
      ? '🍅 La technique Pomodoro : 25 minutes de concentration, 5 minutes de pause. Après 4 cycles, prenez une pause longue (15 min).\n\nRaccourci : appuyez sur "P" pour démarrer/mettre en pause le minuteur !'
      : '🍅 The Pomodoro technique: 25 minutes of focus, 5 minutes of break. After 4 cycles, take a long break (15 min).\n\nShortcut: press "P" to start/pause the timer!';
  }

  if (has('premium', 'abonnement', 'upgrade', 'prix', 'price', 'tarif')) {
    return fr
      ? '👑 L\'offre Premium débloque : IA avancée, rapports PDF/Excel, sync bancaire, cloud, mode famille, intégrations (Google Calendar, Outlook…), PWA hors-ligne, API et support prioritaire.\n\nExplorez le module Premium en bas du dashboard pour tout voir !'
      : '👑 The Premium plan unlocks: advanced AI, PDF/Excel reports, bank sync, cloud, family mode, integrations (Google Calendar, Outlook…), offline PWA, API and priority support.\n\nExplore the Premium module at the bottom of the dashboard to see it all!';
  }

  // Fallback
  const coachLine =
    coach && overCats.length > 0
      ? (fr
          ? `\n\n🎓 Mode Coach : je remarque que ${overCats.map((c) => c.name).join(', ')} dépasse(nt) votre budget. Concentrez vos efforts là-dessus cette semaine.`
          : `\n\n🎓 Coach mode: I notice ${overCats.map((c) => c.name).join(', ')} exceed(s) your budget. Focus your efforts there this week.`)
      : '';
  return (fr ? 'Je n\'ai pas bien compris. 🤔 Essayez :\n\n• "Quel est mon budget ce mois ?"\n• "Aide-moi à planifier ma journée"\n• "Donne-moi un conseil financier"\n• "Fais le point sur mon dashboard"\n• "Une citation motivante ?"' : 'I did not quite understand. 🤔 Try:\n\n• "What is my budget this month?"\n• "Help me plan my day"\n• "Give me a financial tip"\n• "Summarize my dashboard"\n• "A motivational quote?"') + coachLine;
}

/* ── Widget de chat ── */
export function Chatbot() {
  const { t, state, lang, pushChat, clearChat } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const greetedRef = useRef(false);

  const messages = state.chatHistory;
  const suggestions = useMemo(() => SUGGESTED[lang].slice(0, 4), [lang]);

  // Message de bienvenue initial (garde anti-double en StrictMode)
  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;
    if (messages.length === 0) {
      pushChat('bot', t('chat.greeting'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll auto
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing, open]);

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || typing) return;
    setInput('');
    pushChat('user', msg);
    setTyping(true);
    // Délai "réflexion" réaliste
    window.setTimeout(() => {
      const reply = buildReply(msg, state, lang, state.settings.coachMode);
      pushChat('bot', reply);
      setTyping(false);
    }, 900 + Math.random() * 700);
  };

  return (
    <>
      {open && (
        <motion.div
          className="chat-panel"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          role="dialog"
          aria-label={t('chat.title')}
        >
          <div className="chat-head">
            <div style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center' }}>
              <Bot size={22} />
              <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#7fd39a', border: '2px solid #495057' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="ch-name">{t('chat.title')}</div>
              <div className="ch-status">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7fd39a' }} />
                {t('chat.status')}
              </div>
            </div>
            {state.settings.coachMode && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,.16)', padding: '4px 9px', borderRadius: 99 }}>
                <Sparkles size={12} /> {t('chat.coach')}
              </span>
            )}
            <button
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 6 }}
              onClick={() => setConfirmClear(true)}
              aria-label={t('chat.clear')}
            >
              <Trash2 size={15} />
            </button>
            <button
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 6 }}
              onClick={() => setOpen(false)}
              aria-label={t('act.close')}
            >
              <X size={17} />
            </button>
          </div>

          <div className="chat-chips">
            {suggestions.map((s) => (
              <button key={s} className="chip" style={{ flex: 'none', fontSize: 11 }} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.role}`}>
                {m.text}
                <span className="cm-time">
                  {new Date(m.time).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {typing && (
              <div className="chat-typing" aria-label={t('chat.typing')}>
                <span /><span /><span />
              </div>
            )}
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              value={input}
              placeholder={t('chat.placeholder')}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              aria-label={t('chat.placeholder')}
            />
            <button className="chat-send" onClick={() => send()} disabled={!input.trim() || typing} style={{ opacity: !input.trim() || typing ? 0.5 : 1 }} aria-label="Send">
              <Send size={16} />
            </button>
          </div>
        </motion.div>
      )}

      <button
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('chat.open')}
      >
        {open ? <X size={24} /> : <MessageSquare size={24} />}
        {!open && <span className="fab-dot" />}
      </button>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearChat();
          pushChat('bot', t('chat.greeting'));
        }}
        title={t('chat.clear')}
        message={t('chat.clearConfirm')}
        confirmLabel={t('chat.clear')}
      />
    </>
  );
}
