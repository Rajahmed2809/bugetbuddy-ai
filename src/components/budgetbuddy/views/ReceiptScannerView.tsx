'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  ScanLine,
  Upload,
  Camera,
  X,
  Check,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Loader2,
  FileText,
  SwitchCamera,
  Images,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import type { Transaction } from '@/lib/types'
import { DEFAULT_CATEGORIES, CATEGORY_COLORS } from '@/lib/types'
import { Button } from '../shared'

type ScanStage = 'upload' | 'scanning' | 'review' | 'saved'
type ExtractedData = {
  merchant: string
  date: string
  total: string
  category: string
  items: { name: string; price: string }[]
  confidence: 'high' | 'medium' | 'low'
  notes: string
}

export function ReceiptScannerView() {
  const addTransaction = useStore((s) => s.addTransaction)
  const setToast = useStore((s) => s.setToast)
  const setAppView = useStore((s) => s.setAppView)
  const profile = useStore((s) => s.profile)
  const transactions = useStore((s) => s.transactions)

  const [stage, setStage] = useState<ScanStage>('upload')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [error, setError] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, etc.)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Please use an image under 10MB.')
      return
    }
    setError('')
    setStage('scanning')

    // Convert to base64 for preview
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setImagePreview(dataUrl)

      // Send to OCR API
      try {
        const base64 = dataUrl.split(',')[1]
        const response = await fetch('/api/receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType: file.type }),
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to process receipt')
        }

        setExtracted(data)
        setStage('review')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not analyze receipt. Please try again or enter details manually.')
        setStage('upload')
        setImagePreview(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleReset = () => {
    setStage('upload')
    setImagePreview(null)
    setExtracted(null)
    setError('')
  }

  const handleCapturedBlob = useCallback(
    (blob: Blob) => {
      setShowCamera(false)
      const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' })
      handleFile(file)
    },
    []
  )

  const handleSave = () => {
    if (!extracted) return
    const amount = parseFloat(extracted.total.replace(/[^0-9.]/g, '')) || 0
    const txName = extracted.merchant || 'Receipt'

    // Check for duplicates (same merchant + amount in last 24h)
    const oneDayAgo = Date.now() - 86400000
    const duplicate = transactions.find((t) => {
      const txDate = new Date(t.date).getTime()
      return t.name.toLowerCase() === txName.toLowerCase() && t.amount === amount && txDate > oneDayAgo
    })

    if (duplicate) {
      setToast('Duplicate detected — this transaction was already saved')
      return
    }

    const tx: Omit<Transaction, 'id' | 'createdAt'> = {
      type: 'expense',
      name: txName,
      amount,
      date: extracted.date ? new Date(extracted.date).toISOString() : new Date().toISOString(),
      category: extracted.category,
      paymentMethod: 'Card',
      note: extracted.items.length > 0 ? `${extracted.items.length} items` : undefined,
      receiptUrl: imagePreview || undefined,
    }
    addTransaction(tx)
    setToast('Receipt saved as transaction')
    setStage('saved')
  }

  return (
    <div className="tab-view">
      <div className="tab-view-heading">
        <div>
          <span className="muted-label">AI RECEIPT SCANNER</span>
          <h4>Scan a receipt</h4>
          <p>Upload or capture a receipt. AI extracts the details, you confirm before saving.</p>
        </div>
        <span className="online-pill"><i />AI ready</span>
      </div>

      {error && (
        <div className="dashboard-card" style={{ borderColor: 'var(--orange)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertCircle size={20} style={{ color: 'var(--orange)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 14 }}>{error}</b>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>You can still add the transaction manually.</p>
          </div>
          <Button variant="ghost" onClick={() => setAppView('Transactions')}>Add manually</Button>
        </div>
      )}

      {/* Upload stage */}
      {stage === 'upload' && (
        <div className="dashboard-card" style={{ padding: '48px 24px' }}>
          <div
            style={{
              border: '2px dashed var(--line-strong)',
              borderRadius: 20,
              padding: '48px 32px',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--green)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line-strong)' }}
          >
            <div className="insight-spark" style={{ margin: '0 auto 16px', width: 56, height: 56 }}>
              <ScanLine size={24} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem' }}>Upload a receipt</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 24px' }}>
              Drag and drop or click to browse. PNG, JPG up to 10MB.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }} icon={<Upload size={16} />}>
                Choose file
              </Button>
              <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setShowCamera(true) }} icon={<Camera size={16} />}>
                Use camera
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="insight-spark" style={{ margin: '0 auto 8px' }}><Sparkles size={16} /></div>
              <b style={{ fontSize: 13 }}>AI extraction</b>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: '4px 0 0' }}>Merchant, date, total, and line items</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="insight-spark" style={{ margin: '0 auto 8px' }}><Check size={16} /></div>
              <b style={{ fontSize: 13 }}>You confirm</b>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: '4px 0 0' }}>Review and edit before saving</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="insight-spark" style={{ margin: '0 auto 8px' }}><AlertCircle size={16} /></div>
              <b style={{ fontSize: 13 }}>Duplicate guard</b>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: '4px 0 0' }}>Prevents accidental double entries</p>
            </div>
          </div>
        </div>
      )}

      {/* Scanning stage */}
      {stage === 'scanning' && (
        <div className="dashboard-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          {imagePreview && (
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
              <img
                src={imagePreview}
                alt="Receipt being scanned"
                style={{
                  maxWidth: 240,
                  maxHeight: 300,
                  borderRadius: 12,
                  border: '1px solid var(--line-strong)',
                  filter: 'blur(1px) brightness(0.8)',
                  opacity: 0.7,
                }}
              />
            </div>
          )}
          <Loader2 size={32} style={{ color: 'var(--green)', animation: 'spin 1.5s linear infinite', margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem' }}>Analyzing receipt...</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>
            AI is extracting merchant, date, total, and line items
          </p>
        </div>
      )}

      {/* Review stage */}
      {stage === 'review' && extracted && (
        <ReviewPanel
          extracted={extracted}
          setExtracted={setExtracted}
          imagePreview={imagePreview}
          onSave={handleSave}
          onReset={handleReset}
          currency={profile?.currency}
        />
      )}

      {/* Saved stage */}
      {stage === 'saved' && (
        <div className="dashboard-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div className="insight-spark" style={{ margin: '0 auto 16px', width: 56, height: 56, background: 'rgba(99,230,167,0.2)' }}>
            <Check size={28} />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem' }}>Receipt saved!</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 24px' }}>
            Your transaction has been added to your records.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button variant="ghost" onClick={handleReset} icon={<RotateCcw size={16} />}>Scan another</Button>
            <Button onClick={() => setAppView('Transactions')} icon={<FileText size={16} />}>View transactions</Button>
          </div>
        </div>
      )}

      {/* Camera modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCapturedBlob}
          onClose={() => setShowCamera(false)}
          onError={(msg) => {
            setShowCamera(false)
            setError(msg)
          }}
        />
      )}
    </div>
  )
}

// ===== Live Camera Capture Component =====
// Uses getUserMedia() for real in-browser camera access — works on both desktop (webcam)
// and mobile (front/back camera). More reliable than the HTML capture attribute.
function CameraCapture({
  onCapture,
  onClose,
  onError,
}: {
  onCapture: (blob: Blob) => void
  onClose: () => void
  onError: (message: string) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [error, setError] = useState('')

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopStream()
    setError('')
    setReady(false)

    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = 'Camera is not supported in this browser. Please upload a receipt image instead.'
      setError(msg)
      onError(msg)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => setReady(true)).catch(() => setReady(true))
        }
      }
    } catch (err) {
      const e = err as DOMError
      let msg = 'Could not access the camera.'
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        msg = 'Camera access was denied. Please allow camera permissions in your browser settings and try again.'
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        msg = 'No camera device found. Please upload a receipt image instead.'
      } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
        msg = 'Camera is already in use by another application. Please close it and try again.'
      } else if (e.name === 'NotSupportedError') {
        msg = 'Camera is not supported in this browser. Please upload a receipt image instead.'
      }
      setError(msg)
    }
  }, [stopStream, onError])

  // Start/stop the camera stream when facingMode changes — this is external-system
  // synchronization (MediaStream API), so calling startCamera here is correct.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startCamera(facingMode)
    return () => stopStream()
  }, [facingMode, startCamera, stopStream])

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (blob) {
        stopStream()
        onCapture(blob)
      }
    }, 'image/jpeg', 0.92)
  }

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      {/* Top bar */}
      <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <span style={{ color: '#fff', fontSize: 16, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Camera size={20} /> Camera
        </span>
        <button onClick={onClose} aria-label="Close camera" style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={20} />
        </button>
      </div>

      {error ? (
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <AlertCircle size={40} style={{ color: 'var(--orange)', margin: '0 auto 16px' }} />
          <h3 style={{ color: '#fff', margin: '0 0 8px', fontSize: '1.2rem' }}>Camera unavailable</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: '0 0 24px', lineHeight: 1.5 }}>{error}</p>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      ) : (
        <>
          {/* Video preview */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 500, aspectRatio: '3/4', borderRadius: 16, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
            {/* Overlay frame guide */}
            <div style={{ position: 'absolute', inset: '15% 8%', border: '2px dashed rgba(99,230,167,0.5)', borderRadius: 12, pointerEvents: 'none' }} />
            {!ready && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                <Loader2 size={28} style={{ color: 'var(--green)', animation: 'spin 1.5s linear infinite' }} />
              </div>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 24 }}>
            <button
              onClick={handleSwitchCamera}
              aria-label="Switch camera"
              disabled={!ready}
              style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                opacity: ready ? 1 : 0.4, cursor: ready ? 'pointer' : 'not-allowed',
              }}
            >
              <SwitchCamera size={22} />
            </button>
            <button
              onClick={handleCapture}
              disabled={!ready}
              aria-label="Capture photo"
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'var(--green)', color: 'var(--bg)',
                border: '4px solid rgba(255,255,255,0.3)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                opacity: ready ? 1 : 0.4, cursor: ready ? 'pointer' : 'not-allowed',
                transition: 'transform 0.15s ease',
              }}
            >
              <Camera size={28} />
            </button>
            <div style={{ width: 48 }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', margin: '16px 0 0', textAlign: 'center' }}>
            Position the receipt inside the frame and tap the capture button
          </p>
        </>
      )}
    </div>
  )
}

