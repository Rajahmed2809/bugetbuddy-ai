'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Profile,
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  RecurringTransaction,
  Notification,
  UserPreferences,
  ViewName,
  AppView,
  ChatMessage,
  Theme,
} from './types'
import { DEFAULT_CATEGORIES } from './types'
import { generateId } from './format'

// Demo seed data
function generateDemoTransactions(): Transaction[] {
  const now = new Date()
  const txs: Transaction[] = []
  const templates: Array<Omit<Transaction, 'id' | 'createdAt'>> = [
    { type: 'income', name: 'Acme Studio Salary', amount: 4800, date: new Date(now.getFullYear(), now.getMonth(), 1, 9, 0).toISOString(), category: 'Salary', paymentMethod: 'Bank Transfer' },
    { type: 'expense', name: 'Whole Foods Market', amount: 86.4, date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 42).toISOString(), category: 'Groceries', paymentMethod: 'Card' },
    { type: 'expense', name: 'Notion Subscription', amount: 12, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 16, 15).toISOString(), category: 'Subscriptions', paymentMethod: 'Card' },
    { type: 'expense', name: 'Uber Ride', amount: 24.7, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 8, 32).toISOString(), category: 'Transport', paymentMethod: 'Digital Wallet' },
    { type: 'expense', name: 'Spotify Premium', amount: 10.99, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 12, 0).toISOString(), category: 'Subscriptions', paymentMethod: 'Card' },
    { type: 'expense', name: 'Blue Bottle Coffee', amount: 6.5, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 9, 15).toISOString(), category: 'Food & Dining', paymentMethod: 'Card' },
    { type: 'expense', name: 'Apartment Rent', amount: 1240, date: new Date(now.getFullYear(), now.getMonth(), 5, 10, 0).toISOString(), category: 'Housing', paymentMethod: 'Bank Transfer', isRecurring: true },
    { type: 'expense', name: 'Trader Joes', amount: 54.2, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 18, 30).toISOString(), category: 'Groceries', paymentMethod: 'Card' },
    { type: 'expense', name: 'Netflix', amount: 15.49, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4, 0, 0).toISOString(), category: 'Subscriptions', paymentMethod: 'Card' },
    { type: 'expense', name: 'Shell Gas Station', amount: 48.3, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 14, 20).toISOString(), category: 'Transport', paymentMethod: 'Card' },
    { type: 'income', name: 'Freelance Project', amount: 850, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 11, 0).toISOString(), category: 'Freelance', paymentMethod: 'Bank Transfer' },
    { type: 'expense', name: 'Sweetgreen', amount: 14.75, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 13, 10).toISOString(), category: 'Food & Dining', paymentMethod: 'Card' },
    { type: 'expense', name: 'Amazon Purchase', amount: 32.99, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 20, 0).toISOString(), category: 'Shopping', paymentMethod: 'Card' },
    { type: 'expense', name: 'Gym Membership', amount: 39.99, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8, 6, 0).toISOString(), category: 'Health', paymentMethod: 'Card', isRecurring: true },
    { type: 'expense', name: 'Movie Tickets', amount: 28, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 9, 19, 30).toISOString(), category: 'Entertainment', paymentMethod: 'Card' },
    // Last month
    { type: 'income', name: 'Acme Studio Salary', amount: 4800, date: new Date(now.getFullYear(), now.getMonth() - 1, 1, 9, 0).toISOString(), category: 'Salary', paymentMethod: 'Bank Transfer' },
    { type: 'expense', name: 'Apartment Rent', amount: 1240, date: new Date(now.getFullYear(), now.getMonth() - 1, 5, 10, 0).toISOString(), category: 'Housing', paymentMethod: 'Bank Transfer', isRecurring: true },
    { type: 'expense', name: 'Whole Foods Market', amount: 124.3, date: new Date(now.getFullYear(), now.getMonth() - 1, 12, 11, 0).toISOString(), category: 'Groceries', paymentMethod: 'Card' },
    { type: 'expense', name: 'Electric Bill', amount: 89.5, date: new Date(now.getFullYear(), now.getMonth() - 1, 18, 10, 0).toISOString(), category: 'Housing', paymentMethod: 'Bank Transfer' },
    { type: 'expense', name: 'Dinner at Il Forno', amount: 68.2, date: new Date(now.getFullYear(), now.getMonth() - 1, 20, 20, 0).toISOString(), category: 'Food & Dining', paymentMethod: 'Card' },
    { type: 'expense', name: 'Uber Rides', amount: 96.4, date: new Date(now.getFullYear(), now.getMonth() - 1, 15, 8, 0).toISOString(), category: 'Transport', paymentMethod: 'Digital Wallet' },
    { type: 'expense', name: 'Target Shopping', amount: 72.15, date: new Date(now.getFullYear(), now.getMonth() - 1, 22, 14, 0).toISOString(), category: 'Shopping', paymentMethod: 'Card' },
    // Two months ago
    { type: 'income', name: 'Acme Studio Salary', amount: 4800, date: new Date(now.getFullYear(), now.getMonth() - 2, 1, 9, 0).toISOString(), category: 'Salary', paymentMethod: 'Bank Transfer' },
    { type: 'expense', name: 'Apartment Rent', amount: 1240, date: new Date(now.getFullYear(), now.getMonth() - 2, 5, 10, 0).toISOString(), category: 'Housing', paymentMethod: 'Bank Transfer' },
    { type: 'expense', name: 'Whole Foods Market', amount: 142.8, date: new Date(now.getFullYear(), now.getMonth() - 2, 14, 11, 0).toISOString(), category: 'Groceries', paymentMethod: 'Card' },
    { type: 'expense', name: 'Flight Booking', amount: 340, date: new Date(now.getFullYear(), now.getMonth() - 2, 10, 9, 0).toISOString(), category: 'Transport', paymentMethod: 'Card' },
  ]

  for (const t of templates) {
    txs.push({ ...t, id: generateId(), createdAt: new Date().toISOString() })
  }
  return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function generateDemoBudgets(): Budget[] {
  return [
    { id: generateId(), category: 'overall', limit: 4200, period: 'monthly', createdAt: new Date().toISOString() },
    { id: generateId(), category: 'Groceries', limit: 400, period: 'monthly', createdAt: new Date().toISOString() },
    { id: generateId(), category: 'Food & Dining', limit: 300, period: 'monthly', createdAt: new Date().toISOString() },
    { id: generateId(), category: 'Transport', limit: 200, period: 'monthly', createdAt: new Date().toISOString() },
    { id: generateId(), category: 'Subscriptions', limit: 80, period: 'monthly', createdAt: new Date().toISOString() },
    { id: generateId(), category: 'Shopping', limit: 250, period: 'monthly', createdAt: new Date().toISOString() },
  ]
}

