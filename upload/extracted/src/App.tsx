import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  CalendarClock,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Database,
  FileText,
  Globe2,
  Lightbulb,
  LockKeyhole,
  Menu,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  ScanLine,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'

type Theme = 'dark' | 'light'
type Tab = 'Overview' | 'Transactions' | 'Budgets' | 'Forecast' | 'AI Assistant'

type Transaction = {
  name: string
  category: string
  date: string
  amount: string
  type: 'income' | 'expense'
  color: string
  icon: string
}

const transactions: Transaction[] = [
  { name: 'Whole Foods Market', category: 'Groceries', date: 'Today, 10:42 AM', amount: '−$86.40', type: 'expense', color: 'mint', icon: 'W' },
  { name: 'Acme Studio', category: 'Salary', date: 'Jun 21, 9:00 AM', amount: '+$4,800.00', type: 'income', color: 'blue', icon: 'A' },
  { name: 'Notion', category: 'Subscriptions', date: 'Jun 20, 4:15 PM', amount: '−$12.00', type: 'expense', color: 'violet', icon: 'N' },
  { name: 'Uber', category: 'Transport', date: 'Jun 20, 8:32 AM', amount: '−$24.70', type: 'expense', color: 'amber', icon: 'U' },
]

const categories = [
  { label: 'Housing', value: '$1,240', percent: 72, color: 'green' },
  { label: 'Food & dining', value: '$486', percent: 48, color: 'cyan' },
  { label: 'Transport', value: '$224', percent: 30, color: 'violet' },
  { label: 'Subscriptions', value: '$96', percent: 18, color: 'orange' },
]

const navItems: { label: Tab; icon: typeof ChartNoAxesCombined }[] = [
  { label: 'Overview', icon: ChartNoAxesCombined },
  { label: 'Transactions', icon: ReceiptText },
  { label: 'Budgets', icon: Target },
  { label: 'Forecast', icon: TrendingUp },
  { label: 'AI Assistant', icon: Bot },
]

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-mark" aria-label="BudgetBuddy AI">
      <div className="brand-symbol"><span /><span /><span /></div>
      {!compact && <span className="brand-name">budget<span>buddy</span><i>AI</i></span>}
    </div>
  )
}

function Button({ children, variant = 'primary', onClick, className = '', icon }: { children: React.ReactNode; variant?: 'primary' | 'ghost' | 'quiet'; onClick?: () => void; className?: string; icon?: React.ReactNode }) {
  return <button className={`btn btn-${variant} ${className}`} onClick={onClick}>{children}{icon}</button>
}

function MiniChart({ compact = false }: { compact?: boolean }) {
  const bars = [32, 42, 38, 56, 48, 69, 58, 82, 64, 78, 72, 91]
  return (
    <div className={`mini-chart ${compact ? 'mini-chart-compact' : ''}`}>
      <div className="chart-grid"><span /><span /><span /></div>
      <div className="chart-bars">
        {bars.map((height, index) => <div className={`chart-bar ${index > 8 ? 'is-current' : ''}`} style={{ height: `${height}%` }} key={index}><i /></div>)}
      </div>
      {!compact && <div className="chart-labels"><span>May 25</span><span>Jun 01</span><span>Jun 08</span><span>Jun 15</span><span>Jun 22</span></div>}
    </div>
  )
}

