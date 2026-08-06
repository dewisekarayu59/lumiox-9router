'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useChatStore, useSettingsStore } from '@/lib/store'
import { useTranslation } from '@/lib/store/language'
import { MessageSquare, Brain, Zap, Globe, Sparkles, Send, Code, BookOpen, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'

export function EmptyState() {
  const { t } = useTranslation()
  const { createSession, providerStatus } = useChatStore()
  const { defaultProvider, defaultModel } = useSettingsStore()
  const router = useRouter()
  const [input, setInput] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return t('goodMorning')
    if (hour < 18) return t('goodAfternoon')
    return t('goodEvening')
  }, [t])

  const suggestions = [
    { text: t('explainConcept'), icon: Brain, desc: t('explainConceptDesc') },
    { text: t('writeSomeCode'), icon: Code, desc: t('writeSomeCodeDesc') },
    { text: t('summarizeDocument'), icon: BookOpen, desc: t('summarizeDocumentDesc') },
    { text: t('brainstormIdeas'), icon: Lightbulb, desc: t('brainstormIdeasDesc') },
  ]

  const handleCreateAndSend = async (message?: string) => {
    if (isCreating) return
    setIsCreating(true)
    try {
      if (message) {
        sessionStorage.setItem('pending-message', message)
      }
      let provider = defaultProvider
      let model = defaultModel
      if (!providerStatus[provider]) {
        const enabled = Object.entries(providerStatus).filter(([_, v]) => v)
        provider = enabled.length > 0 ? enabled[0][0] : defaultProvider
        const { getModelsForProvider } = await import('@/lib/providers')
        const models = getModelsForProvider(provider as any)
        model = models[0]?.id || defaultModel
      }
      const sessionId = await createSession(provider, model)
      if (sessionId) {
        router.push('/chat')
      }
    } catch (error) {
      console.error('Failed to create chat:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      handleCreateAndSend(input.trim())
      setInput('')
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <motion.div
        className="max-w-xl w-full text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div
          className="w-24 h-24 mx-auto mb-2 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <img src="/logo.png" alt="lumiox logo" className="w-full h-full object-contain" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl font-bold tracking-tight text-text-primary/70 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          lumiox
        </motion.h1>

        {/* Greeting */}
        <h2 className="text-2xl font-semibold text-text-primary mb-1.5">
          {greeting}!
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          {t('howCanIHelp')}
        </p>

        {/* Center input */}
        <form onSubmit={handleSubmit} className="relative mb-10">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('askAnything')}
            disabled={isCreating}
            className="w-full bg-surface/80 dark:bg-[#18181b]/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2.5rem] pl-6 pr-16 py-4.5 text-[15px] font-medium outline-none focus:border-accent/40 transition-all duration-300 shadow-lg focus:shadow-2xl placeholder:text-text-secondary/40 disabled:opacity-50"
            style={{ height: '56px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isCreating}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-accent text-white rounded-full hover:bg-accent-hover transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 shadow-md hover:shadow-lg"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>

        {/* Suggestion cards */}
        <div className="grid grid-cols-2 gap-4">
          {suggestions.map((s, i) => (
            <motion.button
              key={i}
              onClick={() => handleCreateAndSend(s.text)}
              disabled={isCreating}
              className="group p-5 bg-surface/50 border border-border/50 rounded-3xl text-left hover:bg-surface hover:border-accent/30 hover:shadow-soft transition-all duration-300 disabled:opacity-50 active:scale-[0.98]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
            >
              <div className="p-2.5 w-10 h-10 flex items-center justify-center bg-accent/10 rounded-2xl group-hover:bg-accent group-hover:text-white text-accent transition-colors mb-3">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">{s.text}</h3>
              <p className="text-xs text-text-secondary mt-1">{s.desc}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
