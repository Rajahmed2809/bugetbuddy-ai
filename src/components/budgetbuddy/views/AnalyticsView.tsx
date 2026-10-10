'use client'

import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Download,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import {
  calculateIncome,
  calculateExpenses,
  getCategoryBreakdown,
  getMonthlyTrend,
  getDailyTrend,
  filterByDateRange,
} from '@/lib/analytics'
import { formatCurrency, formatDateShort, toCSV, todayISO } from '@/lib/format'
import { CATEGORY_COLORS } from '@/lib/types'
import { Button } from '../shared'

const COLOR_VALUES: Record<string, string> = {
  green: '#63e6a7',
  cyan: '#72d7df',
  blue: '#83aaf7',
  violet: '#b8a7f4',
  orange: '#f3ad78',
  amber: '#e9b949',
  red: '#ef6a6a',
}

type RangePreset = '7d' | '30d' | '90d' | 'month' | 'year'

export function AnalyticsView() {
  const transactions = useStore((s) => s.transactions)
  const setToast = useStore((s) => s.setToast)
  const profile = useStore((s) => s.profile)

  const [preset, setPreset] = useState<RangePreset>('30d')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const { start, end } = useMemo(() => {
    if (preset === 'custom' && customStart && customEnd) {
      return { start: new Date(customStart), end: new Date(customEnd) }
    }
    const now = new Date()
    const e = new Date(now)
    let s = new Date(now)
    switch (preset) {
      case '7d': s.setDate(s.getDate() - 7); break
      case '30d': s.setDate(s.getDate() - 30); break
      case '90d': s.setDate(s.getDate() - 90); break
      case 'month': s = new Date(now.getFullYear(), now.getMonth(), 1); break
      case 'year': s = new Date(now.getFullYear(), 0, 1); break
    }
    return { start: s, end: e }
  }, [preset, customStart, customEnd])

  const rangeTx = useMemo(() => filterByDateRange(transactions, start, end), [transactions, start, end])
  const income = calculateIncome(rangeTx)
  const expenses = calculateExpenses(rangeTx)
  const net = income - expenses

  const monthlyTrend = useMemo(() => getMonthlyTrend(transactions, 6), [transactions])
  const dailyTrend = useMemo(() => getDailyTrend(transactions, 14), [transactions])
  const categoryData = useMemo(() => getCategoryBreakdown(rangeTx), [rangeTx])

  const pieData = categoryData.map((c) => ({
    name: c.category,
    value: c.amount,
    color: COLOR_VALUES[CATEGORY_COLORS[c.category] || 'amber'],
  }))

  const handleExportCSV = () => {
    const rows = rangeTx.map((t) => ({
      Date: formatDateShort(t.date),
      Name: t.name,
      Type: t.type,
      Amount: t.amount.toFixed(2),
      Category: t.category,
      'Payment Method': t.paymentMethod,
    }))
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budgetbuddy-analytics-${todayISO()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setToast(`Exported ${rows.length} records`)
  }

  const handleExportPDF = () => {
    // Generate a printable report
    const win = window.open('', '_blank')
    if (!win) {
      setToast('Please allow popups to export PDF')
      return
    }
    const html = `
      <!DOCTYPE html><html><head><title>BudgetBuddy Analytics Report</title>
      <style>
        body { font-family: 'Manrope', sans-serif; background: #06100d; color: #e9f2ec; padding: 48px; }
        h1 { color: #63e6a7; font-size: 2rem; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 32px 0; }
        .card { background: rgba(15,31,24,0.5); border: 1px solid rgba(207,242,218,0.13); border-radius: 12px; padding: 20px; }
        .card b { font-size: 1.5rem; display: block; }
        .card span { color: #8da297; font-size: 0.85rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th { text-align: left; color: #63e6a7; font-size: 0.8rem; text-transform: uppercase; padding: 10px; border-bottom: 1px solid rgba(207,242,218,0.2); }
        td { padding: 10px; border-bottom: 1px solid rgba(207,242,218,0.08); font-size: 0.9rem; }
        .positive { color: #63e6a7; }
      </style></head><body>
      <h1>BudgetBuddy Analytics Report</h1>
      <p style="color:#8da297">${formatDateShort(start)} — ${formatDateShort(end)}</p>
      <div class="summary">
        <div class="card"><span>Total Income</span><b style="color:#63e6a7">${formatCurrency(income, profile?.currency)}</b></div>
        <div class="card"><span>Total Expenses</span><b style="color:#f3ad78">${formatCurrency(expenses, profile?.currency)}</b></div>
        <div class="card"><span>Net</span><b style="color:${net >= 0 ? '#63e6a7' : '#f3ad78'}">${formatCurrency(net, profile?.currency)}</b></div>
      </div>
      <h2>Transactions (${rangeTx.length})</h2>
      <table><thead><tr><th>Date</th><th>Name</th><th>Category</th><th>Amount</th></tr></thead><tbody>
      ${rangeTx.map((t) => `<tr><td>${formatDateShort(t.date)}</td><td>${t.name}</td><td>${t.category}</td><td class="${t.type === 'income' ? 'positive' : ''}">${t.type === 'income' ? '+' : '−'}${formatCurrency(t.amount, profile?.currency)}</td></tr>`).join('')}
      </tbody></table>
      <p style="color:#668074;margin-top:32px;font-size:0.8rem">Generated by BudgetBuddy AI on ${new Date().toLocaleString()}</p>
      </body></html>
    `
    win.document.write(html)
    win.document.close()
    setTimeout(() => { win.print() }, 500)
    setToast('PDF report opened in new tab')
  }

  const rangeLabel = preset === '7d' ? 'Last 7 days' : preset === '30d' ? 'Last 30 days' : preset === '90d' ? 'Last 90 days' : preset === 'month' ? 'This month' : preset === 'year' ? 'This year' : 'Custom range'

  return (
    <div className="tab-view">
      <div className="tab-view-heading">
        <div>
          <span className="muted-label">DEEPER ANALYSIS</span>
          <h4>Analytics</h4>
          <p>{rangeLabel} · {rangeTx.length} transactions · {formatCurrency(income, profile?.currency)} in · {formatCurrency(expenses, profile?.currency)} out</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={handleExportCSV} icon={<Download size={16} />}>CSV</Button>
          <Button variant="ghost" onClick={handleExportPDF} icon={<FileText size={16} />}>PDF</Button>
        </div>
      </div>

      {/* Range selector */}
      <div className="filter-row">
        {(['7d', '30d', '90d', 'month', 'year'] as RangePreset[]).map((p) => (
          <button
            key={p}
            className={`filter-button ${preset === p ? 'active' : ''}`}
            style={{
              borderColor: preset === p ? 'var(--green)' : 'var(--line)',
              background: preset === p ? 'rgba(99,230,167,0.1)' : 'var(--surface-soft)',
            }}
            onClick={() => setPreset(p)}
          >
            {p === '7d' ? '7 days' : p === '30d' ? '30 days' : p === '90d' ? '90 days' : p === 'month' ? 'This month' : 'This year'}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-head">
            <span>Income</span>
            <span className="metric-icon green"><ArrowDownLeft size={18} /></span>
          </div>
          <div className="metric-value">{formatCurrency(income, profile?.currency)}</div>
          <div className="metric-foot"><span className="trend-up">↗ Total inflow</span></div>
        </div>
        <div className="metric-card">
          <div className="metric-head">
            <span>Expenses</span>
            <span className="metric-icon orange"><ArrowUpRight size={18} /></span>
          </div>
          <div className="metric-value">{formatCurrency(expenses, profile?.currency)}</div>
          <div className="metric-foot"><span className="trend-down">↘ Total outflow</span></div>
        </div>
        <div className="metric-card">
          <div className="metric-head">
            <span>Net</span>
            <span className="metric-icon blue"><TrendingUp size={18} /></span>
          </div>
          <div className="metric-value" style={{ color: net >= 0 ? 'var(--green)' : 'var(--orange)' }}>{formatCurrency(net, profile?.currency)}</div>
          <div className="metric-foot"><span>{net >= 0 ? 'Surplus' : 'Deficit'}</span></div>
        </div>
        <div className="metric-card">
          <div className="metric-head">
            <span>Avg per day</span>
            <span className="metric-icon violet"><Calendar size={18} /></span>
          </div>
          <div className="metric-value">{formatCurrency(expenses / Math.max(Math.ceil((end.getTime() - start.getTime()) / 86400000), 1), profile?.currency)}</div>
          <div className="metric-foot"><span>Spending rate</span></div>
        </div>
      </div>

      {/* Monthly trend chart */}
      <div className="dashboard-card" style={{ marginTop: 16 }}>
        <div className="card-heading">
          <div>
            <span className="muted-label">6-MONTH TREND</span>
            <h5>Income vs. expenses</h5>
          </div>
        </div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(207,242,218,0.08)" />
              <XAxis dataKey="month" stroke="#668074" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#668074" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip
                contentStyle={{ background: 'var(--surface-solid)', border: '1px solid var(--line-strong)', borderRadius: '12px', fontSize: '13px' }}
                formatter={(value: number) => formatCurrency(value, profile?.currency)}
                cursor={{ fill: 'rgba(99,230,167,0.05)' }}
              />
              <Bar dataKey="income" fill="#63e6a7" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#83aaf7" radius={[6, 6, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily trend + category breakdown */}
      <div className="dashboard-grid top-grid" style={{ marginTop: 16 }}>
        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="muted-label">14-DAY PULSE</span>
              <h5>Daily spending</h5>
            </div>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(207,242,218,0.08)" />
                <XAxis dataKey="day" stroke="#668074" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#668074" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-solid)', border: '1px solid var(--line-strong)', borderRadius: '12px', fontSize: '13px' }}
                  formatter={(value: number) => formatCurrency(value, profile?.currency)}
                />
                <Line type="monotone" dataKey="expenses" stroke="#f3ad78" strokeWidth={2.5} dot={{ fill: '#f3ad78', r: 3 }} name="Expenses" />
                <Line type="monotone" dataKey="income" stroke="#63e6a7" strokeWidth={2.5} dot={{ fill: '#63e6a7', r: 3 }} name="Income" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="muted-label">CATEGORY BREAKDOWN</span>
              <h5>Where money goes</h5>
            </div>
          </div>
          {pieData.length === 0 ? (
            <div className="empty-state"><TrendingDown size={22} /><b>No expenses in this range</b></div>
          ) : (
            <>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--surface-solid)', border: '1px solid var(--line-strong)', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: number) => formatCurrency(value, profile?.currency)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                {categoryData.slice(0, 5).map((c) => (
                  <div key={c.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--muted)' }}>
                      <i style={{ width: 8, height: 8, borderRadius: '50%', background: COLOR_VALUES[CATEGORY_COLORS[c.category] || 'amber'], display: 'inline-block' }} />
                      {c.category}
                    </span>
                    <b>{formatCurrency(c.amount, profile?.currency)}</b>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
