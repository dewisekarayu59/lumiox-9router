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
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ultra Modern Background Element (Glowing Orb) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 dark:bg-accent/10 rounded-full blur-[100px] pointer-events-none opacity-60 mix-blend-screen" />
      
      <motion.div
        className="max-w-2xl w-full text-center relative z-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Holographic Logo Container */}
        <motion.div
          className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/30 to-accent-light/10 rounded-[2rem] rotate-3 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl" />
          <div className="absolute inset-0 bg-white/40 dark:bg-black/20 rounded-[2rem] -rotate-3 backdrop-blur-lg border border-white/30 dark:border-white/5" />
          <img src="/logo.png" alt="lumiox logo" className="relative w-20 h-20 object-contain drop-shadow-2xl z-10" />
        </motion.div>

        {/* Title & Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text-primary via-accent to-text-primary mb-2">
            lumiox
          </h1>
          <h2 className="text-2xl font-semibold text-text-primary/90 mb-2">
            {greeting}
          </h2>
          <p className="text-text-secondary/80 text-sm font-medium tracking-wide mb-10">
            {t('howCanIHelp')}
          </p>
        </motion.div>

        {/* Center input */}
        <motion.form 
          onSubmit={handleSubmit} 
          className="relative mb-12"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-accent-hover/10 to-accent/20 rounded-[3rem] blur-xl opacity-50 group-focus-within:opacity-100 transition-opacity duration-500" />
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('askAnything')}
            disabled={isCreating}
            className="relative w-full bg-surface/70 dark:bg-[#18181b]/70 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-[3rem] pl-7 pr-16 py-5 text-[15px] font-medium outline-none focus:border-accent/50 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:shadow-[0_8px_40px_rgb(242,72,130,0.15)] placeholder:text-text-secondary/50 disabled:opacity-50"
            style={{ height: '64px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isCreating}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-3.5 bg-gradient-to-br from-accent to-accent-hover text-white rounded-full hover:shadow-[0_0_20px_rgb(242,72,130,0.4)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
          >
            <Send className="w-4.5 h-4.5 ml-0.5" />
          </button>
        </motion.form>

        {/* Suggestion cards (Holographic) */}
        <div className="grid grid-cols-2 gap-4">
          {suggestions.map((s, i) => (
            <motion.button
              key={i}
              onClick={() => handleCreateAndSend(s.text)}
              disabled={isCreating}
              className="group relative p-6 text-left rounded-[2rem] transition-all duration-500 disabled:opacity-50 active:scale-[0.98] overflow-hidden"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
            >
              {/* Glass background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 transition-all duration-300 group-hover:bg-white/80 dark:group-hover:bg-white/15 group-hover:border-accent/40" />
              
              <div className="relative z-10 flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-accent/10 to-accent/5 rounded-[1.25rem] group-hover:from-accent group-hover:to-accent-hover group-hover:text-white text-accent shadow-sm transition-all duration-300">
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-text-primary group-hover:text-accent transition-colors">{s.text}</h3>
                  <p className="text-[13px] text-text-secondary/80 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
