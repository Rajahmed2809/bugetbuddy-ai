'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as Icons from 'lucide-react'
import { Sparkles, Check, X } from 'lucide-react'

// Icon resolver: takes a string name and returns the Lucide icon component
export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name]
  if (!LucideIcon) return <Icons.CircleDollarSign size={size} className={className} />
  return <LucideIcon size={size} className={className} />
}

// Logo
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-mark" aria-label="BudgetBuddy AI">
      <div className="brand-symbol">
        <span />
        <span />
        <span />
      </div>
      {!compact && (
        <span className="brand-name">
          budget<span>buddy</span>
          <i>AI</i>
        </span>
      )}
    </div>
  )
}

// Primary button
export function Button({
  children,
  variant = 'primary',
  onClick,
  className = '',
  icon,
  type = 'button',
}: {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'quiet'
  onClick?: () => void
  className?: string
  icon?: ReactNode
  type?: 'button' | 'submit'
}) {
  return (
    <button type={type} className={`bb-btn bb-btn-${variant} ${className}`} onClick={onClick}>
      {children}
      {icon}
    </button>
  )
}

// Mini bar chart (CSS-based)
export function MiniChart({ compact = false }: { compact?: boolean }) {
  const bars = [32, 42, 38, 56, 48, 69, 58, 82, 64, 78, 72, 91]
  const labels = ['May 25', 'Jun 01', 'Jun 08', 'Jun 15', 'Jun 22']
  return (
    <div className={`mini-chart ${compact ? 'mini-chart-compact' : ''}`}>
      <div className="chart-grid">
        <span />
        <span />
        <span />
      </div>
      <div className="chart-bars">
        {bars.map((height, index) => (
          <div
            key={index}
            className={`chart-bar ${index > 8 ? 'is-current' : ''}`}
            style={{ height: `${height}%` }}
          >
            <i />
          </div>
        ))}
      </div>
      {!compact && (
        <div className="chart-labels">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// Progress ring
export function ProgressRing({ percent, label, size = 130 }: { percent: number; label?: string; size?: number }) {
  return (
    <div
      className="ring-progress"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--green) 0% ${percent}%, var(--surface-soft) ${percent}% 100%)`,
      }}
    >
      <strong>
        {percent}
        <span>%</span>
      </strong>
      {label && <small>{label}</small>}
    </div>
  )
}

// Reveal on scroll
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), delay)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`reveal ${visible ? 'in-view' : ''} ${className}`}>
      {children}
    </div>
  )
}

// Toast container
export function ToastContainer({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className="bb-toast" role="status">
      <span className="toast-check">
        <Check size={15} />
      </span>
      <span>{message}</span>
      <button onClick={onClose} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  )
}

// Hero 3D visual
export function HeroVisual() {
  return (
    <div className="hero-visual" aria-label="BudgetBuddy dashboard preview">
      <div className="visual-aura aura-one" />
      <div className="visual-aura aura-two" />
      <div className="coin coin-one">$</div>
      <div className="coin coin-two">€</div>
      <div className="coin coin-three">↗</div>
      <div className="orb">
        <div className="orb-core">
          <Sparkles size={17} />
        </div>
        <span>AI</span>
      </div>
      <div className="floating-note note-one">
        <span className="note-icon note-green">↗</span>
        <span>
          <b>+ $4,800</b>
          <small>Salary received</small>
        </span>
      </div>
      <div className="floating-note note-two">
        <span className="note-icon note-orange">−</span>
        <span>
          <b>− $86.40</b>
          <small>Whole Foods</small>
        </span>
      </div>
      <div className="hero-card balance-float">
        <div className="card-topline">
          <span>Total balance</span>
          <Icons.MoreHorizontal size={17} />
        </div>
        <strong>
          $12,840<span>.56</span>
        </strong>
        <div className="balance-meta">
          <span className="positive-pill">↗ 12.8%</span>
          <small>vs last month</small>
        </div>
        <div className="balance-sparkline">
          <svg viewBox="0 0 220 58" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#4de0a7" stopOpacity="0.35" />
                <stop offset="1" stopColor="#4de0a7" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 47 C21 38, 24 42, 39 32 S68 49, 85 31 S111 36, 125 23 S145 41, 160 20 S188 28, 220 4 L220 58 L0 58Z"
              fill="url(#sparkFill)"
            />
            <path
              d="M0 47 C21 38, 24 42, 39 32 S68 49, 85 31 S111 36, 125 23 S145 41, 160 20 S188 28, 220 4"
              fill="none"
              stroke="#4de0a7"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      <div className="hero-card spending-float">
        <div className="card-topline">
          <span>Spending pulse</span>
          <span className="live-dot">Live</span>
        </div>
        <div className="pulse-number">
          <b>$2,840</b>
          <span>this month</span>
        </div>
        <MiniChart compact />
      </div>
      <div className="depth-grid" />
    </div>
  )
}
