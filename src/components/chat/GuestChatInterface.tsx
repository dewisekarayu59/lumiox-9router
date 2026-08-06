'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, LogIn } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { useRouter } from 'next/navigation'

interface GuestMessage {
  id: string
  role: string
  content: string
  createdAt: string
}

export function GuestChatInterface({ shareId }: { shareId: string }) {
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [messages, setMessages] = useState<GuestMessage[]>([])
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const MAX_MESSAGES = 3
  const isLimitReached = messages.filter(m => m.role === 'user').length >= MAX_MESSAGES

  useEffect(() => {
    // Load previously sent guest messages for this shareId from sessionStorage
    try {
      const stored = sessionStorage.getItem(`pending_guest_session_${shareId}`)
      if (stored) {
        setMessages(JSON.parse(stored))
      }
    } catch (e) {}
  }, [shareId])

  useEffect(() => {
    // Save to sessionStorage whenever messages change
    if (messages.length > 0) {
      sessionStorage.setItem(`pending_guest_session_${shareId}`, JSON.stringify(messages))
      // Also save a global flag so login/register knows there's a pending session
      sessionStorage.setItem('pending_guest_share_id', shareId)
    }
  }, [messages, shareId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async () => {
    if (!input.trim() || isGenerating || isLimitReached) return

    const userMessage: GuestMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString()
    }
    
    setInput('')
    setIsGenerating(true)
    setMessages(prev => [...prev, userMessage])

    const assistantMsgId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '', createdAt: new Date().toISOString() }])

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          provider: 'groq',
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          stream: true,
          options: { temperature: 0.7, topP: 1 }
        })
      })

      if (!res.ok) throw new Error('Stream failed')
      
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No reader')

      let fullContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                fullContent += data.content
                setMessages(prev => prev.map(m => 
                  m.id === assistantMsgId ? { ...m, content: fullContent } : m
                ))
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      console.error(error)
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId ? { ...m, content: 'Error generating response. Please try again.' } : m
      ))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full flex flex-col mt-4">
      <div className="space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message as any} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-8 border border-border bg-surface/50 rounded-2xl p-4 shadow-soft">
        {isLimitReached ? (
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Guest Limit Reached</h3>
            <p className="text-text-secondary mb-6 text-sm">You have reached the limit of {MAX_MESSAGES} messages for a guest session. Please log in to continue chatting and save this conversation.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => router.push('/login')} className="px-6 py-2.5 bg-accent-600 text-white rounded-xl font-medium hover:bg-accent-700 transition flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Log In
              </button>
              <button onClick={() => router.push('/register')} className="px-6 py-2.5 bg-surface border border-border text-text-primary rounded-xl font-medium hover:bg-black/5 transition">
                Create Account
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Continue this conversation as a guest..."
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 p-3 text-text-primary placeholder:text-text-secondary/50"
              rows={1}
              disabled={isGenerating}
            />
            <div className="flex justify-between items-center mt-2 px-2">
              <span className="text-xs text-text-secondary">
                {messages.filter(m => m.role === 'user').length} / {MAX_MESSAGES} messages used
              </span>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="w-10 h-10 rounded-xl bg-accent-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-600 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
