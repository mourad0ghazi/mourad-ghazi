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
import { useChatbot } from '../../hooks/useChatbot';
import { KNOWLEDGE, SUGGESTED } from '../../data/knowledge';
import { formatDate, formatMoney, monthKey, percent, todayISO } from '../../utils/helpers';
import { messageVariants, slideInBottom } from '../../utils/animations';
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

  if (has('au revoir', 'bye', 'adieu', 'goodbye', 'besslama', 'à plus', 'a plus')) {
    return fr
      ? 'Au revoir ! 👋 Pensez à cocher vos habitudes aujourd\'hui. Je reste là si vous avez besoin de conseils.'
      : 'Goodbye! 👋 Do not forget to check your habits today. I am here whenever you need advice.';
  }

  if (has('aide', 'help', 'que peux', 'what can you do', 'commandes', 'instructions')) {
    return fr
      ? 'Voici ce que je peux faire pour vous :\n\n• "Quel est mon budget ce mois ?" — analyse du budget\n• "Aide-moi à planifier ma journée" — plan basé sur vos tâches\n• "Donne-moi un conseil financier" — conseils épargne/investissement\n• "Un conseil de productivité ?" — méthodes et habitudes\n• "Fais le point sur mon dashboard" — synthèse complète\n• "Une citation motivante ?" — inspiration\n• "Savais-tu ?" — faits éducatifs'
      : 'Here is what I can do for you:\n\n• "What is my budget this month?" — budget analysis\n• "Help me plan my day" — plan based on your tasks\n• "Give me a financial tip" — saving/investing advice\n• "A productivity tip?" — methods and habits\n• "Summarize my dashboard" — full overview\n• "A motivational quote?" — inspiration\n• "Did you know?" — educational facts';
  }

  if (has('savais', 'did you know', 'fact', 'fait', 'apprendre', 'curiosit', 'info intéressante', 'interesting')) {
    return pick(K.facts);
  }

  if (has('revenus', 'revenue', 'income', 'gagner', 'salaire', 'salary')) {
    const incomes = monthTx.filter((x) => x.type === 'income');
    const detail = incomes
      .slice(0, 5)
      .map((x) => `• ${x.label} : ${formatMoney(x.amount, cur)} (${formatDate(x.date, state.settings.dateFormat)})`)
      .join('\n');
    return fr
      ? `💵 Vos revenus ce mois : ${formatMoney(revenue, cur)} sur ${incomes.length} entrée(s).\n\n${detail}${incomes.length > 5 ? `\n• …et ${incomes.length - 5} autre(s)` : ''}\n\n💡 Astuce : diversifiez vos sources de revenus (salaire + freelance + investissements).`
      : `💵 Your income this month: ${formatMoney(revenue, cur)} across ${incomes.length} entr${incomes.length > 1 ? 'ies' : 'y'}.\n\n${detail}${incomes.length > 5 ? `\n• …and ${incomes.length - 5} more` : ''}\n\n💡 Tip: diversify your income streams (salary + freelance + investments).`;
  }

  if (has('dépenses', 'depenses', 'expenses', 'spending', 'depensé', 'spent')) {
    const topCat = [...spentByCat.entries()].sort((a, b) => b[1] - a[1])[0];
    return fr
      ? `💸 Vous avez dépensé ${formatMoney(expenses, cur)} ce mois.\n\n${topCat ? `Plus grosse catégorie : ${topCat[0]} (${formatMoney(topCat[1], cur)}).` : ''}\n\n${overCats.length > 0 ? `⚠️ ${overCats.length} catégorie(s) dépassent leur budget : ${overCats.map((c) => c.name).join(', ')}.` : 'Aucun dépassement de budget 👏'}`
      : `💸 You have spent ${formatMoney(expenses, cur)} this month.\n\n${topCat ? `Biggest category: ${topCat[0]} (${formatMoney(topCat[1], cur)}).` : ''}\n\n${overCats.length > 0 ? `⚠️ ${overCats.length} categor${overCats.length > 1 ? 'ies' : 'y'} over budget: ${overCats.map((c) => c.name).join(', ')}.` : 'No budget overruns 👏'}`;
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

/** Message proactif du coach basé sur les données réelles */
export function buildCoachMessage(state: AppState, lang: 'fr' | 'en'): string {
  const fr = lang === 'fr';
  const K = KNOWLEDGE[lang];
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const cur = state.settings.currency;
  const thisMonth = monthKey(todayISO());
  const spentByCat = new Map<string, number>();
  state.transactions
    .filter((x) => x.type === 'expense' && monthKey(x.date) === thisMonth)
    .forEach((x) => spentByCat.set(x.category, (spentByCat.get(x.category) ?? 0) + x.amount));
  const overCats = state.budget.filter((c) => (spentByCat.get(c.name) ?? 0) > c.planned);
  const overdue = state.tasks.filter((x) => !x.done && x.due && x.due < todayISO());
  const dueToday = state.tasks.filter((x) => !x.done && x.due === todayISO()).length;

  const parts: string[] = [];
  if (overCats.length > 0) {
    parts.push(
      fr
        ? `⚠️ Budget : ${overCats.map((c) => `« ${c.name} » dépassé de ${formatMoney((spentByCat.get(c.name) ?? 0) - c.planned, cur)}`).join(', ')}.`
        : `⚠️ Budget: ${overCats.map((c) => `"${c.name}" over by ${formatMoney((spentByCat.get(c.name) ?? 0) - c.planned, cur)}`).join(', ')}.`,
    );
  }
  if (overdue.length > 0) {
    parts.push(
      fr
        ? `⏰ ${overdue.length} tâche(s) en retard : ${overdue.slice(0, 2).map((t) => `« ${t.title} »`).join(', ')}.`
        : `⏰ ${overdue.length} overdue task(s): ${overdue.slice(0, 2).map((t) => `"${t.title}"`).join(', ')}.`,
    );
  } else if (dueToday > 0) {
    parts.push(fr ? `📌 ${dueToday} tâche(s) à finaliser aujourd'hui.` : `📌 ${dueToday} task(s) due today.`);
  }
  if (parts.length === 0) {
    parts.push(fr ? pick(K.finance) : pick(K.finance));
  } else {
    parts.push(fr ? `💡 Conseil du jour : ${pick(K.finance)}` : `💡 Tip of the day: ${pick(K.finance)}`);
  }
  const header = fr ? '🎓 Coach LifeOS — point du jour :' : '🎓 LifeOS Coach — daily check-in:';
  return `${header}\n\n${parts.map((p) => `• ${p}`).join('\n')}`;
}

/* ── Widget de chat ── */
export function Chatbot() {
  const { t, state, lang, pushChat, clearChat, setChatUnread, chatUnread, coachLastAt, setCoachLastAt } = useApp();
  const { typing, send, cancel } = useChatbot();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const greetedRef = useRef(false);
  const coachRef = useRef(false);

  const messages = state.chatHistory;
  const unread = chatUnread;
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

  // Coach proactif : analyse selon la fréquence configurée
  useEffect(() => {
    if (coachRef.current) return;
    coachRef.current = true;
    const s = state.settings;
    if (!s.coachMode || !s.notifications || s.coachFreq === 'never') return;
    const now = new Date();
    const [h, m] = (s.coachTime || '09:00').split(':').map(Number);
    const targetTime = new Date(now);
    targetTime.setHours(h || 9, m || 0, 0, 0);
    if (now < targetTime) return; // pas encore l'heure configurée
    const last = coachLastAt ? new Date(coachLastAt) : null;
    const due =
      !last ||
      (s.coachFreq === 'daily' && now.toDateString() !== last.toDateString()) ||
      (s.coachFreq === 'weekly' && now.getTime() - last.getTime() > 6 * 86400000);
    if (!due) return;
    setCoachLastAt(now.toISOString());
    pushChat('bot', buildCoachMessage(state, lang));
    setChatUnread(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Raccourci Ctrl+/ : ouvrir/fermer l'assistant
  useEffect(() => {
    const handler = () => {
      setOpen((o) => {
        if (!o) setChatUnread(0);
        return !o;
      });
    };
    window.addEventListener('lifeos:chat-toggle', handler);
    return () => window.removeEventListener('lifeos:chat-toggle', handler);
  }, [setChatUnread]);

  // Annule le timer de frappe au démontage
  useEffect(() => cancel, [cancel]);

  // Scroll auto
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing, open]);

  // Marquer comme lu à l'ouverture
  useEffect(() => {
    if (open) setChatUnread(0);
  }, [open, setChatUnread]);

  const sendMessage = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || typing) return;
    setInput('');
    send(msg);
  };

  return (
    <>
      {open && (
        <motion.div
          className="chat-panel"
          variants={slideInBottom}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-label={t('chat.title')}
        >
          <div className="chat-head">
            <div style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              <img src={`${import.meta.env.BASE_URL}assets/avatar-bot.png`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
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
              <button key={s} className="chip" style={{ flex: 'none', fontSize: 11 }} onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.map((m) => (
              <motion.div key={m.id} className={`chat-msg ${m.role}`} variants={messageVariants} initial="hidden" animate="visible">
                {m.text}
                <span className="cm-time">
                  {new Date(m.time).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            ))}
            {typing && (
              <div className="chat-typing" aria-label={t('chat.typing')}>
                <span /><span /><span />
              </div>
            )}
          </div>

          <div className="chat-input-row">
            <textarea
              ref={textareaRef}
              className="chat-input"
              rows={1}
              placeholder={t('chat.placeholder')}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // auto-grow jusqu'à 3 lignes max
                const el = e.target;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 76)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              aria-label={t('chat.placeholder')}
            />
            <button className="chat-send" onClick={() => sendMessage()} disabled={!input.trim() || typing} style={{ opacity: !input.trim() || typing ? 0.5 : 1 }} aria-label="Send">
              <Send size={16} />
            </button>
          </div>
        </motion.div>
      )}

      <button
        className="chat-fab"
        onClick={() => {
          setOpen((o) => {
            if (!o) setChatUnread(0);
            return !o;
          });
        }}
        aria-label={t('chat.open')}
      >
        {open ? <X size={24} /> : <MessageSquare size={24} />}
        {!open && (unread > 0 ? (
          <span
            className="fab-badge"
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 20,
              height: 20,
              padding: '0 5px',
              borderRadius: 99,
              background: 'var(--danger)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 800,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {unread}
          </span>
        ) : (
          <span className="fab-dot" />
        ))}
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
