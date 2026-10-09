import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const RECEIPT_PROMPT = `You are an expert receipt scanner. Analyze this receipt image and extract the following information:

1. Merchant name (the store or business name)
2. Date (in YYYY-MM-DD format)
3. Total amount (the final total, as a number string like "86.40")
4. Suggested expense category (choose from: Groceries, Food & Dining, Transport, Housing, Subscriptions, Entertainment, Shopping, Health, Other)
5. Line items (list of individual items with their prices, if visible)
6. Confidence level (high/medium/low based on image clarity and text legibility)

If the image is blurry, unclear, or not a receipt, set confidence to "low" and provide your best guess with empty fields.

Respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "merchant": "store name",
  "date": "2025-01-15",
  "total": "86.40",
  "category": "Groceries",
  "items": [{"name": "item name", "price": "12.99"}],
  "confidence": "high",
  "notes": "brief note about image quality or extraction confidence"
}`

interface ReceiptResult {
  merchant: string
  date: string
  total: string
  category: string
  items: { name: string; price: string }[]
  confidence: 'high' | 'medium' | 'low'
  notes: string
}

function parseReceiptResponse(content: string): ReceiptResult {
  // Try to extract JSON from the response
  let jsonStr = content.trim()

  // Remove markdown code blocks if present
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  }

  // Try to find JSON object
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    jsonStr = jsonMatch[0]
  }

  try {
    const parsed = JSON.parse(jsonStr)
    return {
      merchant: parsed.merchant || 'Unknown merchant',
      date: parsed.date || new Date().toISOString().split('T')[0],
      total: parsed.total || '0.00',
      category: parsed.category || 'Other',
      items: Array.isArray(parsed.items) ? parsed.items : [],
      confidence: parsed.confidence || 'medium',
      notes: parsed.notes || '',
    }
  } catch {
    // Fallback if JSON parsing fails
    return {
      merchant: 'Unknown merchant',
      date: new Date().toISOString().split('T')[0],
      total: '0.00',
      category: 'Other',
      items: [],
      confidence: 'low',
      notes: 'Could not parse receipt data. Please enter details manually.',
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, mimeType } = body as { image: string; mimeType: string }

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${image}`

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: RECEIPT_PROMPT },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No response from vision model' }, { status: 500 })
    }

    const result = parseReceiptResponse(content)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Receipt API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process receipt'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
