// BudgetBuddy AI — Core types

export type Theme = 'dark' | 'light'

export type ViewName =
  | 'landing'
  | 'login'
  | 'signup'
  | 'onboarding'
  | 'app'

export type AppView =
  | 'Overview'
  | 'Transactions'
  | 'Receipt Scanner'
  | 'Budgets'
  | 'Analytics'
  | 'Forecast'
  | 'AI Assistant'
  | 'Savings Goals'
  | 'Recurring'
  | 'Notifications'
  | 'Settings'

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  name: string
  amount: number
  date: string // ISO date
  category: string
  paymentMethod: string
  note?: string
  receiptUrl?: string
  isRecurring?: boolean
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: ColorKey
  isDefault: boolean
}

export interface Budget {
  id: string
  category: string // 'overall' or category name
  limit: number
  period: string
  createdAt: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  color: ColorKey
  createdAt: string
}

export interface RecurringTransaction {
  id: string
  name: string
  amount: number
  type: TransactionType
  category: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  nextDate: string
  active: boolean
}

export type NotificationType = 'budget' | 'recurring' | 'goal' | 'summary' | 'insight'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface UserPreferences {
  theme: Theme
  currency: string
  notifyBudget: boolean
  notifyRecurring: boolean
  notifyGoals: boolean
  notifySummary: boolean
  reduceMotion: boolean
}

export interface Profile {
  id: string
  email: string
  name: string
  avatarColor: ColorKey
  currency: string
  onboarded: boolean
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export type ColorKey = 'green' | 'cyan' | 'blue' | 'violet' | 'orange' | 'amber' | 'red'

export const CATEGORY_COLORS: Record<string, ColorKey> = {
  'Groceries': 'green',
  'Food & Dining': 'orange',
  'Transport': 'cyan',
  'Housing': 'blue',
  'Subscriptions': 'violet',
  'Entertainment': 'violet',
  'Shopping': 'amber',
  'Health': 'cyan',
  'Salary': 'green',
  'Freelance': 'blue',
  'Investments': 'green',
  'Other': 'amber',
}

export const PAYMENT_METHODS = ['Card', 'Cash', 'Bank Transfer', 'Digital Wallet', 'Check'] as const

export const CATEGORY_ICONS: Record<string, string> = {
  'Groceries': 'ShoppingCart',
  'Food & Dining': 'UtensilsCrossed',
  'Transport': 'Car',
  'Housing': 'Home',
  'Subscriptions': 'Repeat',
  'Entertainment': 'Clapperboard',
  'Shopping': 'ShoppingBag',
  'Health': 'HeartPulse',
  'Salary': 'Banknote',
  'Freelance': 'Briefcase',
  'Investments': 'TrendingUp',
  'Other': 'CircleDollarSign',
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-groceries', name: 'Groceries', icon: 'ShoppingCart', color: 'green', isDefault: true },
  { id: 'cat-food', name: 'Food & Dining', icon: 'UtensilsCrossed', color: 'orange', isDefault: true },
  { id: 'cat-transport', name: 'Transport', icon: 'Car', color: 'cyan', isDefault: true },
  { id: 'cat-housing', name: 'Housing', icon: 'Home', color: 'blue', isDefault: true },
  { id: 'cat-subs', name: 'Subscriptions', icon: 'Repeat', color: 'violet', isDefault: true },
  { id: 'cat-entertainment', name: 'Entertainment', icon: 'Clapperboard', color: 'violet', isDefault: true },
  { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBag', color: 'amber', isDefault: true },
  { id: 'cat-health', name: 'Health', icon: 'HeartPulse', color: 'cyan', isDefault: true },
  { id: 'cat-salary', name: 'Salary', icon: 'Banknote', color: 'green', isDefault: true },
  { id: 'cat-freelance', name: 'Freelance', icon: 'Briefcase', color: 'blue', isDefault: true },
  { id: 'cat-investments', name: 'Investments', icon: 'TrendingUp', color: 'green', isDefault: true },
  { id: 'cat-other', name: 'Other', icon: 'CircleDollarSign', color: 'amber', isDefault: true },
]
