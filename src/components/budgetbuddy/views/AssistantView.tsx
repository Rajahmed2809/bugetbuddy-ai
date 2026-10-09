'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Sparkles,
  LockKeyhole,
  Loader2,
  Bot,
  TrendingUp,
  Target,
  Lightbulb,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { calculateIncome, calculateExpenses, filterByMonth, getCategoryBreakdown, calculateBalance, getGoalProgress } from '@/lib/analytics'
import { formatCurrency } from '@/lib/format'

const SUGGESTED_PROMPTS = [
  'Where did I spend the most this month?',
  'How can I save $300 this month?',
  'What are my biggest recurring expenses?',
  'Am I on track for my savings goals?',
]

export function AssistantView() {
  const transactions = useStore((s) => s.transactions)
  const goals = useStore((s) => s.goals)
  const chatHistory = useStore((s) => s.chatHistory)
  const addChatMessage = useStore((s) => s.addChatMessage)
  const clearChat = useStore((s) => s.clearChat)
  const profile = useStore((s) => s.profile)
  const setToast = useStore((s) => s.setToast)

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [chatHistory, loading])

  const buildContext = () => {
    const now = new Date()
    const monthTx = filterByMonth(transactions, now.getFullYear(), now.getMonth())
    const lastMonthTx = filterByMonth(transactions, now.getFullYear(), now.getMonth() - 1)
    const income = calculateIncome(monthTx)
    const expenses = calculateExpenses(monthTx)
    const balance = calculateBalance(transactions)
    const categories = getCategoryBreakdown(monthTx).slice(0, 5)
    const lastExpenses = calculateExpenses(lastMonthTx)

    return {
      balance,
      thisMonthIncome: income,
      thisMonthExpenses: expenses,
      lastMonthExpenses: lastExpenses,
      topCategories: categories.map((c) => ({ category: c.category, amount: c.amount })),
      goals: goals.map((g) => ({ name: g.name, target: g.targetAmount, current: g.currentAmount, progress: getGoalProgress(g) })),
      totalTransactions: transactions.length,
      currency: profile?.currency || 'USD',
    }
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || loading) return
    setInput('')
    setLoading(true)

    addChatMessage({ role: 'user', content: message })

    try {
      const context = buildContext()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context,
          history: chatHistory.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      addChatMessage({ role: 'assistant', content: data.reply })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong'
      addChatMessage({
        role: 'assistant',
        content: `I apologize, but I encountered an issue: ${errorMsg}. Please try again in a moment.`,
      })
      setToast('AI assistant encountered an error')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const hasData = transactions.length > 0

  return (
    <div className="tab-view" style={{ maxHeight: 'calc(100vh - 180px)' }}>
      <div className="tab-view-heading">
        <div>
          <span className="muted-label">YOUR MONEY COMPANION</span>
          <h4>Ask anything about your money.</h4>
          <p>Answers grounded in your own transaction history and financial context.</p>
        </div>
        <span className="online-pill"><i />Ready</span>
      </div>

      <div className="assistant-shell dashboard-card" style={{ flex: 1, minHeight: 480 }}>
        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 4, maxHeight: 'calc(100vh - 380px)' }}>
          {chatHistory.length === 0 && (
            <div className="assistant-message assistant-message-ai">
              <span className="assistant-avatar"><Sparkles size={16} /></span>
              <div>
                <b>BudgetBuddy AI</b>
                <p>
                  Hi {profile?.name?.split(' ')[0] || 'there'}! I&apos;ve analyzed your financial data.
                  {hasData
                    ? ` You have ${transactions.length} transactions on record. Ask me anything about your spending, budget, or savings goals.`
                    : ' Add some transactions first, and I can help you understand your spending patterns and suggest savings strategies.'}
                </p>
              </div>
            </div>
          )}

          {chatHistory.map((msg) => (
            <div key={msg.id} className={`assistant-message assistant-message-${msg.role}`}>
              <span className="assistant-avatar">
                {msg.role === 'ai' || msg.role === 'assistant' ? <Sparkles size={16} /> : <Bot size={16} />}
              </span>
              <div>
                {msg.role === 'assistant' && <b>BudgetBuddy AI</b>}
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="assistant-message assistant-message-ai">
              <span className="assistant-avatar"><Sparkles size={16} /></span>
              <div>
                <b>BudgetBuddy AI</b>
                <p style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Loader2 size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
                  Analyzing your financial data...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Suggested prompts */}
        {chatHistory.length === 0 && (
          <div className="prompt-chips">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button key={prompt} onClick={() => sendMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="assistant-composer">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your spending, goals, or habits..."
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            aria-label="Send question"
            style={{ opacity: loading || !input.trim() ? 0.5 : 1 }}
          >
            <Send size={17} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span className="assistant-disclaimer">
            <LockKeyhole size={12} />Your data is private. AI suggestions never change your transactions.
          </span>
          {chatHistory.length > 0 && (
            <button className="text-link" onClick={clearChat} style={{ fontSize: 12 }}>
              Clear conversation
            </button>
          )}
        </div>
      </div>

      {/* Quick stats for context */}
      {hasData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
          <div className="dashboard-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="insight-spark"><TrendingUp size={16} /></div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>This month</span>
              <b style={{ display: 'block', fontSize: 14 }}>{formatCurrency(calculateExpenses(filterByMonth(transactions, new Date().getFullYear(), new Date().getMonth())), profile?.currency)}</b>
            </div>
          </div>
          <div className="dashboard-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="insight-spark"><Target size={16} /></div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Active goals</span>
              <b style={{ display: 'block', fontSize: 14 }}>{goals.length}</b>
            </div>
          </div>
          <div className="dashboard-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="insight-spark"><Lightbulb size={16} /></div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Total balance</span>
              <b style={{ display: 'block', fontSize: 14 }}>{formatCurrency(calculateBalance(transactions), profile?.currency)}</b>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
