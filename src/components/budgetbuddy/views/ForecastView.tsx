'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import {
  TrendingUp,
  AlertCircle,
  Sparkles,
  Lightbulb,
  ChevronRight,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { forecastSpending, getMonthlyTrend, calculateExpenses, filterByMonth } from '@/lib/analytics'
import { formatCurrency } from '@/lib/format'
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

export function ForecastView() {
  const transactions = useStore((s) => s.transactions)
  const setAppView = useStore((s) => s.setAppView)
  const profile = useStore((s) => s.profile)

  const forecast = useMemo(() => forecastSpending(transactions), [transactions])
  const trend = useMemo(() => getMonthlyTrend(transactions, 6), [transactions])

  const now = new Date()
  const thisMonthExpenses = calculateExpenses(filterByMonth(transactions, now.getFullYear(), now.getMonth()))
  const lastMonthExpenses = calculateExpenses(filterByMonth(transactions, now.getFullYear(), now.getMonth() - 1))

  const projectedWithUncertainty = forecast.projected
  const lowerBound = forecast.projected - forecast.uncertainty
  const upperBound = forecast.projected + forecast.uncertainty

  // Build forecast chart data
  const chartData = trend.map((t) => ({
    month: t.month,
    actual: t.expenses,
  }))
  // Add projected months
  const nextMonthName = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'short' })
  const monthAfterName = new Date(now.getFullYear(), now.getMonth() + 2, 1).toLocaleDateString('en-US', { month: 'short' })
  chartData.push({ month: nextMonthName, actual: forecast.projected, projected: forecast.projected, lower: lowerBound, upper: upperBound })
  chartData.push({ month: monthAfterName, actual: null, projected: forecast.projected, lower: lowerBound, upper: upperBound })

  const confidenceColor = forecast.confidence === 'high' ? 'var(--green)' : forecast.confidence === 'medium' ? 'var(--amber)' : 'var(--orange)'
  const confidenceLabel = forecast.confidence === 'high' ? 'High confidence' : forecast.confidence === 'medium' ? 'Medium confidence' : 'Low confidence'
  const confidenceDesc = forecast.confidence === 'high'
    ? 'Based on 3 months of consistent spending data.'
    : forecast.confidence === 'medium'
    ? 'Spending varies month-to-month. Treat as an estimate.'
    : 'Not enough data for a reliable forecast. Add more transactions for better predictions.'

  return (
    <div className="tab-view">
      <div className="tab-view-heading">
        <div>
          <span className="muted-label">LOOKING AHEAD</span>
          <h4>Spending forecast</h4>
          <p>A grounded projection based on your recent spending rhythm.</p>
        </div>
        <span className="confidence-pill" style={{ color: confidenceColor, background: `${confidenceColor.replace('var(', 'rgba(').replace(')', ', 0.12)')}` }}>
          <i style={{ background: confidenceColor }} />{confidenceLabel}
        </span>
      </div>

      {/* Confidence disclaimer */}
      {forecast.confidence === 'low' && (
        <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: 12, borderColor: 'var(--amber)' }}>
          <AlertCircle size={20} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          <div>
            <b style={{ fontSize: 14 }}>Limited data for forecasting</b>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              We need at least 2-3 months of transaction history for reliable predictions. Add more transactions or use demo data to see a full forecast.
            </p>
          </div>
        </div>
      )}

      {/* Forecast hero */}
      <div className="forecast-hero dashboard-card">
        <div>
          <span className="muted-label">PROJECTED NEXT MONTH SPEND</span>
          <div className="forecast-number">
            {formatCurrency(forecast.projected, profile?.currency)}
            <span>± {formatCurrency(forecast.uncertainty, profile?.currency)}</span>
          </div>
          <p>
            {thisMonthExpenses > 0 && forecast.projected < thisMonthExpenses ? (
              <>That&apos;s <b>{formatCurrency(thisMonthExpenses - forecast.projected, profile?.currency)} less</b> than this month&apos;s pace.</>
            ) : thisMonthExpenses > 0 ? (
              <>That&apos;s <b>{formatCurrency(forecast.projected - thisMonthExpenses, profile?.currency)} more</b> than this month&apos;s pace.</>
            ) : (
              <>Based on your 3-month average spending pattern.</>
            )}
            {' '}Recurring commitments are already factored in.
          </p>
        </div>
        <div className="forecast-orb"><TrendingUp size={30} /></div>
      </div>

      {/* Forecast chart */}
      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <span className="muted-label">HISTORICAL + PROJECTED</span>
            <h5>Spending trajectory</h5>
          </div>
          <div className="legend">
            <span><i className="legend-dot blue-dot" />Actual</span>
            <span><i className="legend-dot green-dot" />Projected</span>
          </div>
        </div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#83aaf7" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#83aaf7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#63e6a7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#63e6a7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(207,242,218,0.08)" />
              <XAxis dataKey="month" stroke="#668074" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#668074" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip
                contentStyle={{ background: 'var(--surface-solid)', border: '1px solid var(--line-strong)', borderRadius: '12px', fontSize: '13px' }}
                formatter={(value: number) => formatCurrency(value || 0, profile?.currency)}
              />
              <ReferenceLine x={nextMonthName} stroke="rgba(99,230,167,0.3)" strokeDasharray="4 4" label={{ value: 'Now', position: 'top', fill: '#63e6a7', fontSize: 10 }} />
              <Area type="monotone" dataKey="actual" stroke="#83aaf7" strokeWidth={2.5} fill="url(#actualGrad)" name="Actual" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category estimates */}
      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <span className="muted-label">CATEGORY ESTIMATE</span>
            <h5>Where your money may go</h5>
          </div>
          <span className="muted-label">NEXT 30 DAYS</span>
        </div>
        {forecast.byCategory.length === 0 ? (
          <div className="empty-state">
            <TrendingUp size={22} />
            <b>No category data yet</b>
            <span>Add categorized transactions to see forecasts</span>
          </div>
        ) : (
          forecast.byCategory.slice(0, 6).map((item) => {
            const color = CATEGORY_COLORS[item.category] || 'amber'
            const maxAmount = forecast.byCategory[0].amount || 1
            const width = Math.round((item.amount / maxAmount) * 100)
            return (
              <div className="forecast-row" key={item.category}>
                <span>{item.category}</span>
                <div className="forecast-bar">
                  <i className={color} style={{ width: `${width}%` }} />
                </div>
                <b>{formatCurrency(item.amount, profile?.currency)}</b>
              </div>
            )
          })
        )}
      </div>

      {/* Insights */}
      <div className="dashboard-card budget-callout">
        <div className="insight-spark"><Lightbulb size={18} /></div>
        <div>
          <b>About this forecast</b>
          <p>{confidenceDesc} Forecasts use your 3-month spending average per category. The uncertainty range reflects how much your spending varies month-to-month.</p>
        </div>
        <ChevronRight size={18} />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="ghost" onClick={() => setAppView('Analytics')} icon={<ChevronRight size={16} />}>View analytics</Button>
        <Button variant="ghost" onClick={() => setAppView('AI Assistant')} icon={<Sparkles size={16} />}>Ask AI about forecast</Button>
      </div>
    </div>
  )
}
