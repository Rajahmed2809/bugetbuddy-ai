'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  Repeat,
  Check,
  X,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  Power,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatCurrency, formatDateShort, daysBetween } from '@/lib/format'
import { DEFAULT_CATEGORIES, CATEGORY_COLORS } from '@/lib/types'
import type { RecurringTransaction, TransactionType } from '@/lib/types'
import { Button } from '../shared'

export function RecurringView() {
  const recurring = useStore((s) => s.recurring)
  const addRecurring = useStore((s) => s.addRecurring)
  const toggleRecurring = useStore((s) => s.toggleRecurring)
  const deleteRecurring = useStore((s) => s.deleteRecurring)
  const setToast = useStore((s) => s.setToast)
  const profile = useStore((s) => s.profile)
  const [showModal, setShowModal] = useState(false)

  const now = new Date()
  const monthlyRecurring = recurring
    .filter((r) => r.active)
    .reduce((sum, r) => sum + (r.type === 'expense' ? r.amount : -r.amount), 0)

  const upcoming = recurring
    .filter((r) => r.active)
    .map((r) => ({ ...r, daysUntil: daysBetween(now, new Date(r.nextDate)) }))
    .filter((r) => r.daysUntil <= 14)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  return (
    <div className="tab-view">
      <div className="tab-view-heading">
        <div>
          <span className="muted-label">RECURRING TRANSACTIONS</span>
          <h4>Recurring payments</h4>
          <p>{recurring.filter((r) => r.active).length} active · {formatCurrency(Math.abs(monthlyRecurring), profile?.currency)} monthly {monthlyRecurring >= 0 ? 'outflow' : 'inflow'}</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={<Plus size={16} />}>Add recurring</Button>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="muted-label">UPCOMING (NEXT 14 DAYS)</span>
              <h5>Coming due soon</h5>
            </div>
            <Calendar size={18} style={{ color: 'var(--muted)' }} />
          </div>
          <div className="transaction-list">
            {upcoming.map((r) => {
              const color = CATEGORY_COLORS[r.category] || 'amber'
              return (
                <div className="transaction-row" key={r.id}>
                  <span className={`merchant-avatar ${color}`}><Repeat size={16} /></span>
                  <span className="transaction-primary">
                    <b>{r.name}</b>
                    <small>{r.category} · {r.frequency}</small>
                  </span>
                  <span className="transaction-date" style={{ color: r.daysUntil <= 3 ? 'var(--orange)' : 'var(--muted)' }}>
                    {r.daysUntil === 0 ? 'Today' : r.daysUntil === 1 ? 'Tomorrow' : `In ${r.daysUntil} days`}
                  </span>
                  <b className={r.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                    {r.type === 'income' ? '+' : '−'}{formatCurrency(r.amount, profile?.currency)}
                  </b>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All recurring */}
      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <span className="muted-label">ALL RECURRING</span>
            <h5>Manage your scheduled transactions</h5>
          </div>
        </div>
        {recurring.length === 0 ? (
          <div className="empty-state">
            <Repeat size={22} />
            <b>No recurring transactions</b>
            <span>Add recurring payments like rent, salary, or subscriptions</span>
          </div>
        ) : (
          <div className="transaction-list">
            {recurring.map((r) => {
              const color = CATEGORY_COLORS[r.category] || 'amber'
              return (
                <div className="transaction-row" key={r.id} style={{ opacity: r.active ? 1 : 0.5, gridTemplateColumns: 'auto 1fr auto auto auto auto' }}>
                  <span className={`merchant-avatar ${color}`}>
                    {r.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </span>
                  <span className="transaction-primary">
                    <b>{r.name}</b>
                    <small>{r.category} · {r.frequency}</small>
                  </span>
                  <span className="transaction-date">{formatDateShort(r.nextDate)}</span>
                  <b className={r.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                    {r.type === 'income' ? '+' : '−'}{formatCurrency(r.amount, profile?.currency)}
                  </b>
                  <button className="icon-button" style={{ width: 32, height: 32 }} onClick={() => toggleRecurring(r.id)} aria-label="Toggle">
                    <Power size={14} />
                  </button>
                  <button className="icon-button" style={{ width: 32, height: 32 }} onClick={() => deleteRecurring(r.id)} aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <RecurringModal
          onClose={() => setShowModal(false)}
          onSave={(r) => {
            addRecurring(r)
            setToast('Recurring transaction added')
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}

function RecurringModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (r: Omit<RecurringTransaction, 'id'>) => void
}) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState('Subscriptions')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [nextDate, setNextDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount) return
    onSave({
      name,
      amount: parseFloat(amount),
      type,
      category,
      frequency,
      nextDate: new Date(nextDate).toISOString(),
      active: true,
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div className="glass-strong" style={{ width: '100%', maxWidth: 440, borderRadius: 20, padding: 28, position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button className="icon-button" style={{ position: 'absolute', top: 16, right: 16 }} onClick={onClose}><X size={18} /></button>
        <h3 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 700 }}>Add recurring transaction</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 24px' }}>For subscriptions, rent, salary, etc.</p>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button type="button" className={`bb-btn ${type === 'expense' ? 'bb-btn-primary' : 'bb-btn-ghost'}`} style={{ flex: 1 }} onClick={() => setType('expense')}>
              <ArrowUpRight size={16} /> Expense
            </button>
            <button type="button" className={`bb-btn ${type === 'income' ? 'bb-btn-primary' : 'bb-btn-ghost'}`} style={{ flex: 1 }} onClick={() => setType('income')}>
              <ArrowDownLeft size={16} /> Income
            </button>
          </div>
          <div className="field-group">
            <label className="field-label">Name</label>
            <input className="field-input" placeholder="e.g. Netflix Subscription" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field-group">
              <label className="field-label">Amount</label>
              <div className="search-field" style={{ height: 48 }}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>$</span>
                <input type="number" step="0.01" style={{ background: 'transparent', border: 0, height: '100%', padding: 0, fontSize: 14, color: 'var(--text)' }} placeholder="15.49" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Frequency</label>
              <select className="field-input" style={{ cursor: 'pointer' }} value={frequency} onChange={(e) => setFrequency(e.target.value as typeof frequency)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field-group">
              <label className="field-label">Category</label>
              <select className="field-input" style={{ cursor: 'pointer' }} value={category} onChange={(e) => setCategory(e.target.value)}>
                {DEFAULT_CATEGORIES.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Next date</label>
              <input type="date" className="field-input" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <Button variant="ghost" type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
            <Button type="submit" style={{ flex: 1 }} icon={<Check size={16} />}>Add</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
