'use client'

import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  ArrowDownLeft,
  ArrowUpRight,
  WalletCards,
  Target,
  Sparkles,
  Lightbulb,
  ChevronRight,
  MoreHorizontal,
  Plus,
  ScanLine,
  TrendingUp,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import {
  calculateBalance,
  calculateIncome,
  calculateExpenses,
  getSavingsRate,
  filterByMonth,
  getMonthlyTrend,
  getCategoryBreakdown,
  generateInsights,
  getGoalProgress,
} from '@/lib/analytics'
import { formatCurrency, formatDate, getInitials } from '@/lib/format'
import { CATEGORY_COLORS } from '@/lib/types'
import { Button, ProgressRing } from '../shared'

const COLOR_VALUES: Record<string, string> = {
  green: '#63e6a7',
  cyan: '#72d7df',
  blue: '#83aaf7',
  violet: '#b8a7f4',
  orange: '#f3ad78',
  amber: '#e9b949',
  red: '#ef6a6a',
}

export function OverviewView() {
  const transactions = useStore((s) => s.transactions)
  const goals = useStore((s) => s.goals)
  const budgets = useStore((s) => s.budgets)
  const setAppView = useStore((s) => s.setAppView)
  const setToast = useStore((s) => s.setToast)
  const profile = useStore((s) => s.profile)
  const [range, setRange] = useState('This month')

  const now = new Date()
  const monthTx = useMemo(() => filterByMonth(transactions, now.getFullYear(), now.getMonth()), [transactions, now])
  const lastMonthTx = useMemo(() => filterByMonth(transactions, now.getFullYear(), now.getMonth() - 1), [transactions, now])

  const balance = calculateBalance(transactions)
  const income = calculateIncome(monthTx)
  const expenses = calculateExpenses(monthTx)
  const lastIncome = calculateIncome(lastMonthTx)
  const lastExpenses = calculateExpenses(lastMonthTx)
  const savingsRate = getSavingsRate(income, expenses)

  const incomeChange = lastIncome > 0 ? Math.round(((income - lastIncome) / lastIncome) * 100) : 0
  const expenseChange = lastExpenses > 0 ? Math.round(((expenses - lastExpenses) / lastExpenses) * 100) : 0
  const balanceChange = lastIncome - lastExpenses > 0 ? Math.round(((balance - (calculateBalance(transactions) - (income - expenses))) / Math.abs(calculateBalance(transactions) - (income - expenses) || 1)) * 100) : 0

  const trend = useMemo(() => getMonthlyTrend(transactions, 6), [transactions])
  const categoryData = useMemo(() => getCategoryBreakdown(monthTx).slice(0, 5), [monthTx])
  const insights = useMemo(() => generateInsights(transactions, goals), [transactions, goals])

  const overallBudget = budgets.find((b) => b.category === 'overall')
  const budgetUsed = overallBudget ? Math.round((expenses / overallBudget.limit) * 100) : 0
  const budgetRemaining = overallBudget ? overallBudget.limit - expenses : 0

  const recentTx = transactions.slice(0, 5)
  const activeGoal = goals[0]
  const goalProgress = activeGoal ? getGoalProgress(activeGoal) : 0

  const firstName = profile?.name?.split(' ')[0] || 'there'
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'

  const pieData = categoryData.map((c) => ({
    name: c.category,
    value: c.amount,
    color: COLOR_VALUES[CATEGORY_COLORS[c.category] || 'amber'],
  }))

  return (
    <div>
      {/* Greeting */}
      <div className="dashboard-greeting">
        <div>
          <span className="muted-label">{now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}</span>
          <h4>{greeting}, {firstName} <span>✦</span></h4>
          <p>Here&apos;s your money story at a glance.</p>
        </div>
        <div className="range-select">
          <span>Range</span>
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option>This month</option>
            <option>Last month</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
          <ChevronRight size={15} />
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Button variant="ghost" onClick={() => setAppView('Transactions')} icon={<Plus size={16} />}>Add expense</Button>
        <Button variant="ghost" onClick={() => setAppView('Receipt Scanner')} icon={<ScanLine size={16} />}>Scan receipt</Button>
        <Button variant="ghost" onClick={() => setAppView('AI Assistant')} icon={<Sparkles size={16} />}>Ask AI</Button>
      </div>

      {/* Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-head">
            <span>Total balance</span>
            <span className="metric-icon green"><WalletCards size={18} /></span>
          </div>
          <div className="metric-value">{formatCurrency(balance, profile?.currency)}</div>
          <div className="metric-foot">
            <span className={balanceChange >= 0 ? 'trend-up' : 'trend-down'}>
              {balanceChange >= 0 ? '↗' : '↘'} {Math.abs(balanceChange)}%
            </span>
            <span>across all accounts</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-head">
            <span>Income (this month)</span>
            <span className="metric-icon blue"><ArrowDownLeft size={18} /></span>
          </div>
          <div className="metric-value">{formatCurrency(income, profile?.currency)}</div>
          <div className="metric-foot">
            <span className={incomeChange >= 0 ? 'trend-up' : 'trend-down'}>
              {incomeChange >= 0 ? '↗' : '↘'} {Math.abs(incomeChange)}%
            </span>
            <span>vs. {formatCurrency(lastIncome, profile?.currency)} last month</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-head">
            <span>Spent (this month)</span>
            <span className="metric-icon orange"><ArrowUpRight size={18} /></span>
          </div>
          <div className="metric-value">{formatCurrency(expenses, profile?.currency)}</div>
          <div className="metric-foot">
            <span className={expenseChange <= 0 ? 'trend-up' : 'trend-down'}>
              {expenseChange <= 0 ? '↘' : '↗'} {Math.abs(expenseChange)}%
            </span>
            <span>vs. {formatCurrency(lastExpenses, profile?.currency)} last month</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-head">
            <span>Savings rate</span>
            <span className="metric-icon violet"><Target size={18} /></span>
          </div>
          <div className="metric-value">{savingsRate}%</div>
          <div className="metric-foot">
            <span className={savingsRate >= 20 ? 'trend-up' : 'trend-down'}>
              {savingsRate >= 20 ? '↗' : '↘'} {savingsRate >= 20 ? 'Great pace' : 'Keep going'}
            </span>
            <span>of income saved</span>
          </div>
        </div>
      </div>

      {/* Cashflow + Budget ring */}
      <div className="dashboard-grid top-grid">
        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="muted-label">CASHFLOW</span>
              <h5>Income vs. expenses</h5>
            </div>
            <div className="legend">
              <span><i className="legend-dot green-dot" />Income</span>
              <span><i className="legend-dot blue-dot" />Expenses</span>
            </div>
          </div>
          <div className="cashflow-value">
            <b>{formatCurrency(income - expenses, profile?.currency)}</b>
            <span className="trend-up">net this month</span>
          </div>
          <div style={{ height: 200, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#63e6a7" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#63e6a7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#83aaf7" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#83aaf7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(207,242,218,0.08)" />
                <XAxis dataKey="month" stroke="#668074" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#668074" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-solid)',
                    border: '1px solid var(--line-strong)',
                    borderRadius: '12px',
                    color: 'var(--text)',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => formatCurrency(value, profile?.currency)}
                />
                <Area type="monotone" dataKey="income" stroke="#63e6a7" strokeWidth={2.5} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expenses" stroke="#83aaf7" strokeWidth={2.5} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="muted-label">BUDGET HEALTH</span>
              <h5>{budgetUsed < 80 ? 'Room to breathe' : budgetUsed < 100 ? 'Almost there' : 'Over budget'}</h5>
            </div>
            <div className="insight-spark"><Sparkles size={16} /></div>
          </div>
          <div className="budget-ring">
            <ProgressRing percent={Math.min(budgetUsed, 100)} label={overallBudget ? 'used' : 'no budget'} />
          </div>
          <div className="insight-caption">
            <b>{formatCurrency(Math.max(budgetRemaining, 0), profile?.currency)}</b>
            <span>{overallBudget ? `of ${formatCurrency(overallBudget.limit, profile?.currency)} budget` : 'Set a budget to track'}</span>
          </div>
          <button className="text-link" onClick={() => setAppView('Budgets')}>View budget details <ChevronRight size={14} /></button>
        </div>
      </div>

      {/* Category breakdown + Recent transactions */}
      <div className="dashboard-grid bottom-grid">
        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="muted-label">LATEST ACTIVITY</span>
              <h5>Recent transactions</h5>
            </div>
            <button className="card-action" onClick={() => setAppView('Transactions')}>View all <ChevronRight size={14} /></button>
          </div>
          <div className="transaction-list">
            {recentTx.length === 0 && (
              <div className="empty-state">
                <Sparkles size={22} />
                <b>No transactions yet</b>
                <span>Add your first transaction to see it here</span>
              </div>
            )}
            {recentTx.map((t) => {
              const color = CATEGORY_COLORS[t.category] || 'amber'
              const icon = t.name.charAt(0).toUpperCase()
              return (
                <div className="transaction-row" key={t.id}>
                  <span className={`merchant-avatar ${color}`}>{icon}</span>
                  <span className="transaction-primary">
                    <b>{t.name}</b>
                    <small>{t.category}</small>
                  </span>
                  <span className="transaction-date">{formatDate(t.date)}</span>
                  <b className={t.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                    {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount, profile?.currency)}
                  </b>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Category pie */}
          {pieData.length > 0 && (
            <div className="dashboard-card" style={{ paddingBottom: 12 }}>
              <div className="card-heading">
                <div>
                  <span className="muted-label">SPENDING BY CATEGORY</span>
                  <h5>This month</h5>
                </div>
              </div>
              <div style={{ height: 140, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={2}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface-solid)',
                        border: '1px solid var(--line-strong)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => formatCurrency(value, profile?.currency)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {pieData.slice(0, 3).map((c) => (
                  <span key={c.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                    <i style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Savings goal */}
          {activeGoal && (
            <div className="dashboard-card">
              <div className="card-heading">
                <div>
                  <span className="muted-label">SAVINGS GOAL</span>
                  <h5>{activeGoal.name}</h5>
                </div>
                <Target size={18} className="card-heading-icon" />
              </div>
              <div className="goal-progress-head">
                <b>{formatCurrency(activeGoal.currentAmount, profile?.currency)}</b>
                <span>of {formatCurrency(activeGoal.targetAmount, profile?.currency)}</span>
              </div>
              <div className="progress-track"><i style={{ width: `${goalProgress}%` }} /></div>
              <div className="goal-footer">
                <span>{goalProgress}% complete</span>
                <span>
                  {activeGoal.targetDate
                    ? `${Math.max(0, Math.ceil((new Date(activeGoal.targetDate).getTime() - now.getTime()) / 86400000))} days left`
                    : 'No deadline'}
                </span>
              </div>
              <button className="text-link" onClick={() => setAppView('Savings Goals')} style={{ marginTop: 10 }}>
                View all goals <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="dashboard-card" style={{ marginTop: 16 }}>
          <div className="card-heading">
            <div>
              <span className="muted-label">AI INSIGHTS</span>
              <h5>What BudgetBuddy noticed</h5>
            </div>
            <div className="insight-spark"><Sparkles size={16} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {insights.map((insight, i) => (
              <div key={i} className="budget-callout" style={{ padding: 16 }}>
                <div className="insight-spark">
                  <Lightbulb size={16} />
                </div>
                <div>
                  <b style={{ fontSize: 13 }}>{insight.title}</b>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: '4px 0 0' }}>{insight.body}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="text-link" onClick={() => setAppView('AI Assistant')} style={{ marginTop: 12 }}>
            Chat with AI assistant <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
