'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  Target,
  Check,
  X,
  Calendar,
  ChevronRight,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { getGoalProgress } from '@/lib/analytics'
import { formatCurrency, formatDateShort, daysBetween, todayISO } from '@/lib/format'
import type { SavingsGoal, ColorKey } from '@/lib/types'
import { Button } from '../shared'

const COLORS: ColorKey[] = ['green', 'cyan', 'blue', 'violet', 'orange', 'amber']

export function GoalsView() {
  const goals = useStore((s) => s.goals)
  const addGoal = useStore((s) => s.addGoal)
  const deleteGoal = useStore((s) => s.deleteGoal)
  const contributeToGoal = useStore((s) => s.contributeToGoal)
  const setToast = useStore((s) => s.setToast)
  const profile = useStore((s) => s.profile)
  const [showModal, setShowModal] = useState(false)
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null)
  const [contributeAmount, setContributeAmount] = useState('')

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0)
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)

  const handleContribute = () => {
    if (!contributeGoal || !contributeAmount) return
    const amount = parseFloat(contributeAmount)
    if (amount <= 0) return
    contributeToGoal(contributeGoal.id, amount)
    setToast(`Added ${formatCurrency(amount, profile?.currency)} to ${contributeGoal.name}`)
    setContributeGoal(null)
    setContributeAmount('')
  }

  return (
    <div className="tab-view">
      <div className="tab-view-heading">
        <div>
          <span className="muted-label">SAVE WITH PURPOSE</span>
          <h4>Savings goals</h4>
          <p>{formatCurrency(totalSaved, profile?.currency)} saved of {formatCurrency(totalTarget, profile?.currency)} target across {goals.length} goals</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={<Plus size={16} />}>New goal</Button>
      </div>

      {goals.length === 0 ? (
        <div className="dashboard-card empty-state" style={{ minHeight: 240 }}>
          <Target size={28} />
          <b>No savings goals yet</b>
          <span>Create your first goal to start tracking progress toward what matters</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {goals.map((goal) => {
            const progress = getGoalProgress(goal)
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)
            const daysLeft = goal.targetDate ? daysBetween(new Date(), new Date(goal.targetDate)) : null
            const onTrack = daysLeft !== null && daysLeft > 0
              ? goal.currentAmount >= (goal.targetAmount * (1 - daysLeft / (daysLeft + 30)))
              : true
            return (
              <div className="dashboard-card" key={goal.id} style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className={`budget-icon ${goal.color}`} style={{ width: 44, height: 44 }}>
                    <Target size={20} />
                  </div>
                  <button className="icon-button" style={{ width: 28, height: 28 }} onClick={() => deleteGoal(goal.id)} aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
                <h5 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{goal.name}</h5>
                {goal.targetDate && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                    <Calendar size={12} /> {formatDateShort(goal.targetDate)}
                  </span>
                )}
                <div className="goal-progress-head" style={{ marginTop: 12 }}>
                  <b>{formatCurrency(goal.currentAmount, profile?.currency)}</b>
                  <span>of {formatCurrency(goal.targetAmount, profile?.currency)}</span>
                </div>
                <div className="progress-track" style={{ height: 10 }}>
                  <i className={goal.color} style={{ width: `${progress}%` }} />
                </div>
                <div className="goal-footer">
                  <span>{progress}% complete</span>
                  <span>{formatCurrency(remaining, profile?.currency)} to go</span>
                </div>
                {daysLeft !== null && (
                  <div style={{ marginTop: 8, fontSize: 11, color: onTrack ? 'var(--green)' : 'var(--orange)' }}>
                    {daysLeft > 0 ? `${daysLeft} days left · ${onTrack ? 'On track' : 'Behind pace'}` : 'Goal date passed'}
                  </div>
                )}
                {progress < 100 && (
                  <button
                    className="bb-btn bb-btn-ghost"
                    style={{ width: '100%', marginTop: 16, height: 38 }}
                    onClick={() => setContributeGoal(goal)}
                  >
                    Add money
                  </button>
                )}
                {progress >= 100 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, padding: '10px', borderRadius: 10, background: 'rgba(99,230,167,0.12)', color: 'var(--green)', fontWeight: 600, fontSize: 14 }}>
                    <Check size={16} /> Goal achieved!
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <GoalModal
          onClose={() => setShowModal(false)}
          onSave={(goal) => {
            addGoal(goal)
            setToast('Savings goal created')
            setShowModal(false)
          }}
        />
      )}

      {contributeGoal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setContributeGoal(null)}>
          <div className="glass-strong" style={{ width: '100%', maxWidth: 380, borderRadius: 20, padding: 28, position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button className="icon-button" style={{ position: 'absolute', top: 16, right: 16 }} onClick={() => setContributeGoal(null)}><X size={18} /></button>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 700 }}>Add to {contributeGoal.name}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 20px' }}>
              Current: {formatCurrency(contributeGoal.currentAmount, profile?.currency)} / {formatCurrency(contributeGoal.targetAmount, profile?.currency)}
            </p>
            <div className="search-field" style={{ height: 56 }}>
              <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: '1.2rem' }}>$</span>
              <input
                type="number"
                step="0.01"
                style={{ background: 'transparent', border: 0, height: '100%', padding: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}
                placeholder="100.00"
                value={contributeAmount}
                onChange={(e) => setContributeAmount(e.target.value)}
                autoFocus
              />
            </div>
            <Button onClick={handleContribute} style={{ width: '100%', marginTop: 20 }} icon={<Check size={16} />}>Add to goal</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function GoalModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void
}) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [color, setColor] = useState<ColorKey>('green')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !targetAmount) return
    onSave({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      color,
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div className="glass-strong" style={{ width: '100%', maxWidth: 440, borderRadius: 20, padding: 28, position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button className="icon-button" style={{ position: 'absolute', top: 16, right: 16 }} onClick={onClose}><X size={18} /></button>
        <h3 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 700 }}>Create savings goal</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 24px' }}>Set a target and track your progress</p>
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Goal name</label>
            <input className="field-input" placeholder="e.g. Japan Trip" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="field-group">
            <label className="field-label">Target amount</label>
            <div className="search-field" style={{ height: 48 }}>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>$</span>
              <input type="number" step="0.01" style={{ background: 'transparent', border: 0, height: '100%', padding: 0, fontSize: 14, color: 'var(--text)' }} placeholder="5000.00" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Target date (optional)</label>
            <input type="date" className="field-input" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} min={todayISO()} />
          </div>
          <div className="field-group">
            <label className="field-label">Color</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map((c) => (
                <button key={c} type="button" style={{ width: 36, height: 36, borderRadius: 10, background: COLOR_BG[c], border: color === c ? '2px solid var(--text)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setColor(c)} aria-label={c} />
              ))}
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

const COLOR_BG: Record<ColorKey, string> = {
  green: '#63e6a7',
  cyan: '#72d7df',
  blue: '#83aaf7',
  violet: '#b8a7f4',
  orange: '#f3ad78',
  amber: '#e9b949',
  red: '#ef6a6a',
}