function HeroProductVisual() {
  return (
    <div className="hero-visual" aria-label="BudgetBuddy dashboard preview">
      <div className="visual-aura aura-one" />
      <div className="visual-aura aura-two" />
      <div className="coin coin-one">$</div>
      <div className="coin coin-two">€</div>
      <div className="coin coin-three">↗</div>
      <div className="orb"><div className="orb-core"><Sparkles size={17} /></div><span>AI</span></div>
      <div className="floating-note note-one"><span className="note-icon note-green">↗</span><span><b>+ $4,800</b><small>Salary received</small></span></div>
      <div className="floating-note note-two"><span className="note-icon note-orange">−</span><span><b>− $86.40</b><small>Whole Foods</small></span></div>
      <div className="hero-card balance-float">
        <div className="card-topline"><span>Total balance</span><MoreHorizontal size={17} /></div>
        <strong>$12,840<span>.56</span></strong>
        <div className="balance-meta"><span className="positive-pill">↗ 12.8%</span><small>vs last month</small></div>
        <div className="balance-sparkline"><svg viewBox="0 0 220 58" preserveAspectRatio="none"><defs><linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4de0a7" stopOpacity=".35"/><stop offset="1" stopColor="#4de0a7" stopOpacity="0"/></linearGradient></defs><path d="M0 47 C21 38, 24 42, 39 32 S68 49, 85 31 S111 36, 125 23 S145 41, 160 20 S188 28, 220 4 L220 58 L0 58Z" fill="url(#sparkFill)"/><path d="M0 47 C21 38, 24 42, 39 32 S68 49, 85 31 S111 36, 125 23 S145 41, 160 20 S188 28, 220 4" fill="none" stroke="#4de0a7" strokeWidth="2.5" strokeLinecap="round"/></svg></div>
      </div>
      <div className="hero-card spending-float">
        <div className="card-topline"><span>Spending pulse</span><span className="live-dot">Live</span></div>
        <div className="pulse-number"><b>$2,840</b><span>this month</span></div>
        <MiniChart compact />
      </div>
      <div className="depth-grid" />
    </div>
  )
}

function MetricCard({ label, value, detail, icon, trend, accent }: { label: string; value: string; detail: string; icon: React.ReactNode; trend: string; accent: string }) {
  return <div className="metric-card">
    <div className="metric-head"><span>{label}</span><span className={`metric-icon ${accent}`}>{icon}</span></div>
    <div className="metric-value">{value}</div>
    <div className="metric-foot"><span className="trend-up">↗ {trend}</span><span>{detail}</span></div>
  </div>
}

function TransactionRow({ item }: { item: Transaction }) {
  return <div className="transaction-row">
    <span className={`merchant-avatar ${item.color}`}>{item.icon}</span>
    <span className="transaction-primary"><b>{item.name}</b><small>{item.category}</small></span>
    <span className="transaction-date">{item.date}</span>
    <b className={item.type === 'income' ? 'amount-positive' : 'amount-negative'}>{item.amount}</b>
    <button className="icon-button" aria-label={`More options for ${item.name}`}><MoreHorizontal size={17} /></button>
  </div>
}

