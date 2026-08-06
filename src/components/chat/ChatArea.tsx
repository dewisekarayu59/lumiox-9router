'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { useChatStore } from '@/lib/store'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { AIThinkingIndicator } from './AIThinkingIndicator'
import { EmptyState } from './EmptyState'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Brain, Zap, Globe, Sparkles, Share2, X, Code2 } from 'lucide-react'
import { notifySuccess } from '@/components/notification/Toast'
import { ArtifactRenderer } from './ArtifactRenderer'

export function ChatArea() {
  const { activeSessionId, sessions, activeArtifact, setActiveArtifact } = useChatStore()
  const session = sessions.find(s => s.id === activeSessionId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initial fetch when session is selected if empty
    if (activeSessionId && session && (!session.messages || session.messages.length === 0)) {
      useChatStore.getState().fetchMessages(activeSessionId)
    }
  }, [activeSessionId, session])

  const prevMessagesLengthRef = useRef(session?.messages.length || 0)
  const lastMessageContentRef = useRef(session?.messages[session.messages.length - 1]?.content || '')

  useEffect(() => {
    const currentLength = session?.messages.length || 0
    if (currentLength > prevMessagesLengthRef.current) {
      // Only scroll to bottom if we are not loading older messages 
      if (!isLoadingMore) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
    prevMessagesLengthRef.current = currentLength
  }, [session?.messages.length, isLoadingMore])

  // Auto-scroll when the last message is streaming (content changes)
  useEffect(() => {
    const currentLastContent = session?.messages[session.messages.length - 1]?.content || ''
    if (currentLastContent !== lastMessageContentRef.current) {
      lastMessageContentRef.current = currentLastContent
      
      // Check if user is near the bottom (within 150px)
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150
        if (isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }) // Use auto for streaming to prevent jitter
        }
      }
    }
  }, [session?.messages])

  const handleScroll = useCallback(async () => {
    if (!scrollRef.current || !session || isLoadingMore) return
    if (scrollRef.current.scrollTop <= 50) { // Near top
      const oldestMsg = session.messages[0]
      if (oldestMsg) {
        setIsLoadingMore(true)
        const previousScrollHeight = scrollRef.current.scrollHeight
        await useChatStore.getState().fetchMessages(session.id, oldestMsg.id)
        
        // Restore scroll position to avoid jump
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            const newScrollHeight = scrollRef.current.scrollHeight
            scrollRef.current.scrollTop = newScrollHeight - previousScrollHeight
          }
          setIsLoadingMore(false)
        })
      }
    }
  }, [session, isLoadingMore])

  const handleRetry = useCallback(() => {
    if (!session) return
    const msgs = session.messages
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        const userContent = msgs[i].content
        useChatStore.setState(state => ({
          sessions: state.sessions.map(s =>
            s.id === activeSessionId
              ? { ...s, messages: s.messages.slice(0, -1) }
              : s
          ),
        }))
        window.dispatchEvent(new CustomEvent('chat-retry', { detail: { text: userContent } }))
        break
      }
    }
  }, [session, activeSessionId])

  const handleRegenerate = useCallback(() => {
    if (!session) return
    const msgs = session.messages
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'assistant') {
        useChatStore.setState(state => ({
          sessions: state.sessions.map(s =>
            s.id === activeSessionId
              ? { ...s, messages: s.messages.slice(0, i) }
              : s
          ),
        }))
        for (let j = i - 1; j >= 0; j--) {
          if (msgs[j].role === 'user') {
            window.dispatchEvent(new CustomEvent('chat-retry', { detail: { text: msgs[j].content } }))
            break
          }
        }
        break
      }
    }
  }, [session, activeSessionId])

  const handleEditMessage = useCallback((msgIndex: number, newContent: string) => {
    if (!session) return
    const msgs = session.messages
    // Remove all messages after the edited one, then update the edited message
    const updatedMessages = msgs.slice(0, msgIndex)
    updatedMessages[msgIndex] = { ...updatedMessages[msgIndex], content: newContent }
    useChatStore.setState(state => ({
      sessions: state.sessions.map(s =>
        s.id === activeSessionId
          ? { ...s, messages: updatedMessages }
          : s
      ),
    }))
    // Re-send the edited message
    window.dispatchEvent(new CustomEvent('chat-retry', { detail: { text: newContent } }))
  }, [session, activeSessionId])

  const handleShareChat = useCallback(() => {
    if (!session) return
    const text = session.messages
      .map(m => `**${m.role === 'user' ? 'You' : 'AI'}:** ${m.content}`)
      .join('\n\n')
    const header = `# ${session.title}\n\n`
    navigator.clipboard.writeText(header + text)
    notifySuccess('Chat copied to clipboard')
  }, [session])

  if (!activeSessionId || !session) return <EmptyState />

  const lastMsg = session.messages[session.messages.length - 1]
  const showThinking = lastMsg?.role === 'user' || (lastMsg?.role === 'assistant' && lastMsg.content === '' && session.messages.length > 0)
  const isEmpty = session.messages.length === 0

  const suggestions = [
    { text: 'Explain AI concepts', icon: Brain },
    { text: 'Write React code', icon: Zap },
    { text: 'Summarize a document', icon: Sparkles },
    { text: 'Create a learning roadmap', icon: Globe },
  ]

  return (
    <div className="flex-1 flex flex-row h-full overflow-hidden w-full relative">
      {/* Main Chat Area */}
      <div className={`flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out ${activeArtifact ? 'w-full md:w-1/2 border-r border-border hidden md:flex' : 'w-full'}`}>
        <div className="flex-1 overflow-y-auto" ref={scrollRef} onScroll={handleScroll}>
          {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg w-full text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-accent-600 flex items-center justify-center shadow-soft-md">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-1.5">AI Chat</h2>
              <p className="text-sm text-text-secondary mb-6">How can I help you today?</p>
              <div className="grid grid-cols-2 gap-2.5">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('chat-suggestion', { detail: { text: s.text } }))
                    }}
                    className="p-3.5 bg-surface border border-border rounded-xl text-left hover:border-accent-300 dark:hover:border-accent-700 hover:shadow-soft transition-all duration-150 group"
                  >
                    <s.icon className="w-4 h-4 text-accent-500 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="text-[13px] font-medium text-text-primary">{s.text}</h3>
                  </motion.button>
                ))}
              </div>
              {/* Share button */}
              {session && session.messages.length > 0 && (
                <button onClick={handleShareChat}
                  className="mt-4 mx-auto flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded-xl transition-colors">
                  <Share2 className="w-4 h-4" /> Share this chat
                </button>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="pl-4 pr-4 md:pr-24 py-6 space-y-4">
            {session.messages.map((message, idx) => (
              <MessageBubble
                key={message.id}
                message={message}
                onRetry={
                  message.role === 'assistant' && message.content.startsWith('Error:')
                    ? handleRetry
                    : message.role === 'assistant' && idx === session.messages.length - 1
                      ? handleRegenerate
                      : undefined
                }
                onEdit={
                  message.role === 'user'
                    ? (newContent: string) => handleEditMessage(idx, newContent)
                    : undefined
                }
                onDelete={() => {
                  useChatStore.getState().deleteMessage(session.id, message.id)
                }}
              />
            ))}
            {showThinking && <AIThinkingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
        </div>
        <ChatInput sessionId={session.id} />
      </div>

      {/* Split Screen Canvas for Artifact */}
      <AnimatePresence>
        {activeArtifact && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '50%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="hidden md:flex flex-col h-full bg-surface border-l border-border relative z-10"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-black/5 dark:bg-white/5">
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Code2 className="w-4 h-4 text-accent-500" /> Live Canvas
              </div>
              <button 
                onClick={() => setActiveArtifact(null)}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <ArtifactRenderer code={activeArtifact} language="html" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile overlay for artifact */}
      <AnimatePresence>
        {activeArtifact && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: 'spring', damping: 25 }}
            className="md:hidden fixed inset-0 z-50 bg-surface flex flex-col pt-14"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-black/5 dark:bg-white/5">
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Code2 className="w-4 h-4 text-accent-500" /> Live Canvas
              </div>
              <button 
                onClick={() => setActiveArtifact(null)}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <ArtifactRenderer code={activeArtifact} language="html" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
