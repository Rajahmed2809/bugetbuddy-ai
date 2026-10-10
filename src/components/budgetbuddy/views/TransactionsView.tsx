'use client'

import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  ChevronDown,
  Download,
  Trash2,
  Pencil,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatCurrency, formatDate, formatDateShort, toCSV, todayISO } from '@/lib/format'
import { CATEGORY_COLORS, DEFAULT_CATEGORIES, PAYMENT_METHODS } from '@/lib/types'
import type { Transaction, TransactionType } from '@/lib/types'
import { Button } from '../shared'

export function TransactionsView() {
  const transactions = useStore((s) => s.transactions)
  const addTransaction = useStore((s) => s.addTransaction)
  const updateTransaction = useStore((s) => s.updateTransaction)
  const deleteTransaction = useStore((s) => s.deleteTransaction)
  const setToast = useStore((s) => s.setToast)
  const profile = useStore((s) => s.profile)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = `${t.name} ${t.category} ${t.note || ''}`.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === 'all' || t.type === typeFilter
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter
      return matchesSearch && matchesType && matchesCategory
    })
  }, [transactions, search, typeFilter, categoryFilter])

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const handleExport = () => {
    const rows = filtered.map((t) => ({
      Date: formatDateShort(t.date),
      Name: t.name,
      Type: t.type,
      Amount: t.amount.toFixed(2),
      Category: t.category,
      'Payment Method': t.paymentMethod,
      Note: t.note || '',
    }))
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budgetbuddy-transactions-${todayISO()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setToast(`Exported ${rows.length} transactions to CSV`)
  }

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    deleteTransaction(id)
    setToast('Transaction deleted')
  }

  return (
    <div className="tab-view">
      {/* Header */}
      <div className="tab-view-heading">
        <div>
          <span className="muted-label">YOUR MONEY TRAIL</span>
          <h4>Transactions</h4>
          <p>{filtered.length} transactions · {formatCurrency(totalIncome, profile?.currency)} in · {formatCurrency(totalExpenses, profile?.currency)} out</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={handleExport} icon={<Download size={16} />}>Export CSV</Button>
          <Button onClick={() => { setEditingTx(null); setShowModal(true) }} icon={<Plus size={16} />}>Add transaction</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Search merchant, category, or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className={`filter-button ${typeFilter !== 'all' ? 'active' : ''}`}
          onClick={() => {
            const types: ('all' | TransactionType)[] = ['all', 'expense', 'income']
            const idx = types.indexOf(typeFilter)
            setTypeFilter(types[(idx + 1) % types.length])
          }}
        >
          {typeFilter === 'all' ? 'All types' : typeFilter === 'income' ? 'Income only' : 'Expenses only'}
          <ChevronDown size={15} />
        </button>
        <select
          className="filter-button"
          style={{ height: 42, cursor: 'pointer' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          {DEFAULT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="dashboard-card full-card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Search size={22} />
            <b>No matching transactions</b>
            <span>Try a different search or filter</span>
          </div>
        ) : (
          <div className="transaction-list">
            {filtered.map((t) => {
              const color = CATEGORY_COLORS[t.category] || 'amber'
              const icon = t.name.charAt(0).toUpperCase()
              return (
                <div className="transaction-row" key={t.id} style={{ gridTemplateColumns: 'auto 1fr auto auto auto auto' }}>
                  <span className={`merchant-avatar ${color}`}>{icon}</span>
                  <span className="transaction-primary">
                    <b>{t.name}</b>
                    <small>{t.category} · {t.paymentMethod}{t.note ? ` · ${t.note}` : ''}</small>
                  </span>
                  <span className="transaction-date">{formatDate(t.date)}</span>
                  <b className={t.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                    {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount, profile?.currency)}
                  </b>
                  <button className="icon-button" style={{ width: 32, height: 32 }} onClick={() => handleEdit(t)} aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                  <button className="icon-button" style={{ width: 32, height: 32 }} onClick={() => handleDelete(t.id)} aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <TransactionModal
          transaction={editingTx}
          onClose={() => { setShowModal(false); setEditingTx(null) }}
          onSave={(tx) => {
            if (editingTx) {
              updateTransaction(editingTx.id, tx)
              setToast('Transaction updated')
            } else {
              addTransaction(tx)
              setToast('Transaction added')
            }
            setShowModal(false)
            setEditingTx(null)
          }}
        />
      )}
    </div>
  )
}

function TransactionModal({
  transaction,
  onClose,
  onSave,
}: {
  transaction: Transaction | null
  onClose: () => void
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void
}) {
  const [type, setType] = useState<TransactionType>(transaction?.type || 'expense')
  const [name, setName] = useState(transaction?.name || '')
  const [amount, setAmount] = useState(transaction?.amount.toString() || '')
  const [date, setDate] = useState(transaction?.date?.split('T')[0] || todayISO())
  const [category, setCategory] = useState(transaction?.category || 'Groceries')
  const [paymentMethod, setPaymentMethod] = useState(transaction?.paymentMethod || 'Card')
  const [note, setNote] = useState(transaction?.note || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount) return
    onSave({
      type,
      name,
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      category,
      paymentMethod,
      note: note || undefined,
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="glass-strong"
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 20,
          padding: 28,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="icon-button" style={{ position: 'absolute', top: 16, right: 16 }} onClick={onClose}>
          <X size={18} />
        </button>
        <h3 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 700 }}>
          {transaction ? 'Edit transaction' : 'Add transaction'}
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 24px' }}>
          {transaction ? 'Update the details below' : 'Enter the details below'}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              className={`bb-btn ${type === 'expense' ? 'bb-btn-primary' : 'bb-btn-ghost'}`}
              style={{ flex: 1, height: 44 }}
              onClick={() => setType('expense')}
            >
              <ArrowUpRight size={16} /> Expense
            </button>
            <button
              type="button"
              className={`bb-btn ${type === 'income' ? 'bb-btn-primary' : 'bb-btn-ghost'}`}
              style={{ flex: 1, height: 44 }}
              onClick={() => setType('income')}
            >
              <ArrowDownLeft size={16} /> Income
            </button>
          </div>

          <div className="field-group">
            <label className="field-label">Description</label>
            <input
              className="field-input"
              placeholder="e.g. Whole Foods Market"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field-group">
              <label className="field-label">Amount</label>
              <div className="search-field" style={{ height: 48 }}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  className="field-input"
                  style={{ background: 'transparent', border: 0, height: '100%', padding: 0 }}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Date</label>
              <input
                type="date"
                className="field-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field-group">
              <label className="field-label">Category</label>
              <select className="field-input" style={{ cursor: 'pointer' }} value={category} onChange={(e) => setCategory(e.target.value)}>
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Payment method</label>
              <select className="field-input" style={{ cursor: 'pointer' }} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Note (optional)</label>
            <input
              className="field-input"
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <Button variant="ghost" type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
            <Button type="submit" style={{ flex: 1 }}>{transaction ? 'Save changes' : 'Add transaction'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
