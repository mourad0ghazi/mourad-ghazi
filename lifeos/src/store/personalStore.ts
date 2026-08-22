// ─────────────────────────────────────────────────────────────
// LifeOS – Store vie personnelle (tâches, notes, habitudes,
// journal, objectifs, événements)
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CalendarEvent,
  Goal,
  Habit,
  JournalEntry,
  Milestone,
  Note,
  Subtask,
  Task,
  TaskStatus,
} from '../types';
import { initialPersonalSlice } from '../data/initialData';
import { uid } from '../utils/helpers';

interface PersonalState {
  tasks: Task[];
  notes: Note[];
  habits: Habit[];
  journal: JournalEntry[];
  goals: Goal[];
  events: CalendarEvent[];
  // Tâches
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'done' | 'status' | 'tags' | 'subtasks'> & Partial<Task>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  reorderTask: (from: number, to: number) => void;
  reorderTasks: (ordered: Task[]) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  // Notes
  addNote: (n?: Partial<Note>) => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  // Habitudes
  addHabit: (h: Omit<Habit, 'id' | 'days' | 'missed'>) => void;
  deleteHabit: (id: string) => void;
  cycleHabitDay: (id: string, date: string) => void; // vide → fait → manqué → vide
  toggleHabitDay: (id: string, date: string) => void; // rétro-compat
  // Journal
  upsertJournal: (entry: Omit<JournalEntry, 'id'> & { id?: string }) => void;
  deleteJournal: (id: string) => void;
  // Objectifs
  addGoal: (g: Omit<Goal, 'id' | 'milestones'>) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addMilestone: (goalId: string, label: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  // Événements
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  resetPersonal: () => void;
}

export const usePersonalStore = create<PersonalState>()(
  persist(
    (set) => ({
      ...initialPersonalSlice,
      addTask: (t) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              title: t.title,
              priority: t.priority ?? 'medium',
              due: t.due,
              done: false,
              status: 'todo',
              tags: t.tags ?? [],
              subtasks: t.subtasks ?? [],
              id: uid(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) })),
      setTaskStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((x) =>
            x.id === id ? { ...x, status, done: status === 'done' } : x,
          ),
        })),
      reorderTask: (from, to) =>
        set((s) => {
          const tasks = [...s.tasks];
          const [moved] = tasks.splice(from, 1);
          tasks.splice(to, 0, moved);
          return { tasks };
        }),
      reorderTasks: (ordered) => set({ tasks: ordered }),
      addSubtask: (taskId, title) =>
        set((s) => ({
          tasks: s.tasks.map((x) =>
            x.id === taskId
              ? { ...x, subtasks: [...x.subtasks, { id: uid(), title, done: false }] }
              : x,
          ),
        })),
      toggleSubtask: (taskId, subtaskId) =>
        set((s) => ({
          tasks: s.tasks.map((x) =>
            x.id === taskId
              ? { ...x, subtasks: x.subtasks.map((st) => (st.id === subtaskId ? { ...st, done: !st.done } : st)) }
              : x,
          ),
        })),
      deleteSubtask: (taskId, subtaskId) =>
        set((s) => ({
          tasks: s.tasks.map((x) =>
            x.id === taskId ? { ...x, subtasks: x.subtasks.filter((st) => st.id !== subtaskId) } : x,
          ),
        })),
      addNote: (n) => {
        const id = uid();
        set((s) => ({
          notes: [
            ...s.notes,
            {
              id,
              title: n?.title ?? '',
              content: n?.content ?? '',
              updatedAt: new Date().toISOString().slice(0, 10),
            },
          ],
        }));
        return id;
      },
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((x) =>
            x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : x,
          ),
        })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((x) => x.id !== id) })),
      addHabit: (h) =>
        set((s) => ({ habits: [...s.habits, { ...h, id: uid(), days: {}, missed: {} }] })),
      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((x) => x.id !== id) })),
      cycleHabitDay: (id, date) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const days = { ...h.days };
            const missed = { ...h.missed };
            if (days[date]) {
              delete days[date];
              missed[date] = true; // fait → manqué
            } else if (missed[date]) {
              delete missed[date]; // manqué → vide
            } else {
              days[date] = true; // vide → fait
            }
            return { ...h, days, missed };
          }),
        })),
      toggleHabitDay: (id, date) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const days = { ...h.days };
            if (days[date]) delete days[date];
            else days[date] = true;
            return { ...h, days };
          }),
        })),
      upsertJournal: (entry) =>
        set((s) => {
          if (entry.id) {
            return { journal: s.journal.map((x) => (x.id === entry.id ? { ...x, ...entry } : x)) };
          }
          return { journal: [...s.journal, { ...entry, id: uid() }] };
        }),
      deleteJournal: (id) => set((s) => ({ journal: s.journal.filter((x) => x.id !== id) })),
      addGoal: (g) => set((s) => ({ goals: [...s.goals, { ...g, id: uid(), milestones: [] }] })),
      updateGoal: (id, patch) =>
        set((s) => ({ goals: s.goals.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((x) => x.id !== id) })),
      addMilestone: (goalId, label) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId ? { ...g, milestones: [...g.milestones, { id: uid(), label, done: false }] } : g,
          ),
        })),
      toggleMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? { ...g, milestones: g.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m)) }
              : g,
          ),
        })),
      deleteMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId ? { ...g, milestones: g.milestones.filter((m) => m.id !== milestoneId) } : g,
          ),
        })),
      addEvent: (e) => set((s) => ({ events: [...s.events, { ...e, id: uid() }] })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((x) => x.id !== id) })),
      resetPersonal: () => set({ ...initialPersonalSlice }),
    }),
    { name: 'lifeos:v2:personal', version: 1 },
  ),
);
