'use client'

import { useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Target,
  ScanLine,
  BrainCircuit,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button, Logo } from './shared'

function GoogleIcon() {
  return (
    <svg className="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>
    </svg>
  )
}

function AuthVisual({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="auth-visual">
      <div className="visual-aura aura-one" style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', filter: 'blur(80px)', background: 'radial-gradient(circle, rgba(99,230,167,0.3), transparent 70%)', top: 0, left: 0 }} />
      <div className="auth-visual-inner">
        <Logo />
        <div style={{ height: 32 }} />
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <div className="auth-perks">
          <div>
            <ShieldCheck size={20} /> End-to-end private. Your financial data never leaves your workspace.
          </div>
          <div>
            <BrainCircuit size={20} /> AI that understands your spending patterns and suggests real strategies.
          </div>
          <div>
            <ScanLine size={20} /> Snap receipts, auto-categorize, and approve before saving.
          </div>
          <div>
            <TrendingUp size={20} /> Honest forecasts with confidence levels, not false certainty.
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoginView() {
  const setView = useStore((s) => s.setView)
  const login = useStore((s) => s.login)
  const setToast = useStore((s) => s.setToast)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setToast('Please enter your email and password')
      return
    }
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    login(email, name)
    setToast('Welcome back!')
  }

  const handleGoogle = () => {
    login('jordan.lee@gmail.com', 'Jordan Lee')
    setToast('Signed in with Google')
  }

  return (
    <div className="auth-shell">
      <AuthVisual title={<>Welcome <em>back</em>.</>} subtitle="Sign in to pick up where you left off. Your money story continues here." />
      <div className="auth-form-side">
        <div className="auth-card">
          <button className="auth-back" onClick={() => setView('landing')}>
            <ArrowLeft size={15} /> Back to home
          </button>
          <h1>Sign in</h1>
          <p className="auth-sub">Enter your credentials to access your dashboard</p>
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Email</label>
              <div className="search-field" style={{ height: 48 }}>
                <Mail size={16} />
                <input
                  type="email"
                  className="field-input"
                  style={{ background: 'transparent', border: 0, height: '100%', padding: 0 }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="search-field" style={{ height: 48 }}>
                <Lock size={16} />
                <input
                  type="password"
                  className="field-input"
                  style={{ background: 'transparent', border: 0, height: '100%', padding: 0 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button type="button" className="text-link" onClick={() => setToast('Password recovery link sent to your email')}>
                Forgot password?
              </button>
            </div>
            <Button type="submit" className="header-cta" style={{ width: '100%' }} icon={<ArrowRight size={16} />}>
              Sign in
            </Button>
          </form>
          <div className="auth-divider"><span>or continue with</span></div>
          <button className="oauth-btn" onClick={handleGoogle}>
            <GoogleIcon /> Continue with Google
          </button>
          <div className="auth-footer">
            Don&apos;t have an account? <button onClick={() => setView('signup')}>Sign up free</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SignupView() {
  const setView = useStore((s) => s.setView)
  const login = useStore((s) => s.login)
  const setToast = useStore((s) => s.setToast)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setToast('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      setToast('Password must be at least 6 characters')
      return
    }
    login(email, name)
    setToast('Account created! Let&apos;s set up your workspace.')
  }

  const handleGoogle = () => {
    login('jordan.lee@gmail.com', 'Jordan Lee')
    setToast('Signed up with Google')
  }

  return (
    <div className="auth-shell">
      <AuthVisual title={<>Start your <em>money story</em>.</>} subtitle="Create a free account and get a calmer, smarter view of your finances in minutes." />
      <div className="auth-form-side">
        <div className="auth-card">
          <button className="auth-back" onClick={() => setView('landing')}>
            <ArrowLeft size={15} /> Back to home
          </button>
          <h1>Create account</h1>
          <p className="auth-sub">Free forever. No credit card required.</p>
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Full name</label>
              <input
                className="field-input"
                placeholder="Jordan Lee"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Email</label>
              <div className="search-field" style={{ height: 48 }}>
                <Mail size={16} />
                <input
                  type="email"
                  className="field-input"
                  style={{ background: 'transparent', border: 0, height: '100%', padding: 0 }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="search-field" style={{ height: 48 }}>
                <Lock size={16} />
                <input
                  type="password"
                  className="field-input"
                  style={{ background: 'transparent', border: 0, height: '100%', padding: 0 }}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" style={{ width: '100%', marginTop: 8 }} icon={<ArrowRight size={16} />}>
              Create free account
            </Button>
          </form>
          <div className="auth-divider"><span>or sign up with</span></div>
          <button className="oauth-btn" onClick={handleGoogle}>
            <GoogleIcon /> Continue with Google
          </button>
          <div className="auth-footer">
            Already have an account? <button onClick={() => setView('login')}>Sign in</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OnboardingView() {
  const completeOnboarding = useStore((s) => s.completeOnboarding)
  const setToast = useStore((s) => s.setToast)
  const profile = useStore((s) => s.profile)
  const [step, setStep] = useState(0)
  const [currency, setCurrency] = useState('USD')
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [savingsGoal, setSavingsGoal] = useState('')

  const steps = ['Currency', 'Income', 'Budget', 'Ready']

  const handleNext = () => {
    if (step === 0 && !currency) {
      setToast('Please select a currency')
      return
    }
    if (step === 1 && !monthlyIncome) {
      setToast('Please enter your monthly income')
      return
    }
    if (step < 2) {
      setStep(step + 1)
    } else {
      completeOnboarding({
        currency,
        onboarded: true,
      })
      setToast('Welcome to BudgetBuddy AI!')
    }
  }

  const handleSkip = () => {
    completeOnboarding({ currency, onboarded: true })
    setToast('You can complete setup later in Settings')
  }

  return (
    <div className="onboarding-shell">
      <div className="onboarding-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Logo />
        </div>
        <div className="onboarding-steps">
          {steps.map((s, i) => (
            <div key={s} className={`onboarding-step ${i <= step ? 'active' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="dashboard-card" style={{ textAlign: 'center' }}>
            <div className="insight-spark" style={{ margin: '0 auto 16px' }}><Sparkles size={20} /></div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px' }}>Welcome, {profile?.name?.split(' ')[0] || 'there'}!</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: '0 0 24px' }}>
              Let&apos;s personalize your experience. What currency do you use?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { code: 'USD', label: '$ US Dollar' },
                { code: 'EUR', label: '€ Euro' },
                { code: 'GBP', label: '£ British Pound' },
                { code: 'INR', label: '₹ Indian Rupee' },
              ].map((c) => (
                <button
                  key={c.code}
                  className={`filter-button ${currency === c.code ? 'active' : ''}`}
                  style={{
                    height: 48,
                    borderColor: currency === c.code ? 'var(--green)' : 'var(--line)',
                    background: currency === c.code ? 'rgba(99,230,167,0.1)' : 'var(--surface-soft)',
                  }}
                  onClick={() => setCurrency(c.code)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="dashboard-card" style={{ textAlign: 'center' }}>
            <div className="insight-spark" style={{ margin: '0 auto 16px' }}><TrendingUp size={20} /></div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px' }}>What&apos;s your monthly income?</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: '0 0 24px' }}>
              This helps us calculate your savings rate and budget recommendations.
            </p>
            <div className="search-field" style={{ height: 56, maxWidth: 280, margin: '0 auto' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--green)' }}>
                {currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$'}
              </span>
              <input
                type="number"
                style={{ background: 'transparent', border: 0, height: '100%', padding: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}
                placeholder="4,800"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
              />
            </div>
            <p style={{ color: 'var(--muted-2)', fontSize: '0.8rem', marginTop: 12 }}>You can change this anytime in Settings</p>
          </div>
        )}

        {step === 2 && (
          <div className="dashboard-card" style={{ textAlign: 'center' }}>
            <div className="insight-spark" style={{ margin: '0 auto 16px' }}><Target size={20} /></div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px' }}>Set a monthly budget</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: '0 0 24px' }}>
              A target for your total monthly spending. You can adjust per-category later.
            </p>
            <div className="search-field" style={{ height: 56, maxWidth: 280, margin: '0 auto 16px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--green)' }}>
                {currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$'}
              </span>
              <input
                type="number"
                style={{ background: 'transparent', border: 0, height: '100%', padding: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}
                placeholder="3,500"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
              />
            </div>
            <p style={{ color: 'var(--muted-2)', fontSize: '0.8rem' }}>We&apos;ll also load demo data so you can explore the full experience.</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={16} /> Back
            </Button>
          )}
          <Button onClick={handleNext} style={{ flex: 1 }} icon={step < 2 ? <ArrowRight size={16} /> : <Check size={16} />}>
            {step < 2 ? 'Continue' : 'Enter BudgetBuddy'}
          </Button>
        </div>
        <button className="text-link" style={{ width: '100%', textAlign: 'center', marginTop: 12, justifyContent: 'center' }} onClick={handleSkip}>
          Skip for now
        </button>
      </div>
    </div>
  )
}
