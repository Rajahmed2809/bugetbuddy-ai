'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  MoreHorizontal,
  CircleDollarSign,
  Lightbulb,
  ChevronRight,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { calculateExpenses, filterByMonth, getBudgetProgress, getBudgetUsage } from '@/lib/analytics'
import { formatCurrency } from '@/lib/format'
import { DEFAULT_CATEGORIES, CATEGORY_COLORS } from '@/lib/types'
import type { Budget } from '@/lib/types'
import { Button } from '../shared'

export function BudgetsView() {
  const budgets = useStore((s) => s.budgets)
  const transactions = useStore((s) => s.transactions)
  const addBudget = useStore((s) => s.addBudget)
  const deleteBudget = useStore((s) => s.deleteBudget)
  const setToast = useStore((s) => s.setToast)
  const profile = useStore((s) => s.profile)
  const [showModal, setShowModal] = useState(false)

  const now = new Date()
  const monthTx = filterByMonth(transactions, now.getFullYear(), now.getMonth())
  const totalExpenses = calculateExpenses(monthTx)

  const overallBudget = budgets.find((b) => b.category === 'overall')
  const categoryBudgets = budgets.filter((b) => b.category !== 'overall')

  const overallProgress = overallBudget ? Math.round((totalExpenses / overallBudget.limit) * 100) : 0
  const overallRemaining = overallBudget ? overallBudget.limit - totalExpenses : 0

  const handleDelete = (id: string) => {
    deleteBudget(id)
    setToast('Budget removed')
  }

  const suggestions: { title: string; body: string; tone: 'positive' | 'warning' }[] = []
  if (overallBudget && overallProgress > 90) {
    suggestions.push({ title: 'Overall budget nearly reached', body: `You've used ${overallProgress}% of your monthly budget. Consider reducing discretionary spending.`, tone: 'warning' })
  } else if (overallBudget && overallProgress < 60) {
    suggestions.push({ title: 'Budget is healthy', body: `You're only at ${overallProgress}% of your monthly budget. Great pace!`, tone: 'positive' })
  }

  return (
    <div className="tab-view">
      <div className="tab-view-heading">
        <div>
          <span className="muted-label">SPEND WITH INTENTION</span>
          <h4>Smart budgets</h4>
          <p>Set monthly limits per category and track your progress in real time.</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={<Plus size={16} />}>Create budget</Button>
      </div>

      {/* Overall budget */}
      {overallBudget && (
        <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, rgba(99,230,167,0.08) 0%, var(--surface) 100%)' }}>
          <div className="card-heading">
            <div>
              <span className="muted-label">OVERALL MONTHLY BUDGET</span>
              <h5 style={{ fontSize: '1.1rem' }}>{formatCurrency(overallBudget.limit, profile?.currency)} per month</h5>
            </div>
            <button className="icon-button" onClick={() => handleDelete(overallBudget.id)} aria-label="Delete"><Trash2 size={16} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <div className="goal-progress-head">
                <b>{formatCurrency(totalExpenses, profile?.currency)}</b>
                <span>of {formatCurrency(overallBudget.limit, profile?.currency)} spent</span>
              </div>
              <div className="progress-track" style={{ height: 12 }}>
                <i style={{ width: `${Math.min(overallProgress, 100)}%`, background: overallProgress > 90 ? 'linear-gradient(90deg, var(--orange) 0%, var(--red) 100%)' : 'linear-gradient(90deg, var(--green) 0%, var(--green-strong) 100%)' }} />
              </div>
              <div className="goal-footer">
                <span>{overallProgress}% used</span>
                <span>{formatCurrency(Math.max(overallRemaining, 0), profile?.currency)} remaining</span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: overallProgress > 90 ? 'var(--orange)' : 'var(--green)' }}>
                {overallProgress}%
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>of budget used</span>
            </div>
          </div>
        </div>
      )}

      {/* Category budgets */}
      <div className="budget-board">
        {categoryBudgets.map((budget) => {
          const spent = getBudgetUsage(budget, monthTx)
          const progress = getBudgetProgress(budget, monthTx)
          const remaining = budget.limit - spent
          const color = CATEGORY_COLORS[budget.category] || 'amber'
          return (
            <div className="dashboard-card budget-tile" key={budget.id}>
              <div className="budget-tile-top">
                <span className={`budget-icon ${color}`}><CircleDollarSign size={16} /></span>
                <button className="icon-button" style={{ width: 28, height: 28 }} onClick={() => handleDelete(budget.id)} aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
              <span className="muted-label">{budget.category.toUpperCase()}</span>
              <div className="budget-amount">
                <b>{formatCurrency(spent, profile?.currency)}</b>
                <span>of {formatCurrency(budget.limit, profile?.currency)}</span>
              </div>
              <div className="progress-track">
                <i className={color} style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <div className="goal-footer">
                <span style={{ color: progress > 90 ? 'var(--orange)' : 'inherit' }}>{progress}% used</span>
                <span>{formatCurrency(Math.max(remaining, 0), profile?.currency)} left</span>
              </div>
              {progress > 90 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: 'var(--orange)' }}>
                  <AlertTriangle size={12} /> Approaching limit
                </div>
              )}
            </div>
          )
        })}
      </div>

      {budgets.length === 0 && (
        <div className="dashboard-card empty-state" style={{ minHeight: 200 }}>
          <CircleDollarSign size={22} />
          <b>No budgets yet</b>
          <span>Create your first budget to start tracking spending limits</span>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="dashboard-card budget-callout">
          <div className="insight-spark"><Lightbulb size={18} /></div>
          <div>
            <b>{suggestions[0].title}</b>
            <p>{suggestions[0].body}</p>
          </div>
          <ChevronRight size={18} />
        </div>
      )}

      {showModal && (
        <BudgetModal
          onClose={() => setShowModal(false)}
          onSave={(budget) => {
            addBudget(budget)
            setToast('Budget created')
            setShowModal(false)
          }}
          existingCategories={budgets.map((b) => b.category)}
        />
      )}
    </div>
  )
}

