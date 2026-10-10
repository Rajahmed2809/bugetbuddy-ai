'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { LandingPage } from '@/components/budgetbuddy/LandingPage'
import { LoginView, SignupView, OnboardingView } from '@/components/budgetbuddy/AuthViews'
import { DashboardShell } from '@/components/budgetbuddy/DashboardShell'
import { ToastContainer } from '@/components/budgetbuddy/shared'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const view = useStore((s) => s.view)
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  const profile = useStore((s) => s.profile)
  const preferences = useStore((s) => s.preferences)
  const toast = useStore((s) => s.toast)
  const setToast = useStore((s) => s.setToast)

  // Apply theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme
    document.documentElement.classList.toggle('light', preferences.theme === 'light')
  }, [preferences.theme])

  // Apply reduced motion
  useEffect(() => {
    if (preferences.reduceMotion) {
      document.documentElement.style.setProperty('--motion', '0')
    }
  }, [preferences.reduceMotion])

  // Handle hydration — mounted guard prevents SSR/client mismatch with localStorage-persisted state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Auto-redirect: authenticated & onboarded users go straight to the app
  useEffect(() => {
    if (!mounted) return
    if (isAuthenticated && profile?.onboarded && view !== 'app') {
      useStore.getState().setView('app')
    }
    // If not authenticated but somehow on app view, go to landing
    if (!isAuthenticated && (view === 'app' || view === 'onboarding')) {
      useStore.getState().setView('landing')
    }
  }, [isAuthenticated, profile, view, mounted])

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--green) 0%, var(--green-strong) 100%)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    )
  }

  return (
    <>
      {view === 'landing' && <LandingPage />}
      {view === 'login' && <LoginView />}
      {view === 'signup' && <SignupView />}
      {view === 'onboarding' && <OnboardingView />}
      {view === 'app' && <DashboardShell />}
      <ToastContainer message={toast} onClose={() => setToast('')} />
    </>
  )
}
