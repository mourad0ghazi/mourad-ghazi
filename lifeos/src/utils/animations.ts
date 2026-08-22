// ─────────────────────────────────────────────────────────────
// LifeOS – Variants Framer Motion centralisés (spec §2.5 / §9.3)
// ─────────────────────────────────────────────────────────────

import type { Variants } from 'framer-motion';

const EASE = [0.4, 0, 0.2, 1] as const;
const SPRING = { type: 'spring', stiffness: 380, damping: 30 } as const;

/** 0.5s ease-out, translateY 20px */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Container avec stagger 0.1s entre enfants */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: EASE } },
};

export const slideInRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

export const slideInBottom: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 340, damping: 28 } },
};

/** Hover des cartes (scale 1.02 + ombre) */
export const cardHover = {
  rest: { scale: 1, transition: { duration: 0.15, ease: 'easeOut' } },
  hover: { scale: 1.02, transition: { duration: 0.15, ease: 'easeOut' } },
};

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: SPRING },
  exit: { opacity: 0, scale: 0.95, y: 10 },
};

export const toastVariants: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 32 } },
  exit: { x: 100, opacity: 0 },
};

export const messageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

/** Point de frappe du chatbot (rebond infini) */
export const typingDot = {
  animate: {
    y: [0, -4, 0],
    transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
  },
};

/** Compteurs animés (2000ms ease-out) */
export const counterVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 2, ease: 'easeOut' } },
};

/** Transition entre pages (0.32s) */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.22, ease: EASE } },
};
