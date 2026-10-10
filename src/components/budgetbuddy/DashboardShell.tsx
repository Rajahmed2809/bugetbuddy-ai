'use client'

import { useEffect, useState } from 'react'
import {
  ChartNoAxesCombined,
  ReceiptText,
  Target,
  TrendingUp,
  Bot,
  Zap,
  ScanLine,
  Settings2,
  CalendarClock,
  Search,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Sparkles,
  MoreHorizontal,
  Repeat,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { Logo } from './shared'
import type { AppView } from '@/lib/types'
import { OverviewView } from './views/OverviewView'
import { TransactionsView } from './views/TransactionsView'
import { ReceiptScannerView } from './views/ReceiptScannerView'
import { BudgetsView } from './views/BudgetsView'
import { AnalyticsView } from './views/AnalyticsView'
import { ForecastView } from './views/ForecastView'
import { AssistantView } from './views/AssistantView'
import { GoalsView } from './views/GoalsView'
import { RecurringView } from './views/RecurringView'
import { NotificationsView } from './views/NotificationsView'
import { SettingsView } from './views/SettingsView'

const NAV_ITEMS: { label: AppView; icon: typeof ChartNoAxesCombined }[] = [
  { label: 'Overview', icon: ChartNoAxesCombined },
  { label: 'Transactions', icon: ReceiptText },
  { label: 'Receipt Scanner', icon: ScanLine },
  { label: 'Budgets', icon: Target },
  { label: 'Analytics', icon: TrendingUp },
  { label: 'Forecast', icon: TrendingUp },
  { label: 'AI Assistant', icon: Bot },
]

const SECONDARY_NAV: { label: AppView; icon: typeof Zap }[] = [
  { label: 'Savings Goals', icon: Zap },
  { label: 'Recurring', icon: Repeat },
  { label: 'Notifications', icon: Bell },
  { label: 'Settings', icon: Settings2 },
]

export function DashboardShell() {
  const appView = useStore((s) => s.appView)
  const setAppView = useStore((s) => s.setAppView)
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const profile = useStore((s) => s.profile)
  const preferences = useStore((s) => s.preferences)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const logout = useStore((s) => s.logout)
  const setToast = useStore((s) => s.setToast)
  const notifications = useStore((s) => s.notifications)
  const transactions = useStore((s) => s.transactions)
  const isDemoMode = useStore((s) => s.isDemoMode)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length
  const initials = profile?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'U'
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setAppView('Transactions')
      setToast(`Searching for "${searchQuery}"`)
    }
  }

  const renderView = () => {
    switch (appView) {
      case 'Overview': return <OverviewView />
      case 'Transactions': return <TransactionsView />
      case 'Receipt Scanner': return <ReceiptScannerView />
      case 'Budgets': return <BudgetsView />
      case 'Analytics': return <AnalyticsView />
      case 'Forecast': return <ForecastView />
      case 'AI Assistant': return <AssistantView />
      case 'Savings Goals': return <GoalsView />
      case 'Recurring': return <RecurringView />
      case 'Notifications': return <NotificationsView />
      case 'Settings': return <SettingsView />
      default: return <OverviewView />
    }
  }

  return (
    <div className="app-frame" style={{ minHeight: '100vh', borderRadius: 0, border: 0 }}>
      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
           )}
      {/* Sidebar */}
      <aside className={`app-sidebar ${sidebarCollapsed ? 'is-collapsed' : ''} ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <Logo compact={sidebarCollapsed} />
          <button className="collapse-button mobile-hide" onClick={toggleSidebar} aria-label="Toggle sidebar">
            {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
          <button className="collapse-button mobile-only" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="workspace-chip" onClick={() => { setAppView('Settings'); setMobileNavOpen(false) }}>
          <span className="workspace-avatar">{initials}</span>
          <span>
            <b>{profile?.name || 'User'}</b>
            <small>{isDemoMode ? 'Demo workspace' : 'Personal workspace'}</small>
          </span>
          <ChevronRight size={14} className="mobile-hide" />
        </div>

        <nav className="app-nav">
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`app-nav-item ${appView === label ? 'active' : ''}`}
              onClick={() => { setAppView(label); setMobileNavOpen(false) }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {appView === label && <i />}
            </button>
          ))}
        </nav>

        <div className="sidebar-divider" />

        <nav className="app-nav secondary-nav">
          {SECONDARY_NAV.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`app-nav-item ${appView === label ? 'active' : ''}`}
              onClick={() => { setAppView(label); setMobileNavOpen(false) }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {appView === label && <i />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-ai" onClick={() => { setAppView('AI Assistant'); setMobileNavOpen(false) }}>
            <div className="ai-icon"><Sparkles size={15} /></div>
            <div>
              <b>AI companion</b>
              <small>{unreadCount > 0 ? `${unreadCount} new insights` : 'Ask anything'}</small>
            </div>
            <ChevronRight size={15} className="mobile-hide" />
          </div>
          <div className="sidebar-user">
            <span className="user-avatar">{initials}</span>
            <span>
              <b>{profile?.name || 'User'}</b>
              <small>{isDemoMode ? 'Demo plan' : 'Free plan'}</small>
            </span>
            <button onClick={(e) => { e.stopPropagation(); logout() }} aria-label="Logout" className="icon-button" style={{ width: 28, height: 28 }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="app-main">
        <header className="app-topbar">
          <button className="collapse-button mobile-only" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Open menu">
            <Menu size={18} />
          </button>
          <div className="mobile-brand">
            <Logo compact />
          </div>
          <div className="topbar-title">
            <span className="mobile-hide">{dateStr}</span>
            <h3>{appView}</h3>
          </div>
          <div className="topbar-actions">
            <div className="topbar-search mobile-hide" onClick={() => document.getElementById('global-search')?.focus()}>
              <Search size={16} />
              <input
                id="global-search"
                style={{ background: 'transparent', border: 0, outline: 'none', color: 'var(--text)', width: 140, fontSize: 13 }}
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <kbd>⌘K</kbd>
            </div>
            <button className="icon-button mobile-only" onClick={() => setAppView('Notifications')} aria-label="Notifications">
              <Search size={18} />
            </button>
            <button className="icon-button has-dot mobile-hide" onClick={() => setAppView('Notifications')} aria-label="Notifications">
              <CalendarClock size={18} />
            </button>
            <button
              className={`icon-button ${unreadCount > 0 ? 'has-dot' : ''}`}
              onClick={() => setAppView('Notifications')}
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <button className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">
              {preferences.theme === 'dark' ? <span style={{ fontSize: 14 }}>☀</span> : <span style={{ fontSize: 14 }}>☾</span>}
            </button>
            <div className="topbar-avatar" onClick={() => setAppView('Settings')} style={{ cursor: 'pointer' }}>{initials}</div>
          </div>
        </header>

        <div className="app-content">
          {transactions.length === 0 && appView !== 'Settings' && appView !== 'Notifications' && (
            <div className="dashboard-card" style={{ textAlign: 'center', padding: '48px 24px', marginBottom: 16 }}>
              <Sparkles size={28} style={{ color: 'var(--green)', marginBottom: 12 }} />
              <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem' }}>Welcome to your dashboard</h4>
              <p style={{ color: 'var(--muted)', margin: '0 0 16px' }}>Add your first transaction to get started, or explore with demo data.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="bb-btn bb-btn-primary" onClick={() => setAppView('Transactions')}>Add transaction</button>
              </div>
            </div>
          )}
          {renderView()}
        </div>
      </main>
    </div>
  )
}
