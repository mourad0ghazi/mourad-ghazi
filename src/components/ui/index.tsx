import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion'
import { Check, GripVertical, MoreHorizontal, X } from 'lucide-react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

export function Button({ className, variant = 'primary', size = 'md', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'icon' }) {
  return <button className={twMerge('button', `button-${variant}`, `button-${size}`, className)} {...props}>{children}</button>
}

export function IconButton({ label, className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button className={twMerge('icon-button', className)} aria-label={label} title={label} {...props}>{children}</button>
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={twMerge('input', className)} {...props} />
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={twMerge('input select', className)} {...props}>{children}</select>
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`toggle ${checked ? 'checked' : ''}`} onClick={() => onChange(!checked)}><span /></button>
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'free' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function Progress({ value, tone = 'accent', label }: { value: number; tone?: 'accent' | 'success' | 'warning' | 'danger'; label?: string }) {
  const safe = Math.max(0, Math.min(100, value))
  return <div className="progress" aria-label={label} aria-valuenow={safe} role="progressbar"><motion.span className={`progress-${tone}`} initial={{ width: 0 }} animate={{ width: `${safe}%` }} transition={{ duration: .8, ease: 'easeOut' }} /></div>
}

export function AnimatedNumber({ value, formatter = (n) => Math.round(n).toLocaleString('fr-FR') }: { value: number; formatter?: (value: number) => string }) {
  const spring = useSpring(0, { duration: 1400, bounce: 0 })
  const display = useTransform(spring, (current) => formatter(current))
  useEffect(() => { spring.set(value) }, [spring, value])
  return <motion.span>{display}</motion.span>
}

export function Widget({ id, title, icon, children, action, className }: { id: string; title: string; icon: ReactNode; children: ReactNode; action?: ReactNode; className?: string }) {
  return <motion.section id={`module-${id}`} className={twMerge('widget', className)} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: .35 }}>
    <header className="widget-header drag-handle">
      <span className="drag-icon"><GripVertical size={15} /></span>
      <span className="widget-icon">{icon}</span>
      <h2>{title}</h2>
      <div className="widget-actions">{action ?? <MoreHorizontal size={18} />}</div>
    </header>
    <div className="widget-body">{children}</div>
  </motion.section>
}

export function Modal({ open, onClose, title, children, width = '540px' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; width?: string }) {
  useEffect(() => {
    const key = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [open, onClose])
  return <AnimatePresence>{open && <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <motion.div className="modal" style={{ maxWidth: width }} initial={{ opacity: 0, scale: .96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .97, y: 10 }} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <header><h2 id="modal-title">{title}</h2><IconButton label="Fermer" onClick={onClose}><X size={19} /></IconButton></header>
      <div className="modal-content">{children}</div>
    </motion.div>
  </motion.div>}</AnimatePresence>
}

export function Tabs({ tabs, value, onChange }: { tabs: { id: string; label: string; icon?: ReactNode }[]; value: string; onChange: (id: string) => void }) {
  return <div className="tabs" role="tablist">{tabs.map((tab) => <button key={tab.id} role="tab" aria-selected={value === tab.id} className={value === tab.id ? 'active' : ''} onClick={() => onChange(tab.id)}>{tab.icon}{tab.label}</button>)}</div>
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return <div className="empty-state">{icon}<strong>{title}</strong><p>{text}</p>{action}</div>
}

export function CheckButton({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return <button className={`check-button ${checked ? 'checked' : ''}`} onClick={onClick} aria-label={label} aria-pressed={checked}>{checked && <Check size={13} />}</button>
}