function DashboardPreview({ activeTab, setActiveTab, onToast }: { activeTab: Tab; setActiveTab: (tab: Tab) => void; onToast: (message: string) => void }) {
  const [collapsed, setCollapsed] = useState(false)
  const [range, setRange] = useState('This month')
  const [search, setSearch] = useState('')
  const [assistantInput, setAssistantInput] = useState('')
  const filtered = useMemo(() => transactions.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase())), [search])

  return <section className="product-stage" id="dashboard">
    <div className="stage-header reveal">
      <div><span className="eyebrow">THE MONEY OS</span><h2>A calmer view of your <em>financial life.</em></h2><p>Every signal, beautifully organized. This is the BudgetBuddy experience.</p></div>
      <div className="stage-meta"><span className="demo-badge"><i />Demo workspace</span><span className="stage-note">Data shown is illustrative</span></div>
    </div>
    <div className="app-frame reveal">
      <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
        <div className="sidebar-top"><Logo compact={collapsed} /><button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">{collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button></div>
        <div className="workspace-chip"><span className="workspace-avatar">JL</span>{!collapsed && <span><b>Jordan Lee</b><small>Personal workspace</small></span>} {!collapsed && <ChevronDown size={14} />}</div>
        <nav className="app-nav">{navItems.map(({ label, icon: Icon }) => <button key={label} className={`app-nav-item ${activeTab === label ? 'active' : ''}`} onClick={() => setActiveTab(label)}><Icon size={18} />{!collapsed && <span>{label}</span>}{activeTab === label && !collapsed && <i />}</button>)}</nav>
        {!collapsed && <div className="sidebar-divider" />}
        <nav className="app-nav secondary-nav"><button className="app-nav-item" onClick={() => onToast('Goals view added to your workspace')}><Zap size={18} /><span>Savings goals</span></button><button className="app-nav-item" onClick={() => onToast('Settings are ready for your preferences')}><Settings2 size={18} /><span>Settings</span></button></nav>
        {!collapsed && <div className="sidebar-bottom"><div className="sidebar-ai"><div className="ai-icon"><Sparkles size={15} /></div><div><b>AI companion</b><small>2 fresh insights</small></div><ChevronRight size={15} /></div><div className="sidebar-user"><span className="user-avatar">JL</span><span><b>Jordan Lee</b><small>Free plan</small></span><MoreHorizontal size={16} /></div></div>}
      </aside>
      <main className="app-main">
        <header className="app-topbar"><div className="mobile-brand"><Logo /></div><div className="topbar-title"><span>Monday, June 23, 2025</span><h3>{activeTab}</h3></div><div className="topbar-actions"><button className="topbar-search" onClick={() => document.getElementById('transaction-search')?.focus()}><Search size={16} /><span>Search anything</span><kbd>⌘ K</kbd></button><button className="icon-button has-dot" onClick={() => onToast('You are all caught up')} aria-label="Notifications"><CalendarClock size={18} /></button><div className="topbar-avatar">JL</div></div></header>
        <div className="app-content">
          {activeTab === 'Overview' && <>
            <div className="dashboard-greeting"><div><span className="muted-label">MONDAY, JUNE 23</span><h4>Good morning, Jordan <span>✦</span></h4><p>Here’s your money story at a glance.</p></div><div className="range-select"><span>Range</span><select value={range} onChange={(e) => setRange(e.target.value)}><option>This month</option><option>Last month</option><option>Last 90 days</option></select><ChevronDown size={15} /></div></div>
            <div className="metric-grid"><MetricCard label="Total balance" value="$12,840.56" detail="vs. $11,384 last month" trend="12.8%" icon={<WalletCards size={18} />} accent="green" /><MetricCard label="Income" value="$6,420.00" detail="vs. $5,800 last month" trend="10.7%" icon={<ArrowDownLeft size={18} />} accent="blue" /><MetricCard label="Spent" value="$2,840.64" detail="vs. $3,124 last month" trend="9.1%" icon={<ArrowUpRight size={18} />} accent="orange" /><MetricCard label="Savings rate" value="55.8%" detail="You’re ahead of goal" trend="8.4%" icon={<Target size={18} />} accent="violet" /></div>
            <div className="dashboard-grid top-grid"><div className="dashboard-card cashflow-card"><div className="card-heading"><div><span className="muted-label">CASHFLOW</span><h5>Income vs. expenses</h5></div><div className="legend"><span><i className="legend-dot green-dot" />Income</span><span><i className="legend-dot blue-dot" />Expenses</span></div></div><div className="cashflow-value"><b>$3,579.36</b><span className="trend-up">↗ 18.4%</span><small>net this month</small></div><MiniChart /></div><div className="dashboard-card insight-card"><div className="card-heading"><div><span className="muted-label">BUDGET HEALTH</span><h5>You have room to breathe.</h5></div><div className="insight-spark"><Sparkles size={16} /></div></div><div className="budget-ring"><div className="ring-progress"><strong>68<span>%</span></strong><small>used</small></div></div><div className="insight-caption"><b>$1,340 left</b><span>of your $4,180 monthly budget</span></div><button className="text-link" onClick={() => setActiveTab('Budgets')}>View budget details <ArrowUpRight size={14} /></button></div></div>
            <div className="dashboard-grid bottom-grid"><div className="dashboard-card transactions-card"><div className="card-heading"><div><span className="muted-label">LATEST ACTIVITY</span><h5>Recent transactions</h5></div><button className="card-action" onClick={() => setActiveTab('Transactions')}>View all <ArrowUpRight size={14} /></button></div><div className="transaction-list">{transactions.slice(0, 3).map((item) => <TransactionRow item={item} key={item.name} />)}</div></div><div className="dashboard-card goals-card"><div className="card-heading"><div><span className="muted-label">SAVINGS GOAL</span><h5>Japan, October</h5></div><Target size={18} className="card-heading-icon" /></div><div className="goal-progress"><div className="goal-progress-head"><b>$3,420</b><span>of $5,000</span></div><div className="progress-track"><i style={{ width: '68%' }} /></div><div className="goal-footer"><span>68% complete</span><span>98 days left</span></div></div><div className="goal-streak"><span>✦</span><b>Great momentum.</b><small>At this pace, you’ll reach your goal 12 days early.</small></div></div></div>
          </>}
          {activeTab === 'Transactions' && <div className="tab-view"><div className="tab-view-heading"><div><span className="muted-label">YOUR MONEY TRAIL</span><h4>Transactions</h4><p>Clean, searchable, and always in your control.</p></div><Button onClick={() => onToast('New transaction form opened')} icon={<ChevronRight size={16} />}>Add transaction</Button></div><div className="filter-row"><div className="search-field"><Search size={16} /><input id="transaction-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search merchant or category" /></div><button className="filter-button">All types <ChevronDown size={15} /></button><button className="filter-button">June 2025 <ChevronDown size={15} /></button></div><div className="dashboard-card transactions-card full-card"><div className="transaction-list">{filtered.map((item) => <TransactionRow item={item} key={item.name} />)}</div>{filtered.length === 0 && <div className="empty-state"><Search size={22} /><b>No matching transactions</b><span>Try a different merchant or category.</span></div>}</div></div>}
          {activeTab === 'Budgets' && <div className="tab-view"><div className="tab-view-heading"><div><span className="muted-label">SPEND WITH INTENTION</span><h4>Smart budgets</h4><p>Your guardrails adapt as your life changes.</p></div><Button onClick={() => onToast('Budget setup opened')} icon={<ChevronRight size={16} />}>Create budget</Button></div><div className="budget-board">{categories.map((item) => <div className="dashboard-card budget-tile" key={item.label}><div className="budget-tile-top"><span className={`budget-icon ${item.color}`}><CircleDollarSign size={16} /></span><MoreHorizontal size={17} /></div><span className="muted-label">{item.label.toUpperCase()}</span><div className="budget-amount"><b>{item.value}</b><span>of {item.label === 'Housing' ? '$1,720' : item.label === 'Food & dining' ? '$1,000' : item.label === 'Transport' ? '$750' : '$520'}</span></div><div className="progress-track"><i className={item.color} style={{ width: `${item.percent}%` }} /></div><div className="goal-footer"><span>{item.percent}% used</span><span>{100 - item.percent}% remaining</span></div></div>)}</div><div className="dashboard-card budget-callout"><div className="insight-spark"><Lightbulb size={18} /></div><div><b>A small shift, a big difference</b><p>Dining out is trending 14% lower than last month. Keep the momentum and you could add another $120 to your Japan goal.</p></div><ChevronRight size={18} /></div></div>}
          {activeTab === 'Forecast' && <div className="tab-view"><div className="tab-view-heading"><div><span className="muted-label">LOOKING AHEAD</span><h4>Spending forecast</h4><p>A grounded projection based on your recent rhythm.</p></div><span className="confidence-pill"><i />Medium confidence</span></div><div className="forecast-hero dashboard-card"><div><span className="muted-label">PROJECTED JUNE SPEND</span><div className="forecast-number">$3,620 <span>± $180</span></div><p>That’s <b>$214 less</b> than your typical month. Your recurring commitments are already covered.</p></div><div className="forecast-orb"><TrendingUp size={30} /></div></div><div className="dashboard-card forecast-chart"><div className="card-heading"><div><span className="muted-label">CATEGORY ESTIMATE</span><h5>Where your money may go</h5></div><span className="muted-label">NEXT 30 DAYS</span></div>{categories.map((item) => <div className="forecast-row" key={item.label}><span>{item.label}</span><div className="forecast-bar"><i className={item.color} style={{ width: `${item.percent + 14}%` }} /></div><b>{item.label === 'Housing' ? '$1,240' : item.label === 'Food & dining' ? '$540' : item.label === 'Transport' ? '$260' : '$102'}</b></div>)}</div></div>}
          {activeTab === 'AI Assistant' && <div className="tab-view"><div className="tab-view-heading"><div><span className="muted-label">YOUR MONEY COMPANION</span><h4>Ask anything about your money.</h4><p>Answers grounded in your own financial context.</p></div><span className="online-pill"><i />Ready</span></div><div className="assistant-shell dashboard-card"><div className="assistant-message assistant-message-ai"><span className="assistant-avatar"><Sparkles size={16} /></span><div><b>BudgetBuddy AI</b><p>Hi Jordan. I’ve looked at your recent activity. What would you like to understand better?</p></div></div><div className="prompt-chips"><button onClick={() => setAssistantInput('Where did I spend the most this month?')}>Where did I spend the most?</button><button onClick={() => setAssistantInput('How can I save $300 this month?')}>How can I save $300?</button><button onClick={() => setAssistantInput('Am I on track for Japan?')}>Am I on track for Japan?</button></div><div className="assistant-composer"><input value={assistantInput} onChange={(e) => setAssistantInput(e.target.value)} placeholder="Ask about your spending, goals, or habits..." onKeyDown={(e) => { if (e.key === 'Enter' && assistantInput) onToast('BudgetBuddy is thinking through your data') }} /><button onClick={() => assistantInput && onToast('BudgetBuddy is thinking through your data')} aria-label="Send question"><Send size={17} /></button></div><span className="assistant-disclaimer"><LockKeyhole size={12} />Your data is private. AI suggestions never change your transactions.</span></div></div>}
        </div>
      </main>
    </div>
  </section>
}