interface DOMError {
  name: string
}

function ReviewPanel({
  extracted,
  setExtracted,
  imagePreview,
  onSave,
  onReset,
  currency,
}: {
  extracted: ExtractedData
  setExtracted: (data: ExtractedData) => void
  imagePreview: string | null
  onSave: () => void
  onReset: () => void
  currency?: string
}) {
  const update = (updates: Partial<ExtractedData>) => setExtracted({ ...extracted, ...updates })

  const confidenceColor = extracted.confidence === 'high' ? 'var(--green)' : extracted.confidence === 'medium' ? 'var(--amber)' : 'var(--orange)'
  const confidenceLabel = extracted.confidence === 'high' ? 'High confidence' : extracted.confidence === 'medium' ? 'Medium confidence — please verify' : 'Low confidence — please verify carefully'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* Image preview */}
      <div className="dashboard-card" style={{ padding: 16 }}>
        <div className="card-heading">
          <div>
            <span className="muted-label">RECEIPT IMAGE</span>
            <h5>Original scan</h5>
          </div>
        </div>
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Receipt"
            style={{ width: '100%', borderRadius: 12, border: '1px solid var(--line)' }}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--surface-soft)' }}>
          <AlertCircle size={16} style={{ color: confidenceColor }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{confidenceLabel}</span>
        </div>
      </div>

      {/* Editable extracted data */}
      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <span className="muted-label">EXTRACTED DETAILS</span>
            <h5>Review and edit</h5>
          </div>
          <div className="insight-spark"><Sparkles size={16} /></div>
        </div>

        <div className="field-group">
          <label className="field-label">Merchant</label>
          <input
            className="field-input"
            value={extracted.merchant}
            onChange={(e) => update({ merchant: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field-group">
            <label className="field-label">Date</label>
            <input
              type="date"
              className="field-input"
              value={extracted.date}
              onChange={(e) => update({ date: e.target.value })}
            />
          </div>
          <div className="field-group">
            <label className="field-label">Total amount</label>
            <div className="search-field" style={{ height: 48 }}>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>$</span>
              <input
                style={{ background: 'transparent', border: 0, height: '100%', padding: 0, fontSize: 14, color: 'var(--text)' }}
                value={extracted.total}
                onChange={(e) => update({ total: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Category (AI suggested)</label>
          <select
            className="field-input"
            style={{ cursor: 'pointer' }}
            value={extracted.category}
            onChange={(e) => update({ category: e.target.value })}
          >
            {DEFAULT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {extracted.items.length > 0 && (
          <div className="field-group">
            <label className="field-label">Line items ({extracted.items.length})</label>
            <div style={{ maxHeight: 140, overflowY: 'auto', borderRadius: 10, border: '1px solid var(--line)', padding: 8 }}>
              {extracted.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', fontSize: 13, borderBottom: i < extracted.items.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <span style={{ color: 'var(--text)' }}>{item.name}</span>
                  <span style={{ color: 'var(--muted)' }}>{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <Button variant="ghost" onClick={onReset} icon={<RotateCcw size={16} />}>Rescan</Button>
          <Button onClick={onSave} style={{ flex: 1 }} icon={<Check size={16} />}>Confirm & save</Button>
        </div>
      </div>
    </div>
  )
}
