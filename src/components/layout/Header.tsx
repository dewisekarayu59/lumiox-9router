'use client'

import { useChatStore, useSettingsStore, useUIStore } from '@/lib/store'
import { useTranslation } from '@/lib/store/language'
import { PROVIDER_INFO, getModelsForProvider } from '@/lib/providers'
import type { AIModel } from '@/lib/types'
import { Menu, Moon, Sun, ChevronDown, RefreshCw, AlertCircle, User, Settings, LogOut, Sparkles, Download, Share2 } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export function Header() {
  const { t } = useTranslation()
  const { activeSessionId, sidebarOpen, setSidebarOpen, sessions, providerStatus } = useChatStore()
  const { defaultProvider, defaultModel, updateSettings } = useSettingsStore()
  const { theme, setTheme } = useUIStore()
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(defaultProvider)
  const [models, setModels] = useState<AIModel[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [modelError, setModelError] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleExportChat = () => {
    if (!session || session.messages.length === 0) return
    const text = session.messages
      .map(m => `**${m.role === 'user' ? 'You' : 'AI'}:** ${m.content}`)
      .join('\n\n')
    const header = `# ${session.title}\n\n`
    const fileContent = header + text
    const blob = new Blob([fileContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const filename = (session.title || 'chat-export')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '.md'
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    const { notifySuccess } = require('@/components/notification/Toast')
    notifySuccess(t('chatExported') || 'Chat exported successfully')
  }

  const handleShareSession = async () => {
    if (!session) return
    try {
      const res = await fetch(`/api/sessions/${session.id}/share`, { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (data.shareId) {
        const shareUrl = `${window.location.origin}/share/${data.shareId}`
        await navigator.clipboard.writeText(shareUrl)
        const { notifySuccess } = await import('@/components/notification/Toast')
        notifySuccess('Public link copied to clipboard!')
      }
    } catch (e) {
      console.error('Failed to share session:', e)
    }
  }

  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const parsed = JSON.parse(user)
        setUserName(parsed.name || '')
        setUserEmail(parsed.email || '')
      } catch {}
    }
  }, [])

  const session = sessions.find(s => s.id === activeSessionId)
  const activeProvider = session?.provider || defaultProvider
  const activeModel = session?.model || defaultModel
  const providerInfo = PROVIDER_INFO[activeProvider as keyof typeof PROVIDER_INFO]

  const loadModels = useCallback(async (providerId: string) => {
    setLoadingModels(true)
    setModelError('')
    try {
      const res = await fetch(`/api/models?provider=${providerId}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setModels(data)
    } catch {
      setModelError('Failed to load models')
      setModels(getModelsForProvider(providerId as any))
    } finally {
      setLoadingModels(false)
    }
  }, [])

  useEffect(() => {
    if (showModelDropdown) loadModels(selectedProvider)
  }, [showModelDropdown, selectedProvider, loadModels])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowModelDropdown(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelectModel = async (providerId: string, modelId: string) => {
    updateSettings({ defaultProvider: providerId, defaultModel: modelId })
    if (session) {
      try {
        await fetch(`/api/sessions/${session.id}`, {
          method: 'PUT', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: providerId, model: modelId }),
        })
        useChatStore.setState(state => ({
          sessions: state.sessions.map(s => s.id === session.id ? { ...s, provider: providerId, model: modelId } : s),
        }))
      } catch {}
    }
    setShowModelDropdown(false)
  }

  const allProviders = Object.entries(PROVIDER_INFO).filter(([_, info]) => info.enabled !== false)

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-lg flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] rounded-xl transition-colors">
            <Menu className="w-5 h-5 text-text-secondary" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-text-primary/80 truncate flex items-center gap-2">
            {!session && (
              <img src="/logo.png" alt="logo" className="w-5 h-5 object-contain" />
            )}
            {session?.title || 'lumiox'}
            {session && <Sparkles className="w-3 h-3 text-accent-500/60 hidden sm:inline" />}
          </h1>
          <p className="text-xs text-text-secondary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: providerInfo?.color || '#71717A' }} />
            {providerInfo?.name || activeProvider}
            <span className="text-text-secondary/30">·</span>
            <span className="text-text-secondary/80">{activeModel?.split('/').pop()?.replace(/-/g, ' ')}</span>
            {providerStatus[activeProvider] === false && (
              <span className="ml-1 px-1.5 py-0.5 bg-warning/10 text-warning text-[10px] font-medium rounded-md">{t('noKey')}</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Model Selector */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] rounded-xl text-sm font-medium text-text-primary transition-all">
            <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: providerInfo?.color || '#71717A' }} />
            <span className="hidden sm:inline text-[13px]">{activeModel?.split('/').pop()?.replace(/-/g, ' ') || 'Select Model'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-text-secondary/60" />
          </button>

          <AnimatePresence>
            {showModelDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="fixed left-4 right-4 top-[60px] sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-2 w-auto sm:w-[440px] max-w-[440px] bg-surface glass rounded-2xl shadow-soft-lg z-50 overflow-hidden">
                {/* Provider Tabs */}
                <div className="flex overflow-x-auto gap-0.5 p-2 border-b border-border scrollbar-none">
                  {allProviders.map(([key, info]) => (
                    <button key={key}
                      onClick={() => setSelectedProvider(key)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                        selectedProvider === key
                          ? 'bg-accent-500/10 text-accent-600 dark:text-accent-400 shadow-sm'
                          : 'text-text-secondary hover:text-text-primary hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                      } ${providerStatus[key] === false ? 'opacity-40' : ''}`}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: info.color }} />
                      {info.name}
                      {providerStatus[key] === false && <span className="text-[10px] text-text-secondary">⚠</span>}
                    </button>
                  ))}
                </div>

                {/* Model List */}
                <div className="max-h-72 overflow-y-auto p-1.5">
                  {loadingModels ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-text-secondary">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Loading models...
                    </div>
                  ) : modelError ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <AlertCircle className="w-5 h-5 text-error" />
                      <p className="text-sm text-text-secondary">{modelError}</p>
                      <button onClick={() => loadModels(selectedProvider)}
                        className="text-xs text-accent-500 hover:text-accent-600 font-medium flex items-center gap-1 transition-colors">
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    </div>
                  ) : models.length === 0 ? (
                    <p className="text-center text-sm text-text-secondary py-8">No models available</p>
                  ) : (
                    models.map(m => (
                      <button key={m.id}
                        onClick={() => handleSelectModel(selectedProvider, m.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                          activeModel === m.id && activeProvider === selectedProvider
                            ? 'bg-accent-500/10 text-accent-600 dark:text-accent-400 font-medium'
                            : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-text-secondary hover:text-text-primary'
                        }`}>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PROVIDER_INFO[selectedProvider as keyof typeof PROVIDER_INFO]?.color }} />
                          <span>{m.name}</span>
                        </div>
                        <span className="text-xs text-text-secondary/50">
                          {m.contextWindow >= 1000000 ? `${m.contextWindow / 1000000}M` : `${m.contextWindow / 1000}K`} ctx
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {session && session.messages.length > 0 && (
          <div className="flex items-center gap-1">
            <button onClick={handleShareSession}
              className="p-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] rounded-xl transition-colors text-text-secondary hover:text-text-primary"
              title="Get Public Link">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={handleExportChat}
              className="p-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] rounded-xl transition-colors text-text-secondary hover:text-text-primary"
              title="Export to Markdown">
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Theme Toggle */}
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] rounded-xl transition-colors">
          {theme === 'light' ? <Moon className="w-4 h-4 text-text-secondary" /> : <Sun className="w-4 h-4 text-text-secondary" />}
        </button>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white text-xs font-bold hover:shadow-md transition-all ml-1">
            {userName ? userName[0].toUpperCase() : 'U'}
          </button>
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-2 w-56 bg-surface glass rounded-2xl shadow-soft-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text-primary truncate">{userName || 'User'}</p>
                  <p className="text-xs text-text-secondary truncate mt-0.5">{userEmail}</p>
                </div>
                <div className="p-1.5">
                  <Link href="/profile" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-text-secondary hover:bg-black/[0.03] dark:hover:bg-white/[0.04] rounded-xl transition-colors">
                    <User className="w-4 h-4" /> {t('profile')}
                  </Link>
                  <Link href="/settings" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-text-secondary hover:bg-black/[0.03] dark:hover:bg-white/[0.04] rounded-xl transition-colors">
                    <Settings className="w-4 h-4" /> {t('settings')}
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                    } catch {}
                    localStorage.removeItem('user')
                    localStorage.removeItem('token')
                    window.location.href = '/login'
                  }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] text-error hover:bg-error/10 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" /> {t('logout')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