function generateDemoGoals(): SavingsGoal[] {
  const now = new Date()
  return [
    {
      id: generateId(),
      name: 'Japan Trip',
      targetAmount: 5000,
      currentAmount: 3420,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 3, 15).toISOString(),
      color: 'green',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 6800,
      targetDate: new Date(now.getFullYear() + 1, now.getMonth(), 1).toISOString(),
      color: 'cyan',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'New Laptop',
      targetAmount: 2400,
      currentAmount: 1200,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 4, 1).toISOString(),
      color: 'violet',
      createdAt: new Date().toISOString(),
    },
  ]
}

function generateDemoRecurring(): RecurringTransaction[] {
  const now = new Date()
  return [
    { id: generateId(), name: 'Apartment Rent', amount: 1240, type: 'expense', category: 'Housing', frequency: 'monthly', nextDate: new Date(now.getFullYear(), now.getMonth() + 1, 5).toISOString(), active: true },
    { id: generateId(), name: 'Salary', amount: 4800, type: 'income', category: 'Salary', frequency: 'monthly', nextDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(), active: true },
    { id: generateId(), name: 'Gym Membership', amount: 39.99, type: 'expense', category: 'Health', frequency: 'monthly', nextDate: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString(), active: true },
    { id: generateId(), name: 'Spotify', amount: 10.99, type: 'expense', category: 'Subscriptions', frequency: 'monthly', nextDate: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate() - 2).toISOString(), active: true },
    { id: generateId(), name: 'Netflix', amount: 15.49, type: 'expense', category: 'Subscriptions', frequency: 'monthly', nextDate: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate() - 4).toISOString(), active: true },
  ]
}

