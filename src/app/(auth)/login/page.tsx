'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, MessageSquare, AlertCircle } from 'lucide-react'
import { notifySuccess } from '@/components/notification/Toast'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Invalid credentials. Please try again.')
        setLoading(false)
        return
      }

      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)
      notifySuccess('Welcome back!')
      
      const pendingShareId = sessionStorage.getItem('pending_guest_share_id')
      if (pendingShareId) {
        router.push('/sync-guest')
      } else {
        router.push('/chat')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background mesh-gradient flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute top-20 left-10 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl animate-float" />
      <div aria-hidden className="pointer-events-none absolute bottom-10 right-10 w-96 h-96 bg-accent-400/8 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '3s' }} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-3xl p-7 sm:p-9 shadow-soft-lg">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-soft">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Welcome Back</h1>
            <p className="text-sm text-text-secondary mt-1.5">Sign in to continue to AI Chat</p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div role="alert" className="flex items-center gap-2.5 p-3.5 bg-error/10 border border-error/15 rounded-xl text-sm text-error">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="text-sm font-medium text-text-primary">Email</label>
              <div className="relative mt-1.5">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="peer w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary outline-none transition-all duration-150 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/10"
                />
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary transition-colors peer-focus:text-accent-500" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="text-sm font-medium text-text-primary">Password</label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="peer w-full pl-10 pr-12 py-3 bg-background border border-border rounded-xl text-sm text-text-primary outline-none transition-all duration-150 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/10"
                />
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary transition-colors peer-focus:text-accent-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-secondary hover:text-accent-600 hover:bg-accent-500/10 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <label htmlFor="remember" className="flex items-center gap-2.5 cursor-pointer select-none group">
                <input id="remember" type="checkbox" className="w-4 h-4 rounded-md border-border text-accent-600 focus:ring-accent-500/30 transition-colors" />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-sm text-accent-600 hover:text-accent-700 font-medium transition-colors">
                Forgot password?
              </button>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-3 bg-accent-600 text-white rounded-xl font-medium shadow-soft transition-all hover:bg-accent-700 hover:shadow-md hover:shadow-accent-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 relative z-10" /> <span className="relative z-10">Sign In</span>
                </>
              )}
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="text-center text-sm text-text-secondary mt-7">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-accent-600 hover:text-accent-700 font-medium transition-colors">
              Create one
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