function BudgetModal({
  onClose,
  onSave,
  existingCategories,
}: {
  onClose: () => void
  onSave: (budget: Omit<Budget, 'id' | 'createdAt'>) => void
  existingCategories: string[]
}) {
  const [category, setCategory] = useState('overall')
  const [limit, setLimit] = useState('')

  const availableCategories = [
    { name: 'overall', label: 'Overall (all expenses)' },
    ...DEFAULT_CATEGORIES.filter((c) => !existingCategories.includes(c.name)).map((c) => ({ name: c.name, label: c.name })),
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!limit || parseFloat(limit) <= 0) return
    onSave({
      category,
      limit: parseFloat(limit),
      period: 'monthly',
    })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div className="glass-strong" style={{ width: '100%', maxWidth: 440, borderRadius: 20, padding: 28, position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button className="icon-button" style={{ position: 'absolute', top: 16, right: 16 }} onClick={onClose}><X size={18} /></button>
        <h3 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 700 }}>Create budget</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 24px' }}>Set a monthly spending limit</p>
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Category</label>
            <select className="field-input" style={{ cursor: 'pointer' }} value={category} onChange={(e) => setCategory(e.target.value)}>
              {availableCategories.map((c) => (
                <option key={c.name} value={c.name}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Monthly limit</label>
            <div className="search-field" style={{ height: 48 }}>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>$</span>
              <input
                type="number"
                step="0.01"
                style={{ background: 'transparent', border: 0, height: '100%', padding: 0, fontSize: 14, color: 'var(--text)' }}
                placeholder="500.00"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <Button variant="ghost" type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
            <Button type="submit" style={{ flex: 1 }} icon={<Check size={16} />}>Create</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