function App() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [toast, setToast] = useState('')

  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 3200); return () => window.clearTimeout(timer) }, [toast])
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }

  return <div className="site-shell">
    <header className="site-header"><div className="container header-inner"><a className="logo-link" href="#top" onClick={(e) => { e.preventDefault(); scrollTo('top') }}><Logo /></a><nav className={`site-nav ${menuOpen ? 'is-open' : ''}`}><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features') }}>Features</a><a href="#architecture" onClick={(e) => { e.preventDefault(); scrollTo('architecture') }}>How it works</a><a href="#security" onClick={(e) => { e.preventDefault(); scrollTo('security') }}>Security</a><a href="#dashboard" onClick={(e) => { e.preventDefault(); scrollTo('dashboard') }}>Dashboard</a></nav><div className="header-actions"><button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button><button className="login-link" onClick={() => setToast('Sign in is available when authentication is configured')}>Sign in</button><Button className="header-cta" onClick={() => scrollTo('dashboard')} icon={<ArrowUpRight size={16} />}>Get started <span>free</span></Button><button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X size={21} /> : <Menu size={21} />}</button></div></div></header>
    <main id="top">
      <section className="hero-section"><div className="hero-glow glow-left" /><div className="hero-glow glow-right" /><div className="container hero-grid"><div className="hero-copy reveal"><div className="announcement"><span><Sparkles size={13} /> New: a calmer way to think about money</span><ChevronRight size={14} /></div><h1>Your money.<br /><em>Smarter</em> than ever.</h1><p className="hero-subtitle">Track every expense, understand your spending, and achieve your financial goals with the power of AI.</p><div className="hero-actions"><Button onClick={() => scrollTo('dashboard')} icon={<ArrowUpRight size={17} />}>Get started free</Button><button className="secondary-cta" onClick={() => scrollTo('features')}><span className="play-icon"><ScanLine size={15} /></span> Explore the experience</button></div><div className="hero-proof"><div className="avatar-stack"><span>R</span><span>M</span><span>A</span><span>+</span></div><span>Built for people who want <b>clarity</b>, not complexity.</span></div></div><div className="hero-side reveal"><HeroProductVisual /><div className="visual-caption"><span><i />Intelligence, at a glance</span><span>Scroll to explore ↓</span></div></div></div><div className="hero-bottom container"><div className="trusted-line">A more intentional money habit, powered by <span>thoughtful technology</span></div><div className="logo-row"><span><Database size={15} /> Supabase</span><span><BrainCircuit size={15} /> AI-powered</span><span><ShieldCheck size={15} /> Private by design</span><span><Globe2 size={15} /> Built for everywhere</span></div></div></section>
      <section className="manifesto-section"><div className="container manifesto-grid"><span className="eyebrow">MONEY, WITHOUT THE NOISE</span><div><h2>Clarity is a <em>feature.</em></h2><p>BudgetBuddy turns the messy middle of personal finance into a living picture you can actually use. Less bookkeeping. More knowing.</p><div className="manifesto-link" onClick={() => scrollTo('dashboard')}>See your money differently <ArrowUpRight size={16} /></div></div></div></section>
      <section className="features-section section-light" id="features"><div className="container"><div className="section-heading"><div><span className="eyebrow">ONE INTELLIGENT PLACE</span><h2>Good with numbers.<br /><em>Better with context.</em></h2></div><p>From the first coffee to the long-term goal, BudgetBuddy connects the dots so you can make decisions with less friction.</p></div><div className="feature-grid"><div className="feature-card feature-large"><div className="feature-index">01</div><div className="feature-icon green-icon"><ChartNoAxesCombined size={20} /></div><h3>See the whole picture.</h3><p>Every transaction, trend, and tiny habit in one beautifully clear view. No spreadsheets required.</p><div className="feature-visual trend-visual"><div className="trend-head"><span>Monthly pulse</span><b>+18.4%</b></div><MiniChart compact /></div></div><div className="feature-card feature-dark"><div className="feature-index">02</div><div className="feature-icon blue-icon"><BrainCircuit size={20} /></div><h3>Intelligence that listens.</h3><p>Ask natural questions about your money and get answers grounded in your own history.</p><div className="ai-quote"><Sparkles size={15} /><span>“You’re spending 14% less on dining out this month. That’s $120 closer to Japan.”</span></div></div><div className="feature-card feature-goal"><div className="feature-index">03</div><div className="feature-icon violet-icon"><Target size={20} /></div><h3>Make room for what matters.</h3><p>Turn intentions into visible progress with goals that feel motivating, not moralizing.</p><div className="goal-orbit"><div className="orbit-ring" /><div className="orbit-core"><span>$3,420</span><small>of $5,000</small></div><span className="orbit-star star-one">✦</span><span className="orbit-star star-two">✧</span></div></div></div></div></section>
      <DashboardPreview activeTab={activeTab} setActiveTab={setActiveTab} onToast={setToast} />
      <section className="architecture-section" id="architecture"><div className="container architecture-grid"><div className="architecture-copy"><span className="eyebrow">BUILT TO EARN TRUST</span><h2>Beautiful on the surface.<br /><em>Considered underneath.</em></h2><p>BudgetBuddy is designed as a secure financial companion, not a pretty spreadsheet. Every feature has a clear reason to exist.</p><div className="arch-list"><div><span className="arch-num">01</span><span><b>Authoritative numbers</b><small>Backend-calculated totals keep the truth in the data layer.</small></span></div><div><span className="arch-num">02</span><span><b>Human-in-the-loop AI</b><small>Suggestions are transparent, editable, and never silently applied.</small></span></div><div><span className="arch-num">03</span><span><b>Private by default</b><small>Row-level security keeps every financial record scoped to you.</small></span></div></div><button className="text-link" onClick={() => scrollTo('security')}>Read the principles <ArrowUpRight size={14} /></button></div><div className="architecture-visual"><div className="arch-orbit orbit-back" /><div className="arch-orbit orbit-mid" /><div className="arch-orbit orbit-front" /><div className="arch-core"><div className="arch-core-icon"><LockKeyhole size={24} /></div><b>Your financial context</b><small>encrypted · scoped · yours</small></div><span className="arch-chip chip-db"><Database size={14} /> PostgreSQL</span><span className="arch-chip chip-ai"><Bot size={14} /> AI insight</span><span className="arch-chip chip-auth"><ShieldCheck size={14} /> RLS protected</span></div></div></section>
      <section className="security-section" id="security"><div className="container security-inner"><div className="security-header"><div><span className="eyebrow">THE QUIET PROMISE</span><h2>Your money stays<br /><em>your business.</em></h2></div><p>We build the guardrails into the experience, so confidence isn’t something you have to think about.</p></div><div className="security-points"><div><LockKeyhole size={19} /><b>Private by design</b><span>Private storage, ownership checks, and scoped access at every layer.</span></div><div><FileText size={19} /><b>Receipts, on your terms</b><span>AI extracts the details. You confirm what becomes a transaction.</span></div><div><Lightbulb size={19} /><b>Advice, not absolutes</b><span>Forecasts show their confidence and acknowledge when data is limited.</span></div></div><div className="security-footer"><span><Check size={15} /> No hidden integrations</span><span><Check size={15} /> No invented numbers</span><span><Check size={15} /> No noisy notifications</span><button onClick={() => scrollTo('dashboard')}>Explore the demo <ArrowUpRight size={15} /></button></div></div></section>
    </main>
    <footer className="site-footer"><div className="container footer-inner"><Logo /><span>© 2025 BudgetBuddy AI. A calmer money habit starts here.</span><div><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features') }}>Features</a><a href="#security" onClick={(e) => { e.preventDefault(); scrollTo('security') }}>Principles</a><a href="#dashboard" onClick={(e) => { e.preventDefault(); scrollTo('dashboard') }}>Demo</a></div></div></footer>
    {toast && <div className="toast"><span className="toast-check"><Check size={15} /></span><span>{toast}</span><button onClick={() => setToast('')} aria-label="Dismiss"><X size={14} /></button></div>}
  </div>
}

export default App
