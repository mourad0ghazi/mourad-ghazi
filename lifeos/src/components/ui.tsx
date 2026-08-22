// ─────────────────────────────────────────────────────────────
// LifeOS – Composants UI réutilisables
// Modal, Toggle, AnimatedNumber, Ripple, ConfirmDialog, etc.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

/* ── Ripple effect sur boutons ── */
export function rippleHandler(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.1;
  const ink = document.createElement('span');
  ink.className = 'ripple-ink';
  ink.style.width = ink.style.height = `${size}px`;
  ink.style.left = `${e.clientX - rect.left - size / 2}px`;
  ink.style.top = `${e.clientY - rect.top - size / 2}px`;
  el.appendChild(ink);
  window.setTimeout(() => ink.remove(), 650);
}

/* ── Modal ── */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className={`modal ${size === 'lg' ? 'lg' : ''}`}
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.92, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>
        {children}
        {footer && <div className="modal-foot">{footer}</div>}
      </motion.div>
    </div>
  );
}

/* ── Toggle switch ── */
export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={`switch ${on ? 'on' : ''}`}
      role="switch"
      aria-checked={on}
      aria-label={label ?? 'toggle'}
      onClick={(e) => {
        rippleHandler(e);
        onChange(!on);
      }}
    />
  );
}

/* ── Compteur animé (0 → valeur, 1.4s, easing out) ── */
export function AnimatedNumber({
  value,
  format,
  duration = 1400,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    prev.current = value;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return <span>{format(display)}</span>;
}

/* ── Barre de progression animée ── */
export function ProgressBar({
  value,
  color = 'accent',
  height = 8,
}: {
  value: number; // 0..100
  color?: 'accent' | 'success' | 'warning' | 'danger';
  height?: number;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(Math.min(100, Math.max(0, value))));
    return () => cancelAnimationFrame(id);
  }, [value]);
  const cls = color === 'accent' ? '' : color;
  return (
    <div className="progress-track" style={{ height }} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`progress-fill ${cls}`} style={{ width: `${w}%` }} />
    </div>
  );
}

/* ── Skeleton ── */
export function Skeleton({ w, h, style }: { w?: string; h: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width: w ?? '100%', height: h, ...style }} />;
}

/* ── Empty state ── */
export function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="empty-state">
      {icon}
      <span>{text}</span>
    </div>
  );
}

/* ── Dialog de confirmation ── */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}) {
  const { t } = useApp();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={17} style={{ color: 'var(--warning)' }} /> {title}
        </span>
      }
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>
            {t('act.cancel')}
          </button>
          <button
            className="btn danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel ?? t('act.delete')}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: 13.5 }}>{message}</p>
    </Modal>
  );
}

/* ── En-tête de widget (titre + icône + actions) ── */
export function WidgetHead({
  icon,
  title,
  sub,
  actions,
  className = '',
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`widget-head wh-card-titlebar ${className}`}>
      <span className="wh-icon">{icon}</span>
      <span>
        <span className="wh-title">{title}</span>
        {sub && (
          <>
            <br />
            <span className="wh-sub">{sub}</span>
          </>
        )}
      </span>
      {actions && <span className="wh-actions">{actions}</span>}
    </div>
  );
}

/* ── Hook : détection media query ── */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

/* ── Hook : scroll reveal (IntersectionObserver) ── */
export function useReveal<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('revealed');
            obs.unobserve(en.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}
