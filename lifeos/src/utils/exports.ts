// ─────────────────────────────────────────────────────────────
// LifeOS – Exports réels : iCalendar (.ics), Excel (.xls),
// Markdown (.md), fichiers binaires
// ─────────────────────────────────────────────────────────────

import type { CalendarEvent, Note, Task } from '../types';

export function downloadBlob(filename: string, content: string | Blob, mime: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const escIcs = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/** Export iCalendar des événements (importable dans Google Calendar, Outlook, Apple…) */
export function exportEventsIcs(events: CalendarEvent[], filename = 'lifeos-events.ics'): void {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LifeOS//FR//FR',
    'CALSCALE:GREGORIAN',
  ];
  events.forEach((e, i) => {
    const date = e.date.replace(/-/g, '');
    const dtstart = e.time ? `${date}T${e.time.replace(':', '')}00` : date;
    lines.push(
      'BEGIN:VEVENT',
      `UID:lifeos-${i}-${e.id}@lifeos.local`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART${e.time ? '' : ';VALUE=DATE'}:${dtstart}${e.time ? '' : ''}`,
      `SUMMARY:${escIcs(e.title)}`,
    );
    if (e.note) lines.push(`DESCRIPTION:${escIcs(e.note)}`);
    if (e.time) {
      // événement d'une heure
      const [h, m] = e.time.split(':').map(Number);
      const end = new Date(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8)), h, m + 60);
      const endStr = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, '0')}${String(end.getDate()).padStart(2, '0')}T${String(end.getHours()).padStart(2, '0')}${String(end.getMinutes()).padStart(2, '0')}00`;
      lines.push(`DTEND:${endStr}`);
    }
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  downloadBlob(filename, lines.join('\r\n') + '\r\n', 'text/calendar;charset=utf-8');
}

/** Export Excel (.xls) : HTML table reconnu par Excel */
export function exportExcel(rows: Record<string, string | number>[], filename = 'lifeos-export.xls'): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: string | number) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>LifeOS</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table border="1"><tr>${headers
    .map((h) => `<th style="background:#f1f3f5">${esc(h)}</th>`)
    .join('')}</tr>${rows.map((r) => `<tr>${headers.map((h) => `<td>${esc(r[h])}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
  downloadBlob(filename, '\uFEFF' + html, 'application/vnd.ms-excel;charset=utf-8');
}

/** Export Markdown des notes (importable dans Notion, Obsidian…) */
export function exportNotesMarkdown(notes: Note[], filename = 'lifeos-notes.md'): void {
  const md = notes
    .map((n) => {
      const tags = n.tags.length ? `\n\n_Tags : ${n.tags.map((t) => `#${t}`).join(' ')}_` : '';
      const date = n.updatedAt ? `\n\n_Modifiée le ${n.updatedAt}_` : '';
      return `# ${n.title || 'Note sans titre'}\n\n${n.content}${tags}${date}`;
    })
    .join('\n\n---\n\n');
  downloadBlob(filename, md, 'text/markdown;charset=utf-8');
}

/** Export CSV des tâches (importable dans Trello via l'import CSV) */
export function exportTasksCsv(tasks: Task[], filename = 'lifeos-tasks.csv'): void {
  const csv = [
    'Card Name,List,Labels,Due Date',
    ...tasks.map((t) => {
      const list = t.status === 'done' ? 'Terminé' : t.status === 'doing' ? 'En cours' : 'À faire';
      const labels = [t.priority, ...t.tags].filter(Boolean).join(';');
      return `"${t.title.replace(/"/g, '""')}","${list}","${labels}","${t.due ?? ''}"`;
    }),
  ].join('\n');
  downloadBlob(filename, '\uFEFF' + csv, 'text/csv;charset=utf-8');
}

/** Conversion hex → rgba pour les accents personnalisés */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return `rgba(108,117,125,${alpha})`;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
