import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface FinancialContext {
  balance: number
  thisMonthIncome: number
  thisMonthExpenses: number
  lastMonthExpenses: number
  topCategories: { category: string; amount: number }[]
  goals: { name: string; target: number; current: number; progress: number }[]
  totalTransactions: number
  currency: string
}

const SYSTEM_PROMPT = `You are BudgetBuddy AI, a friendly and knowledgeable personal finance assistant. You help users understand their spending, manage budgets, and achieve savings goals.

Key principles:
- Be concise, warm, and practical. Keep responses under 4 sentences unless detailed analysis is requested.
- Always reference the user's ACTUAL financial data when answering questions. Use specific numbers.
- Never invent transactions or financial values. If data is insufficient, say so honestly.
- Suggest realistic, actionable savings strategies based on their actual spending patterns.
- When discussing budgets or goals, reference their real progress.
- Format currency with the user's currency symbol.
- If asked about something you can't determine from the data, acknowledge it clearly.

You are grounded in the user's real financial context provided below. Use it to give personalized, accurate answers.`

function buildContextString(ctx: FinancialContext): string {
  const currencySymbol = ctx.currency === 'EUR' ? '€' : ctx.currency === 'GBP' ? '£' : ctx.currency === 'INR' ? '₹' : '$'
  const fmt = (n: number) => `${currencySymbol}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  let str = `\nUser's Financial Context:\n`
  str += `- Total balance: ${fmt(ctx.balance)}\n`
  str += `- This month income: ${fmt(ctx.thisMonthIncome)}\n`
  str += `- This month expenses: ${fmt(ctx.thisMonthExpenses)}\n`
  str += `- Last month expenses: ${fmt(ctx.lastMonthExpenses)}\n`
  if (ctx.thisMonthExpenses > 0 && ctx.lastMonthExpenses > 0) {
    const change = Math.round(((ctx.thisMonthExpenses - ctx.lastMonthExpenses) / ctx.lastMonthExpenses) * 100)
    str += `- Spending change vs last month: ${change > 0 ? '+' : ''}${change}%\n`
  }
  str += `- Total transactions on record: ${ctx.totalTransactions}\n`

  if (ctx.topCategories.length > 0) {
    str += `\nTop spending categories this month:\n`
    ctx.topCategories.forEach((c, i) => {
      str += `${i + 1}. ${c.category}: ${fmt(c.amount)}\n`
    })
  }

  if (ctx.goals.length > 0) {
    str += `\nSavings goals:\n`
    ctx.goals.forEach((g) => {
      str += `- ${g.name}: ${fmt(g.current)} of ${fmt(g.target)} (${g.progress}% done)\n`
    })
  }

  str += `\nAnswer the user's question using this real data. Be specific and helpful.`
  return str
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context, history } = body as {
      message: string
      context: FinancialContext
      history: ChatMessage[]
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const contextStr = context ? buildContextString(context) : ''
    const systemMessage = `${SYSTEM_PROMPT}${contextStr}`

    const messages: { role: string; content: string }[] = [
      { role: 'assistant', content: systemMessage },
    ]

    // Add conversation history (limited to last 8 messages)
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-8)) {
        messages.push({ role: msg.role, content: msg.content })
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    const completion = await zai.chat.completions.create({
      messages: messages as Parameters<typeof zai.chat.completions.create>[0]['messages'],
      thinking: { type: 'disabled' },
    })

    const reply = completion.choices[0]?.message?.content

    if (!reply) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process request'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
