import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CalendarEvent, Goal, Habit, JournalEntry, Note, Task, TaskStatus } from '../types'
import { initialEvents, initialGoals, initialHabits, initialJournal, initialNotes, initialTasks } from '../data/initialData'

interface PersonalState {
  tasks: Task[]
  notes: Note[]
  habits: Habit[]
  journal: JournalEntry[]
  goals: Goal[]
  events: CalendarEvent[]
  addTask: (title: string, extra?: Partial<Task>) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  setTaskStatus: (id: string, status: TaskStatus) => void
  removeTask: (id: string) => void
  reorderTasks: (from: number, to: number) => void
  addNote: () => void
  updateNote: (id: string, patch: Partial<Note>) => void
  removeNote: (id: string) => void
  addHabit: (name: string) => void
  toggleHabit: (id: string, date: string) => void
  removeHabit: (id: string) => void
  addJournal: (content: string, mood: number) => void
  removeJournal: (id: string) => void
  addGoal: (value: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  removeGoal: (id: string) => void
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void
  removeEvent: (id: string) => void
  reset: () => void
}

export const usePersonalStore = create<PersonalState>()(persist((set) => ({
  tasks: initialTasks, notes: initialNotes, habits: initialHabits, journal: initialJournal, goals: initialGoals, events: initialEvents,
  addTask: (title, extra = {}) => set((state) => ({ tasks: [{ id: crypto.randomUUID(), title, status: 'todo', priority: 'medium', dueDate: new Date().toISOString().slice(0, 10), category: 'Personnel', tags: [], subtasks: [], ...extra }, ...state.tasks] })),
  updateTask: (id, patch) => set((state) => ({ tasks: state.tasks.map((task) => task.id === id ? { ...task, ...patch } : task) })),
  setTaskStatus: (id, status) => set((state) => ({ tasks: state.tasks.map((task) => task.id === id ? { ...task, status } : task) })),
  removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
  reorderTasks: (from, to) => set((state) => { const tasks = [...state.tasks]; const [item] = tasks.splice(from, 1); tasks.splice(to, 0, item); return { tasks } }),
  addNote: () => set((state) => ({ notes: [{ id: crypto.randomUUID(), title: 'Nouvelle note', content: '', updatedAt: new Date().toISOString(), pinned: false }, ...state.notes] })),
  updateNote: (id, patch) => set((state) => ({ notes: state.notes.map((note) => note.id === id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note) })),
  removeNote: (id) => set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
  addHabit: (name) => set((state)=>({habits:[...state.habits,{id:crypto.randomUUID(),name,icon:'◇',done:{},missed:{},streak:0,bestStreak:0}]})),
  toggleHabit: (id, date) => set((state) => ({ habits: state.habits.map((habit) => { if(habit.id!==id)return habit; const isDone=!!habit.done[date], isMissed=!!habit.missed[date]; return { ...habit, done:{...habit.done,[date]:!isDone&&!isMissed}, missed:{...habit.missed,[date]:isDone} } }) })),
  removeHabit: (id) => set((state)=>({habits:state.habits.filter(habit=>habit.id!==id)})),
  addJournal: (content, mood) => set((state) => ({ journal: [{ id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), content, mood }, ...state.journal.filter((entry) => entry.date !== new Date().toISOString().slice(0, 10))] })),
  removeJournal: (id) => set((state) => ({ journal: state.journal.filter((entry) => entry.id !== id) })),
  addGoal: (value) => set((state)=>({goals:[...state.goals,{...value,id:crypto.randomUUID()}]})),
  updateGoal: (id, patch) => set((state) => ({ goals: state.goals.map((goal) => goal.id === id ? { ...goal, ...patch } : goal) })),
  removeGoal: (id) => set((state)=>({goals:state.goals.filter((goal)=>goal.id!==id)})),
  addEvent: (event) => set((state) => ({ events: [...state.events, { ...event, id: crypto.randomUUID() }] })),
  updateEvent: (id, patch) => set((state) => ({ events: state.events.map((event)=>event.id===id?{...event,...patch}:event) })),
  removeEvent: (id) => set((state) => ({ events: state.events.filter((event) => event.id !== id) })),
  reset: () => set({ tasks: initialTasks, notes: initialNotes, habits: initialHabits, journal: initialJournal, goals: initialGoals, events: initialEvents }),
}), { name: 'lifeos:v2:personal' }))
