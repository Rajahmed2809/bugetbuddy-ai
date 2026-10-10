'use client'

import {
  Bell,
  Check,
  Trash2,
  Target,
  CalendarClock,
  TrendingUp,
  Sparkles,
  CheckCheck,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatDate } from '@/lib/format'
import type { NotificationType } from '@/lib/types'
import { Button } from '../shared'

const ICON_MAP: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  budget: { icon: Target, color: 'orange' },
  recurring: { icon: CalendarClock, color: 'blue' },
  goal: { icon: Sparkles, color: 'green' },
  summary: { icon: TrendingUp, color: 'violet' },
  insight: { icon: TrendingUp, color: 'cyan' },
}

export function NotificationsView() {
  const notifications = useStore((s) => s.notifications)
  const markRead = useStore((s) => s.markNotificationRead)
  const markAllRead = useStore((s) => s.markAllNotificationsRead)
  const deleteNotification = useStore((s) => s.deleteNotification)
  const setToast = useStore((s) => s.setToast)
  const setAppView = useStore((s) => s.setAppView)

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="tab-view">
      <div className="tab-view-heading">
        <div>
          <span className="muted-label">YOUR ALERTS</span>
          <h4>Notifications</h4>
          <p>{unread} unread · {notifications.length} total</p>
        </div>
        {unread > 0 && (
          <Button variant="ghost" onClick={() => { markAllRead(); setToast('All notifications marked as read') }} icon={<CheckCheck size={16} />}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="dashboard-card empty-state" style={{ minHeight: 240 }}>
          <Bell size={28} />
          <b>No notifications</b>
          <span>You&apos;re all caught up! Budget alerts and reminders will appear here.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n) => {
            const { icon: Icon, color } = ICON_MAP[n.type] || ICON_MAP.summary
            return (
              <div key={n.id} className={`notification-item ${n.read ? '' : 'unread'}`}>
                <span className={`notification-icon budget-icon ${color}`}>
                  <Icon size={18} />
                </span>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {n.title}
                    {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />}
                  </b>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0', lineHeight: 1.4 }}>{n.message}</p>
                  <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>{formatDate(n.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {!n.read && (
                    <button className="icon-button" style={{ width: 32, height: 32 }} onClick={() => markRead(n.id)} aria-label="Mark read">
                      <Check size={14} />
                    </button>
                  )}
                  <button className="icon-button" style={{ width: 32, height: 32 }} onClick={() => deleteNotification(n.id)} aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="dashboard-card budget-callout">
        <div className="insight-spark"><Sparkles size={18} /></div>
        <div>
          <b>Smart notifications</b>
          <p>BudgetBuddy sends alerts for budget warnings, recurring payment reminders, savings milestones, and weekly summaries. Configure these in Settings.</p>
        </div>
        <Button variant="ghost" onClick={() => setAppView('Settings')}>Configure</Button>
      </div>
    </div>
  )
}
