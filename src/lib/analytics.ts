// BudgetBuddy AI — Analytics & calculations
import type { Transaction, Budget, SavingsGoal } from './types'

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount
  }, 0)
}

export function calculateIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function calculateExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getSavingsRate(income: number, expenses: number): number {
  if (income === 0) return 0
  return Math.round(((income - expenses) / income) * 100)
}

export function filterByMonth(transactions: Transaction[], year: number, month: number): Transaction[] {
  return transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getFullYear() === year && d.getMonth() === month
  })
}

export function filterByDateRange(transactions: Transaction[], start: Date, end: Date): Transaction[] {
  return transactions.filter((t) => {
    const d = new Date(t.date)
    return d >= start && d <= end
  })
}

export function getCategoryBreakdown(transactions: Transaction[]): { category: string; amount: number; count: number }[] {
  const map = new Map<string, { amount: number; count: number }>()
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const existing = map.get(t.category) || { amount: 0, count: 0 }
    map.set(t.category, { amount: existing.amount + t.amount, count: existing.count + 1 })
  }
  return Array.from(map.entries())
    .map(([category, data]) => ({ category, amount: data.amount, count: data.count }))
    .sort((a, b) => b.amount - a.amount)
}

export function getMonthlyTrend(transactions: Transaction[], months = 6): { month: string; income: number; expenses: number; net: number }[] {
  const now = new Date()
  const result: { month: string; income: number; expenses: number; net: number }[] = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthTransactions = filterByMonth(transactions, d.getFullYear(), d.getMonth())
    const income = calculateIncome(monthTransactions)
    const expenses = calculateExpenses(monthTransactions)
    result.push({
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      income,
      expenses,
      net: income - expenses,
    })
  }
  return result
}

export function getDailyTrend(transactions: Transaction[], days = 14): { day: string; expenses: number; income: number }[] {
  const now = new Date()
  const result: { day: string; expenses: number; income: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    const dayTx = transactions.filter((t) => {
      const td = new Date(t.date)
      return td >= d && td < next
    })
    result.push({
      day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      expenses: calculateExpenses(dayTx),
      income: calculateIncome(dayTx),
    })
  }
  return result
}

export function getBudgetUsage(budget: Budget, transactions: Transaction[]): number {
  if (budget.category === 'overall') {
    return calculateExpenses(transactions)
  }
  return transactions
    .filter((t) => t.type === 'expense' && t.category === budget.category)
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getBudgetProgress(budget: Budget, transactions: Transaction[]): number {
  const spent = getBudgetUsage(budget, transactions)
  if (budget.limit === 0) return 0
  return Math.min(Math.round((spent / budget.limit) * 100), 100)
}

export function getGoalProgress(goal: SavingsGoal): number {
  if (goal.targetAmount === 0) return 0
  return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
}

export function forecastSpending(transactions: Transaction[]): {
  projected: number
  uncertainty: number
  byCategory: { category: string; amount: number }[]
  confidence: 'low' | 'medium' | 'high'
} {
  const now = new Date()
  const last3Months: Transaction[] = []
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    last3Months.push(...filterByMonth(transactions, d.getFullYear(), d.getMonth()))
  }

  const expenses = last3Months.filter((t) => t.type === 'expense')
  const monthlyAvg = expenses.reduce((sum, t) => sum + t.amount, 0) / 3

  // Category breakdown
  const catMap = new Map<string, number[]>()
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthTx = filterByMonth(transactions, d.getFullYear(), d.getMonth()).filter((t) => t.type === 'expense')
    for (const t of monthTx) {
      const arr = catMap.get(t.category) || []
      arr.push(t.amount)
      catMap.set(t.category, arr)
    }
  }
  const byCategory = Array.from(catMap.entries())
    .map(([category, amounts]) => ({
      category,
      amount: amounts.reduce((s, a) => s + a, 0) / 3,
    }))
    .sort((a, b) => b.amount - a.amount)

  // Uncertainty based on variance
  const monthTotals: number[] = []
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthExpenses = filterByMonth(transactions, d.getFullYear(), d.getMonth()).filter((t) => t.type === 'expense')
    monthTotals.push(monthExpenses.reduce((s, t) => s + t.amount, 0))
  }
  const mean = monthTotals.reduce((s, v) => s + v, 0) / monthTotals.length
  const variance = monthTotals.reduce((s, v) => s + (v - mean) ** 2, 0) / monthTotals.length
  const stdDev = Math.sqrt(variance)
  const uncertainty = Math.round(stdDev || monthlyAvg * 0.1)

  let confidence: 'low' | 'medium' | 'high' = 'high'
  if (expenses.length < 10) confidence = 'low'
  else if (uncertainty / monthlyAvg > 0.2) confidence = 'medium'

  return {
    projected: Math.round(monthlyAvg),
    uncertainty,
    byCategory,
    confidence,
  }
}

export function generateInsights(transactions: Transaction[], goals: SavingsGoal[]): { title: string; body: string; tone: 'positive' | 'neutral' | 'warning' }[] {
  const insights: { title: string; body: string; tone: 'positive' | 'neutral' | 'warning' }[] = []
  const now = new Date()
  const thisMonth = filterByMonth(transactions, now.getFullYear(), now.getMonth())
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonth = filterByMonth(transactions, lastMonthDate.getFullYear(), lastMonthDate.getMonth())

  const thisExpenses = calculateExpenses(thisMonth)
  const lastExpenses = calculateExpenses(lastMonth)

  if (lastExpenses > 0) {
    const change = Math.round(((thisExpenses - lastExpenses) / lastExpenses) * 100)
    if (change < -5) {
      insights.push({
        title: 'Spending is trending down',
        body: `You're spending ${Math.abs(change)}% less than last month. Keep this momentum to reach your goals faster.`,
        tone: 'positive',
      })
    } else if (change > 10) {
      insights.push({
        title: 'Spending is up this month',
        body: `Your spending has increased ${change}% compared to last month. Review your category breakdown for details.`,
        tone: 'warning',
      })
    }
  }

  const catBreakdown = getCategoryBreakdown(thisMonth)
  if (catBreakdown.length > 0 && catBreakdown[0].amount > thisExpenses * 0.4) {
    insights.push({
      title: `${catBreakdown[0].category} dominates your spending`,
      body: `${catBreakdown[0].category} represents ${Math.round((catBreakdown[0].amount / thisExpenses) * 100)}% of your expenses this month.`,
      tone: 'neutral',
    })
  }

  const income = calculateIncome(thisMonth)
  const savingsRate = getSavingsRate(income, thisExpenses)
  if (savingsRate > 20) {
    insights.push({
      title: 'Strong savings rate',
      body: `You're saving ${savingsRate}% of your income this month. That's well above the recommended 20%.`,
      tone: 'positive',
    })
  }

  for (const goal of goals) {
    const progress = getGoalProgress(goal)
    if (progress >= 75 && progress < 100) {
      insights.push({
        title: `${goal.name} is almost there`,
        body: `You're ${progress}% of the way to your "${goal.name}" goal. Just $${(goal.targetAmount - goal.currentAmount).toFixed(0)} to go.`,
        tone: 'positive',
      })
    }
  }

  return insights
}
