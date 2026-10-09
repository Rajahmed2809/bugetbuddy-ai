'use client'

import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  BrainCircuit,
  Database,
  FileText,
  Globe2,
  Lightbulb,
  LockKeyhole,
  Menu,
  Moon,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  X,
  Check,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight as ArrowOut,
  WalletCards,
  MoreHorizontal,
  CircleDollarSign,
  Zap,
  Bot,
  Send,
  CalendarClock,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button, Logo, MiniChart, HeroVisual, Reveal } from './shared'

export function LandingPage() {
  const setView = useStore((s) => s.setView)
  const setToast = useStore((s) => s.setToast)
  const preferences = useStore((s) => s.preferences)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <div className="site-shell">
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="bb-container header-inner">
          <a className="logo-link" href="#top" onClick={(e) => { e.preventDefault(); scrollTo('top') }}>
            <Logo />
          </a>
          <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features') }}>Features</a>
            <a href="#architecture" onClick={(e) => { e.preventDefault(); scrollTo('architecture') }}>How it works</a>
            <a href="#security" onClick={(e) => { e.preventDefault(); scrollTo('security') }}>Security</a>
            <a href="#dashboard" onClick={(e) => { e.preventDefault(); scrollTo('dashboard') }}>Dashboard</a>
          </nav>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {preferences.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button className="login-link" onClick={() => setView('login')}>Sign in</button>
            <Button className="header-cta" onClick={() => setView('signup')} icon={<ArrowUpRight size={16} />}>
              Get started <span>free</span>
            </Button>
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-glow glow-left" />
          <div className="hero-glow glow-right" />
          <div className="bb-container hero-grid">
            <div className="hero-copy reveal in-view">
              <div className="announcement" onClick={() => scrollTo('features')}>
                <span>
                  <Sparkles size={13} /> New: a calmer way to think about money
                </span>
                <ChevronRight size={14} />
              </div>
              <h1>
                Your money.<br />
                <em>Smarter</em> than ever.
              </h1>
              <p className="hero-subtitle">
                Track every expense, understand your spending, and achieve your financial goals with the power of AI.
              </p>
              <div className="hero-actions">
                <Button onClick={() => setView('signup')} icon={<ArrowUpRight size={17} />}>
                  Get started free
                </Button>
                <button className="secondary-cta" onClick={() => scrollTo('dashboard')}>
                  <span className="play-icon">
                    <ScanLine size={15} />
                  </span>
                  Explore the experience
                </button>
              </div>
              <div className="hero-proof">
                <div className="avatar-stack">
                  <span>R</span>
                  <span>M</span>
                  <span>A</span>
                  <span>+</span>
                </div>
                <span>Built for people who want <b>clarity</b>, not complexity.</span>
              </div>
            </div>
            <div className="hero-side reveal in-view">
              <HeroVisual />
              <div className="visual-caption">
                <span>
                  <i />Intelligence, at a glance
                </span>
                <span>Scroll to explore ↓</span>
              </div>
            </div>
          </div>
          <div className="bb-container hero-bottom">
            <div className="trusted-line">
              A more intentional money habit, powered by <span>thoughtful technology</span>
            </div>
            <div className="logo-row">
              <span><Database size={15} /> Secure database</span>
              <span><BrainCircuit size={15} /> AI-powered</span>
              <span><ShieldCheck size={15} /> Private by design</span>
              <span><Globe2 size={15} /> Built for everywhere</span>
            </div>
          </div>
        </section>

        {/* Manifesto */}
        <section className="manifesto-section">
          <div className="bb-container manifesto-grid">
            <span className="eyebrow">MONEY, WITHOUT THE NOISE</span>
            <div>
              <h2>Clarity is a <em>feature.</em></h2>
              <p>
                BudgetBuddy turns the messy middle of personal finance into a living picture you can actually use.
                Less bookkeeping. More knowing. Every transaction, trend, and tiny habit in one beautifully clear view,
                with AI insights that understand your unique financial rhythm.
              </p>
              <div className="manifesto-link" onClick={() => scrollTo('dashboard')}>
                See your money differently <ArrowUpRight size={16} />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features-section section-light" id="features">
          <div className="bb-container">
            <Reveal className="section-heading">
              <div>
                <span className="eyebrow">ONE INTELLIGENT PLACE</span>
                <h2>Good with numbers.<br /><em>Better with context.</em></h2>
              </div>
              <p>From the first coffee to the long-term goal, BudgetBuddy connects the dots so you can make decisions with less friction.</p>
            </Reveal>
            <div className="feature-grid">
              <Reveal className="feature-card feature-large">
                <div className="feature-index">01</div>
                <div className="feature-icon green-icon"><ChartNoAxesCombined size={20} /></div>
                <h3>See the whole picture.</h3>
                <p>Every transaction, trend, and tiny habit in one beautifully clear view. No spreadsheets required. Real-time dashboards keep you informed without overwhelming you with noise.</p>
                <div className="feature-visual trend-visual">
                  <div className="trend-head">
                    <span>Monthly pulse</span>
                    <b>+18.4%</b>
                  </div>
                  <MiniChart compact />
                </div>
              </Reveal>
              <Reveal className="feature-card feature-dark" delay={100}>
                <div className="feature-index">02</div>
                <div className="feature-icon blue-icon"><BrainCircuit size={20} /></div>
                <h3>Intelligence that listens.</h3>
                <p>Ask natural questions about your money and get answers grounded in your own transaction history.</p>
                <div className="ai-quote">
                  <Sparkles size={15} />
                  <span>&ldquo;You&apos;re spending 14% less on dining out this month. That&apos;s $120 closer to Japan.&rdquo;</span>
                </div>
              </Reveal>
              <Reveal className="feature-card feature-goal" delay={200}>
                <div className="feature-index">03</div>
                <div className="feature-icon violet-icon"><Target size={20} /></div>
                <h3>Make room for what matters.</h3>
                <p>Turn intentions into visible progress with goals that feel motivating, not moralizing.</p>
                <div className="goal-orbit">
                  <div className="orbit-ring" />
                  <div className="orbit-core">
                    <span>$3,420</span>
                    <small>of $5,000</small>
                  </div>
                  <span className="orbit-star star-one">✦</span>
                  <span className="orbit-star star-two">✧</span>
                </div>
              </Reveal>
              <Reveal className="feature-card" delay={300}>
                <div className="feature-index">04</div>
                <div className="feature-icon orange-icon"><ReceiptText size={20} /></div>
                <h3>Scan, confirm, done.</h3>
                <p>Snap a receipt and let AI extract the details. You review and approve before anything is saved.</p>
              </Reveal>
              <Reveal className="feature-card" delay={400}>
                <div className="feature-index">05</div>
                <div className="feature-icon cyan-icon"><TrendingUp size={20} /></div>
                <h3>Forecast with honesty.</h3>
                <p>See where your spending is heading, with confidence levels that acknowledge uncertainty.</p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <LandingDashboardPreview />

        {/* Architecture */}
        <section className="architecture-section" id="architecture">
          <div className="bb-container architecture-grid">
            <Reveal className="architecture-copy">
              <span className="eyebrow">BUILT TO EARN TRUST</span>
              <h2>Beautiful on the surface.<br /><em>Considered underneath.</em></h2>
              <p>BudgetBuddy is designed as a secure financial companion, not a pretty spreadsheet. Every feature has a clear reason to exist, and the architecture is built to protect your data at every layer.</p>
              <div className="arch-list">
                <div>
                  <span className="arch-num">01</span>
                  <span>
                    <b>Authoritative numbers</b>
                    <small>Backend-calculated totals keep the truth in the data layer, never in the AI.</small>
                  </span>
                </div>
                <div>
                  <span className="arch-num">02</span>
                  <span>
                    <b>Human-in-the-loop AI</b>
                    <small>Suggestions are transparent, editable, and never silently applied to your data.</small>
                  </span>
                </div>
                <div>
                  <span className="arch-num">03</span>
                  <span>
                    <b>Private by default</b>
                    <small>Row-level security keeps every financial record scoped to your account only.</small>
                  </span>
                </div>
              </div>
              <button className="text-link" onClick={() => scrollTo('security')}>
                Read the principles <ArrowUpRight size={14} />
              </button>
            </Reveal>
            <Reveal className="architecture-visual">
              <div className="arch-orbit orbit-back" />
              <div className="arch-orbit orbit-mid" />
              <div className="arch-orbit orbit-front" />
              <div className="arch-core">
                <div className="arch-core-icon">
                  <LockKeyhole size={24} />
                </div>
                <b>Your financial context</b>
                <small>encrypted · scoped · yours</small>
              </div>
              <span className="arch-chip chip-db"><Database size={14} /> PostgreSQL</span>
              <span className="arch-chip chip-ai"><Bot size={14} /> AI insight</span>
              <span className="arch-chip chip-auth"><ShieldCheck size={14} /> RLS protected</span>
            </Reveal>
          </div>
        </section>

        {/* Security */}
        <section className="security-section" id="security">
          <div className="bb-container security-inner">
            <Reveal className="security-header">
              <div>
                <span className="eyebrow">THE QUIET PROMISE</span>
                <h2>Your money stays<br /><em>your business.</em></h2>
              </div>
              <p>We build the guardrails into the experience, so confidence isn&apos;t something you have to think about. Your financial data is protected by design, not as an afterthought.</p>
            </Reveal>
            <div className="security-points">
              <Reveal>
                <LockKeyhole size={19} />
                <b>Private by design</b>
                <span>Private storage, ownership checks, and scoped access at every layer of the application.</span>
              </Reveal>
              <Reveal delay={100}>
                <FileText size={19} />
                <b>Receipts, on your terms</b>
                <span>AI extracts the details. You confirm what becomes a transaction before anything is saved.</span>
              </Reveal>
              <Reveal delay={200}>
                <Lightbulb size={19} />
                <b>Advice, not absolutes</b>
                <span>Forecasts show their confidence and acknowledge when data is limited, with honest uncertainty.</span>
              </Reveal>
            </div>
            <div className="security-footer">
              <span><Check size={15} /> No hidden integrations</span>
              <span><Check size={15} /> No invented numbers</span>
              <span><Check size={15} /> No noisy notifications</span>
              <Button onClick={() => setView('signup')} icon={<ArrowUpRight size={15} />}>Start free</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="bb-container footer-inner">
          <Logo />
          <span>© 2026 BudgetBuddy AI. A calmer money habit starts here.</span>
          <div>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features') }}>Features</a>
            <a href="#security" onClick={(e) => { e.preventDefault(); scrollTo('security') }}>Principles</a>
            <a href="#dashboard" onClick={(e) => { e.preventDefault(); scrollTo('dashboard') }}>Demo</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Landing page dashboard preview (static showcase)
function LandingDashboardPreview() {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Transactions' | 'Budgets' | 'Forecast' | 'AI Assistant'>('Overview')
  const setToast = useStore((s) => s.setToast)
  const setView = useStore((s) => s.setView)

  const navItems = [
    { label: 'Overview', icon: ChartNoAxesCombined },
    { label: 'Transactions', icon: ReceiptText },
    { label: 'Budgets', icon: Target },
    { label: 'Forecast', icon: TrendingUp },
    { label: 'AI Assistant', icon: Bot },
  ] as const

  const demoTransactions = [
    { name: 'Whole Foods Market', category: 'Groceries', date: 'Today, 10:42 AM', amount: '−$86.40', type: 'expense' as const, color: 'green', icon: 'W' },
    { name: 'Acme Studio', category: 'Salary', date: 'Jun 21, 9:00 AM', amount: '+$4,800.00', type: 'income' as const, color: 'blue', icon: 'A' },
    { name: 'Notion', category: 'Subscriptions', date: 'Jun 20, 4:15 PM', amount: '−$12.00', type: 'expense' as const, color: 'violet', icon: 'N' },
    { name: 'Uber', category: 'Transport', date: 'Jun 20, 8:32 AM', amount: '−$24.70', type: 'expense' as const, color: 'amber', icon: 'U' },
  ]

  const categories = [
    { label: 'Housing', value: '$1,240', percent: 72, color: 'green' },
    { label: 'Food & dining', value: '$486', percent: 48, color: 'cyan' },
    { label: 'Transport', value: '$224', percent: 30, color: 'violet' },
    { label: 'Subscriptions', value: '$96', percent: 18, color: 'orange' },
  ]

  return (
    <section className="product-stage" id="dashboard">
      <div className="bb-container">
        <Reveal className="stage-header">
          <div>
            <span className="eyebrow">THE MONEY OS</span>
            <h2>A calmer view of your <em>financial life.</em></h2>
            <p>Every signal, beautifully organized. This is the BudgetBuddy experience.</p>
          </div>
          <div className="stage-meta">
            <span className="demo-badge"><i />Demo workspace</span>
            <span className="stage-note">Data shown is illustrative</span>
          </div>
        </Reveal>
        <Reveal className="app-frame">
          <aside className="app-sidebar">
            <div className="sidebar-top">
              <Logo compact />
            </div>
            <div className="workspace-chip">
              <span className="workspace-avatar">JL</span>
              <span>
                <b>Jordan Lee</b>
                <small>Personal workspace</small>
              </span>
              <ChevronRight size={14} />
            </div>
            <nav className="app-nav">
              {navItems.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  className={`app-nav-item ${activeTab === label ? 'active' : ''}`}
                  onClick={() => setActiveTab(label)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {activeTab === label && <i />}
                </button>
              ))}
            </nav>
            <div className="sidebar-divider" />
            <nav className="app-nav secondary-nav">
              <button className="app-nav-item" onClick={() => setToast('Goals view is available in the full app')}>
                <Zap size={18} /><span>Savings goals</span>
              </button>
              <button className="app-nav-item" onClick={() => setToast('Settings are ready for your preferences')}>
                <MoreHorizontal size={18} /><span>Settings</span>
              </button>
            </nav>
            <div className="sidebar-bottom">
              <div className="sidebar-ai">
                <div className="ai-icon"><Sparkles size={15} /></div>
                <div>
                  <b>AI companion</b>
                  <small>2 fresh insights</small>
                </div>
                <ChevronRight size={15} />
              </div>
              <div className="sidebar-user">
                <span className="user-avatar">JL</span>
                <span>
                  <b>Jordan Lee</b>
                  <small>Free plan</small>
                </span>
                <MoreHorizontal size={16} />
              </div>
            </div>
          </aside>
          <main className="app-main">
            <header className="app-topbar">
              <div className="topbar-title">
                <span>Monday, June 23, 2025</span>
                <h3>{activeTab}</h3>
              </div>
              <div className="topbar-actions">
                <button className="topbar-search" onClick={() => setToast('Search is available in the full app')}>
                  <Search size={16} /><span>Search anything</span><kbd>⌘ K</kbd>
                </button>
                <button className="icon-button has-dot" onClick={() => setToast('You are all caught up')} aria-label="Notifications">
                  <CalendarClock size={18} />
                </button>
                <div className="topbar-avatar">JL</div>
              </div>
            </header>
            <div className="app-content">
              {activeTab === 'Overview' && (
                <>
                  <div className="dashboard-greeting">
                    <div>
                      <span className="muted-label">MONDAY, JUNE 23</span>
                      <h4>Good morning, Jordan <span>✦</span></h4>
                      <p>Here&apos;s your money story at a glance.</p>
                    </div>
                  </div>
                  <div className="metric-grid">
                    <div className="metric-card">
                      <div className="metric-head">
                        <span>Total balance</span>
                        <span className="metric-icon green"><WalletCards size={18} /></span>
                      </div>
                      <div className="metric-value">$12,840.56</div>
                      <div className="metric-foot">
                        <span className="trend-up">↗ 12.8%</span>
                        <span>vs. $11,384 last month</span>
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-head">
                        <span>Income</span>
                        <span className="metric-icon blue"><ArrowDownLeft size={18} /></span>
                      </div>
                      <div className="metric-value">$6,420.00</div>
                      <div className="metric-foot">
                        <span className="trend-up">↗ 10.7%</span>
                        <span>vs. $5,800 last month</span>
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-head">
                        <span>Spent</span>
                        <span className="metric-icon orange"><ArrowOut size={18} /></span>
                      </div>
                      <div className="metric-value">$2,840.64</div>
                      <div className="metric-foot">
                        <span className="trend-up">↗ 9.1%</span>
                        <span>vs. $3,124 last month</span>
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-head">
                        <span>Savings rate</span>
                        <span className="metric-icon violet"><Target size={18} /></span>
                      </div>
                      <div className="metric-value">55.8%</div>
                      <div className="metric-foot">
                        <span className="trend-up">↗ 8.4%</span>
                        <span>You&apos;re ahead of goal</span>
                      </div>
                    </div>
                  </div>
                  <div className="dashboard-grid top-grid">
                    <div className="dashboard-card">
                      <div className="card-heading">
                        <div>
                          <span className="muted-label">CASHFLOW</span>
                          <h5>Income vs. expenses</h5>
                        </div>
                        <div className="legend">
                          <span><i className="legend-dot green-dot" />Income</span>
                          <span><i className="legend-dot blue-dot" />Expenses</span>
                        </div>
                      </div>
                      <div className="cashflow-value">
                        <b>$3,579.36</b>
                        <span className="trend-up">↗ 18.4%</span>
                        <small>net this month</small>
                      </div>
                      <MiniChart />
                    </div>
                    <div className="dashboard-card">
                      <div className="card-heading">
                        <div>
                          <span className="muted-label">BUDGET HEALTH</span>
                          <h5>You have room to breathe.</h5>
                        </div>
                        <div className="insight-spark"><Sparkles size={16} /></div>
                      </div>
                      <div className="budget-ring">
                        <div className="ring-progress" style={{ background: 'conic-gradient(var(--green) 0% 68%, var(--surface-soft) 68% 100%)' }}>
                          <strong>68<span>%</span></strong>
                          <small>used</small>
                        </div>
                      </div>
                      <div className="insight-caption">
                        <b>$1,340 left</b>
                        <span>of your $4,180 monthly budget</span>
                      </div>
                      <button className="text-link" onClick={() => setActiveTab('Budgets')}>View budget details <ArrowUpRight size={14} /></button>
                    </div>
                  </div>
                  <div className="dashboard-grid bottom-grid">
                    <div className="dashboard-card">
                      <div className="card-heading">
                        <div>
                          <span className="muted-label">LATEST ACTIVITY</span>
                          <h5>Recent transactions</h5>
                        </div>
                        <button className="card-action" onClick={() => setActiveTab('Transactions')}>View all <ArrowUpRight size={14} /></button>
                      </div>
                      <div className="transaction-list">
                        {demoTransactions.slice(0, 3).map((item) => (
                          <div className="transaction-row" key={item.name}>
                            <span className={`merchant-avatar ${item.color}`}>{item.icon}</span>
                            <span className="transaction-primary">
                              <b>{item.name}</b>
                              <small>{item.category}</small>
                            </span>
                            <span className="transaction-date">{item.date}</span>
                            <b className={item.type === 'income' ? 'amount-positive' : 'amount-negative'}>{item.amount}</b>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="dashboard-card">
                      <div className="card-heading">
                        <div>
                          <span className="muted-label">SAVINGS GOAL</span>
                          <h5>Japan, October</h5>
                        </div>
                        <Target size={18} className="card-heading-icon" />
                      </div>
                      <div className="goal-progress-head">
                        <b>$3,420</b>
                        <span>of $5,000</span>
                      </div>
                      <div className="progress-track"><i style={{ width: '68%' }} /></div>
                      <div className="goal-footer">
                        <span>68% complete</span>
                        <span>98 days left</span>
                      </div>
                      <div className="goal-streak">
                        <span>✦</span>
                        <div>
                          <b>Great momentum.</b>
                          <small>At this pace, you&apos;ll reach your goal 12 days early.</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'Transactions' && (
                <div className="tab-view">
                  <div className="tab-view-heading">
                    <div>
                      <span className="muted-label">YOUR MONEY TRAIL</span>
                      <h4>Transactions</h4>
                      <p>Clean, searchable, and always in your control.</p>
                    </div>
                    <Button onClick={() => setView('signup')} icon={<ChevronRight size={16} />}>Add transaction</Button>
                  </div>
                  <div className="dashboard-card full-card">
                    <div className="transaction-list">
                      {demoTransactions.map((item) => (
                        <div className="transaction-row" key={item.name}>
                          <span className={`merchant-avatar ${item.color}`}>{item.icon}</span>
                          <span className="transaction-primary">
                            <b>{item.name}</b>
                            <small>{item.category}</small>
                          </span>
                          <span className="transaction-date">{item.date}</span>
                          <b className={item.type === 'income' ? 'amount-positive' : 'amount-negative'}>{item.amount}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'Budgets' && (
                <div className="tab-view">
                  <div className="tab-view-heading">
                    <div>
                      <span className="muted-label">SPEND WITH INTENTION</span>
                      <h4>Smart budgets</h4>
                      <p>Your guardrails adapt as your life changes.</p>
                    </div>
                  </div>
                  <div className="budget-board">
                    {categories.map((item) => (
                      <div className="dashboard-card budget-tile" key={item.label}>
                        <div className="budget-tile-top">
                          <span className={`budget-icon ${item.color}`}><CircleDollarSign size={16} /></span>
                        </div>
                        <span className="muted-label">{item.label.toUpperCase()}</span>
                        <div className="budget-amount">
                          <b>{item.value}</b>
                          <span>of $1,720</span>
                        </div>
                        <div className="progress-track"><i className={item.color} style={{ width: `${item.percent}%` }} /></div>
                        <div className="goal-footer">
                          <span>{item.percent}% used</span>
                          <span>{100 - item.percent}% remaining</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="dashboard-card budget-callout">
                    <div className="insight-spark"><Lightbulb size={18} /></div>
                    <div>
                      <b>A small shift, a big difference</b>
                      <p>Dining out is trending 14% lower than last month. Keep the momentum and you could add another $120 to your Japan goal.</p>
                    </div>
                    <ChevronRight size={18} />
                  </div>
                </div>
              )}
              {activeTab === 'Forecast' && (
                <div className="tab-view">
                  <div className="tab-view-heading">
                    <div>
                      <span className="muted-label">LOOKING AHEAD</span>
                      <h4>Spending forecast</h4>
                      <p>A grounded projection based on your recent rhythm.</p>
                    </div>
                    <span className="confidence-pill"><i />Medium confidence</span>
                  </div>
                  <div className="forecast-hero dashboard-card">
                    <div>
                      <span className="muted-label">PROJECTED NEXT MONTH SPEND</span>
                      <div className="forecast-number">$3,620 <span>± $180</span></div>
                      <p>That&apos;s <b>$214 less</b> than your typical month. Your recurring commitments are already covered.</p>
                    </div>
                    <div className="forecast-orb"><TrendingUp size={30} /></div>
                  </div>
                  <div className="dashboard-card">
                    <div className="card-heading">
                      <div>
                        <span className="muted-label">CATEGORY ESTIMATE</span>
                        <h5>Where your money may go</h5>
                      </div>
                      <span className="muted-label">NEXT 30 DAYS</span>
                    </div>
                    {categories.map((item) => (
                      <div className="forecast-row" key={item.label}>
                        <span>{item.label}</span>
                        <div className="forecast-bar"><i className={item.color} style={{ width: `${item.percent + 14}%` }} /></div>
                        <b>${item.value.replace('$', '')}</b>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'AI Assistant' && (
                <div className="tab-view">
                  <div className="tab-view-heading">
                    <div>
                      <span className="muted-label">YOUR MONEY COMPANION</span>
                      <h4>Ask anything about your money.</h4>
                      <p>Answers grounded in your own financial context.</p>
                    </div>
                    <span className="online-pill"><i />Ready</span>
                  </div>
                  <div className="assistant-shell dashboard-card">
                    <div className="assistant-message assistant-message-ai">
                      <span className="assistant-avatar"><Sparkles size={16} /></span>
                      <div>
                        <b>BudgetBuddy AI</b>
                        <p>Hi Jordan. I&apos;ve looked at your recent activity. What would you like to understand better?</p>
                      </div>
                    </div>
                    <div className="prompt-chips">
                      <button onClick={() => setToast('Sign up to chat with your data')}>Where did I spend the most?</button>
                      <button onClick={() => setToast('Sign up to chat with your data')}>How can I save $300?</button>
                      <button onClick={() => setToast('Sign up to chat with your data')}>Am I on track for Japan?</button>
                    </div>
                    <div className="assistant-composer">
                      <input placeholder="Ask about your spending, goals, or habits..." />
                      <button aria-label="Send question" onClick={() => setView('signup')}><Send size={17} /></button>
                    </div>
                    <span className="assistant-disclaimer"><LockKeyhole size={12} />Your data is private. AI suggestions never change your transactions.</span>
                  </div>
                </div>
              )}
            </div>
          </main>
        </Reveal>
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Button onClick={() => setView('signup')} icon={<ArrowUpRight size={16} />}>Try the full experience</Button>
        </div>
      </div>
    </section>
  )
}