function generateDemoNotifications(): Notification[] {
  const now = new Date()
  return [
    { id: generateId(), type: 'budget', title: 'Groceries budget at 72%', message: 'You have $112 left in your Groceries budget for this month.', read: false, createdAt: new Date(now.getTime() - 3600000).toISOString() },
    { id: generateId(), type: 'recurring', title: 'Rent payment due in 3 days', message: 'Your apartment rent of $1,240.00 is due on the 5th.', read: false, createdAt: new Date(now.getTime() - 7200000).toISOString() },
    { id: generateId(), type: 'goal', title: 'Japan Trip milestone reached', message: 'You passed 68% of your savings goal. Great work!', read: false, createdAt: new Date(now.getTime() - 86400000).toISOString() },
    { id: generateId(), type: 'summary', title: 'Weekly summary ready', message: 'You spent $342 this week, 12% less than last week.', read: true, createdAt: new Date(now.getTime() - 172800000).toISOString() },
  ]
}

interface BudgetBuddyState {
  // Navigation
  view: ViewName
  appView: AppView

  // Auth
  profile: Profile | null
  isAuthenticated: boolean

  // Data
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
  goals: SavingsGoal[]
  recurring: RecurringTransaction[]
  notifications: Notification[]
  preferences: UserPreferences
  chatHistory: ChatMessage[]

  // UI state
  toast: string
  sidebarCollapsed: boolean
  isDemoMode: boolean

  // Actions
  setView: (view: ViewName) => void
  setAppView: (view: AppView) => void
  setToast: (message: string) => void
  toggleSidebar: () => void

  // Auth actions
  login: (email: string, name: string) => void
  logout: () => void
  completeOnboarding: (profile: Partial<Profile>) => void

  // Transaction actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Budget actions
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void
  updateBudget: (id: string, updates: Partial<Budget>) => void
  deleteBudget: (id: string) => void

  // Goal actions
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void
  deleteGoal: (id: string) => void
  contributeToGoal: (id: string, amount: number) => void

  // Recurring actions
  addRecurring: (r: Omit<RecurringTransaction, 'id'>) => void
  toggleRecurring: (id: string) => void
  deleteRecurring: (id: string) => void

  // Notification actions
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  deleteNotification: (id: string) => void

  // Preferences
  updatePreferences: (updates: Partial<UserPreferences>) => void
  toggleTheme: () => void

  // Chat
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => void
  clearChat: () => void

  // Data management
  loadDemoData: () => void
  clearAllData: () => void
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  currency: 'USD',
  notifyBudget: true,
  notifyRecurring: true,
  notifyGoals: true,
  notifySummary: true,
  reduceMotion: false,
}

