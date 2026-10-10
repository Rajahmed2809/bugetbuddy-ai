'use client'

import { useState } from 'react'
import {
  User,
  Globe,
  Bell,
  Moon,
  Sun,
  LogOut,
  Palette,
  Zap,
  RotateCcw,
  Trash2,
  Check,
  Shield,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import type { Theme } from '@/lib/types'
import { Button } from '../shared'

export function SettingsView() {
  const profile = useStore((s) => s.profile)
  const preferences = useStore((s) => s.preferences)
  const updatePreferences = useStore((s) => s.updatePreferences)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const logout = useStore((s) => s.logout)
  const setToast = useStore((s) => s.setToast)
  const clearAllData = useStore((s) => s.clearAllData)
  const isDemoMode = useStore((s) => s.isDemoMode)
  const [name, setName] = useState(profile?.name || '')
  const [email, setEmail] = useState(profile?.email || '')

  const handleSaveProfile = () => {
    setToast('Profile updated')
  }

  const handleClearData = () => {
    if (confirm('This will delete all your transactions, budgets, goals, and notifications. This cannot be undone. Continue?')) {
      clearAllData()
      setToast('All data cleared')
    }
  }

  return (
    <div className="tab-view">
      <div className="tab-view-heading">
        <div>
          <span className="muted-label">PERSONALIZE</span>
          <h4>Settings</h4>
          <p>Manage your profile, preferences, and account</p>
        </div>
      </div>

      {/* Profile */}
      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <span className="muted-label">PROFILE</span>
            <h5>Account information</h5>
          </div>
          <div className="settings-row-icon green" style={{ background: 'rgba(99,230,167,0.16)', color: 'var(--green)' }}>
            <User size={18} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field-group">
            <label className="field-label">Full name</label>
            <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field-group">
            <label className="field-label">Email</label>
            <input className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} disabled style={{ opacity: 0.6 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Button onClick={handleSaveProfile} icon={<Check size={16} />}>Save changes</Button>
        </div>
      </div>

      {/* Appearance */}
      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <span className="muted-label">APPEARANCE</span>
            <h5>Theme & display</h5>
          </div>
          <div className="settings-row-icon violet" style={{ background: 'rgba(184,167,244,0.16)', color: 'var(--violet)' }}>
            <Palette size={18} />
          </div>
        </div>
        <div className="settings-section">
          <div className="settings-row">
            <div>
              <div className="settings-row-icon green" style={{ background: 'rgba(99,230,167,0.16)', color: 'var(--green)' }}>
                {preferences.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <b>Theme</b>
                <small>Currently using {preferences.theme} theme</small>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={`bb-btn ${preferences.theme === 'dark' ? 'bb-btn-primary' : 'bb-btn-ghost'}`}
                style={{ height: 36, padding: '0 12px', fontSize: 13 }}
                onClick={() => preferences.theme !== 'dark' && toggleTheme()}
              >
                <Moon size={14} /> Dark
              </button>
              <button
                className={`bb-btn ${preferences.theme === 'light' ? 'bb-btn-primary' : 'bb-btn-ghost'}`}
                style={{ height: 36, padding: '0 12px', fontSize: 13 }}
                onClick={() => preferences.theme !== 'light' && toggleTheme()}
              >
                <Sun size={14} /> Light
              </button>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-icon blue" style={{ background: 'rgba(131,170,247,0.16)', color: 'var(--blue)' }}>
                <Zap size={18} />
              </div>
              <div>
                <b>Reduce motion</b>
                <small>Minimize animations for accessibility</small>
              </div>
            </div>
            <button className={`toggle-switch ${preferences.reduceMotion ? 'on' : ''}`} onClick={() => updatePreferences({ reduceMotion: !preferences.reduceMotion })} aria-label="Toggle reduce motion" />
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <span className="muted-label">PREFERENCES</span>
            <h5>Currency & locale</h5>
          </div>
          <div className="settings-row-icon blue" style={{ background: 'rgba(131,170,247,0.16)', color: 'var(--blue)' }}>
            <Globe size={18} />
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">Currency</label>
          <select
            className="field-input"
            style={{ cursor: 'pointer' }}
            value={preferences.currency}
            onChange={(e) => { updatePreferences({ currency: e.target.value }); setToast('Currency updated') }}
          >
            <option value="USD">$ US Dollar (USD)</option>
            <option value="EUR">€ Euro (EUR)</option>
            <option value="GBP">£ British Pound (GBP)</option>
            <option value="INR">₹ Indian Rupee (INR)</option>
            <option value="JPY">¥ Japanese Yen (JPY)</option>
            <option value="CAD">C$ Canadian Dollar (CAD)</option>
            <option value="AUD">A$ Australian Dollar (AUD)</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <span className="muted-label">NOTIFICATIONS</span>
            <h5>What to alert me about</h5>
          </div>
          <div className="settings-row-icon orange" style={{ background: 'rgba(243,173,120,0.16)', color: 'var(--orange)' }}>
            <Bell size={18} />
          </div>
        </div>
        <div className="settings-section">
          <NotificationToggle
            label="Budget warnings"
            description="Alert when approaching budget limits"
            value={preferences.notifyBudget}
            onChange={(v) => updatePreferences({ notifyBudget: v })}
          />
          <NotificationToggle
            label="Recurring payment reminders"
            description="Remind you before recurring payments are due"
            value={preferences.notifyRecurring}
            onChange={(v) => updatePreferences({ notifyRecurring: v })}
          />
          <NotificationToggle
            label="Savings milestones"
            description="Celebrate progress on your savings goals"
            value={preferences.notifyGoals}
            onChange={(v) => updatePreferences({ notifyGoals: v })}
          />
          <NotificationToggle
            label="Monthly summaries"
            description="A monthly digest of your spending and savings"
            value={preferences.notifySummary}
            onChange={(v) => updatePreferences({ notifySummary: v })}
          />
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <span className="muted-label">DATA & PRIVACY</span>
            <h5>Your data stays yours</h5>
          </div>
          <div className="settings-row-icon green" style={{ background: 'rgba(99,230,167,0.16)', color: 'var(--green)' }}>
            <Shield size={18} />
          </div>
        </div>
        <div className="settings-section">
          <div className="settings-row">
            <div>
              <div className="settings-row-icon violet" style={{ background: 'rgba(184,167,244,0.16)', color: 'var(--violet)' }}>
                <RotateCcw size={18} />
              </div>
              <div>
                <b>Demo mode</b>
                <small>{isDemoMode ? 'Currently using demo data' : 'Not using demo data'}</small>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setToast('Demo data status checked')}>Check status</Button>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-icon orange" style={{ background: 'rgba(243,173,120,0.16)', color: 'var(--orange)' }}>
                <Trash2 size={18} />
              </div>
              <div>
                <b>Clear all data</b>
                <small>Remove all transactions, budgets, goals, and notifications</small>
              </div>
            </div>
            <Button variant="ghost" onClick={handleClearData} icon={<Trash2 size={16} />}>Clear</Button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderColor: 'rgba(239,106,106,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="settings-row-icon" style={{ background: 'rgba(239,106,106,0.16)', color: 'var(--red)' }}>
            <LogOut size={18} />
          </div>
          <div>
            <b>Sign out</b>
            <small>End your session securely</small>
          </div>
        </div>
        <Button variant="ghost" onClick={logout} icon={<LogOut size={16} />} className="" style={{ color: 'var(--red)' }}>Sign out</Button>
      </div>
    </div>
  )
}

function NotificationToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="settings-row">
      <div>
        <div className="settings-row-icon green" style={{ background: 'rgba(99,230,167,0.16)', color: 'var(--green)' }}>
          <Bell size={18} />
        </div>
        <div>
          <b>{label}</b>
          <small>{description}</small>
        </div>
      </div>
      <button className={`toggle-switch ${value ? 'on' : ''}`} onClick={() => onChange(!value)} aria-label={`Toggle ${label}`} />
    </div>
  )
}