export const useStore = create<BudgetBuddyState>()(
  persist(
    (set, get) => ({
      view: 'landing',
      appView: 'Overview',
      profile: null,
      isAuthenticated: false,
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      budgets: [],
      goals: [],
      recurring: [],
      notifications: [],
      preferences: defaultPreferences,
      chatHistory: [],
      toast: '',
      sidebarCollapsed: false,
      isDemoMode: false,

      setView: (view) => set({ view }),
      setAppView: (appView) => set({ appView }),
      setToast: (message) => set({ toast: message }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      login: (email, name) => {
        const profile: Profile = {
          id: generateId(),
          email,
          name: name || email.split('@')[0],
          avatarColor: 'green',
          currency: 'USD',
          onboarded: false,
          createdAt: new Date().toISOString(),
        }
        set({ profile, isAuthenticated: true, view: 'onboarding' })
      },

      logout: () => set({
        profile: null,
        isAuthenticated: false,
        view: 'landing',
        transactions: [],
        budgets: [],
        goals: [],
        recurring: [],
        notifications: [],
        chatHistory: [],
      }),

      completeOnboarding: (profileUpdates) => {
        const current = get().profile
        if (!current) return
        const wasEmpty = get().transactions.length === 0
        const updates: Partial<BudgetBuddyState> = {
          profile: { ...current, ...profileUpdates, onboarded: true },
          view: 'app',
        }
        if (wasEmpty) {
          updates.transactions = generateDemoTransactions()
          updates.budgets = generateDemoBudgets()
          updates.goals = generateDemoGoals()
          updates.recurring = generateDemoRecurring()
          updates.notifications = generateDemoNotifications()
          updates.isDemoMode = true
        }
        set(updates)
      },

      addTransaction: (tx) => set((s) => ({
        transactions: [{ ...tx, id: generateId(), createdAt: new Date().toISOString() }, ...s.transactions],
      })),

      updateTransaction: (id, updates) => set((s) => ({
        transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      })),

      deleteTransaction: (id) => set((s) => ({
        transactions: s.transactions.filter((t) => t.id !== id),
      })),

      addBudget: (budget) => set((s) => ({
        budgets: [...s.budgets, { ...budget, id: generateId(), createdAt: new Date().toISOString() }],
      })),

      updateBudget: (id, updates) => set((s) => ({
        budgets: s.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      })),

      deleteBudget: (id) => set((s) => ({
        budgets: s.budgets.filter((b) => b.id !== id),
      })),

      addGoal: (goal) => set((s) => ({
        goals: [...s.goals, { ...goal, id: generateId(), createdAt: new Date().toISOString() }],
      })),

      updateGoal: (id, updates) => set((s) => ({
        goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      })),

      deleteGoal: (id) => set((s) => ({
        goals: s.goals.filter((g) => g.id !== id),
      })),

      contributeToGoal: (id, amount) => set((s) => ({
        goals: s.goals.map((g) =>
          g.id === id ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) } : g
        ),
      })),

      addRecurring: (r) => set((s) => ({
        recurring: [...s.recurring, { ...r, id: generateId() }],
      })),

      toggleRecurring: (id) => set((s) => ({
        recurring: s.recurring.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
      })),

      deleteRecurring: (id) => set((s) => ({
        recurring: s.recurring.filter((r) => r.id !== id),
      })),

      markNotificationRead: (id) => set((s) => ({
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      })),

      markAllNotificationsRead: () => set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
      })),

      deleteNotification: (id) => set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
      })),

      updatePreferences: (updates) => set((s) => ({
        preferences: { ...s.preferences, ...updates },
      })),

      toggleTheme: () => set((s) => ({
        preferences: { ...s.preferences, theme: s.preferences.theme === 'dark' ? 'light' : 'dark' },
      })),

      addChatMessage: (msg) => set((s) => ({
        chatHistory: [...s.chatHistory, { ...msg, id: generateId(), createdAt: new Date().toISOString() }],
      })),

      clearChat: () => set({ chatHistory: [] }),

      loadDemoData: () => set({
        transactions: generateDemoTransactions(),
        budgets: generateDemoBudgets(),
        goals: generateDemoGoals(),
        recurring: generateDemoRecurring(),
        notifications: generateDemoNotifications(),
        isDemoMode: true,
      }),

      clearAllData: () => set({
        transactions: [],
        budgets: [],
        goals: [],
        recurring: [],
        notifications: [],
        chatHistory: [],
        isDemoMode: false,
      }),
    }),
    {
      name: 'budgetbuddy-storage',
      partialize: (state) => ({
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        transactions: state.transactions,
        categories: state.categories,
        budgets: state.budgets,
        goals: state.goals,
        recurring: state.recurring,
        notifications: state.notifications,
        preferences: state.preferences,
        chatHistory: state.chatHistory,
        isDemoMode: state.isDemoMode,
      }),
    }
  )
)
