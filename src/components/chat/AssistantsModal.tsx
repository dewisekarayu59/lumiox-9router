'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Bot, Trash2 } from 'lucide-react'
import { useChatStore, Assistant } from '@/lib/store'

interface AssistantsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AssistantsModal({ isOpen, onClose }: AssistantsModalProps) {
  const { assistants, setAssistants, selectedAssistantId, setSelectedAssistantId } = useChatStore()
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchAssistants()
    }
  }, [isOpen])

  const fetchAssistants = async () => {
    try {
      const res = await fetch('/api/assistants')
      if (res.ok) {
        const data = await res.json()
        setAssistants(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreate = async () => {
    if (!name || !systemPrompt) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, systemPrompt })
      })
      if (res.ok) {
        const newAsst = await res.json()
        setAssistants([newAsst, ...assistants])
        setIsCreating(false)
        setName('')
        setSystemPrompt('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/assistants/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAssistants(assistants.filter(a => a.id !== id))
        if (selectedAssistantId === id) setSelectedAssistantId(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-text-primary">
                <Bot className="w-5 h-5" /> AI Personas
              </h2>
              <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {isCreating ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Expert Coder" 
                      className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">System Prompt</label>
                    <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={4} placeholder="You are an expert coder..." 
                      className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-500 resize-none" />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary">Cancel</button>
                    <button onClick={handleCreate} disabled={isLoading || !name || !systemPrompt} 
                      className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50">
                      {isLoading ? 'Saving...' : 'Save Persona'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div onClick={() => setSelectedAssistantId(null)} 
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${!selectedAssistantId ? 'border-accent-500 bg-accent-500/10' : 'border-border hover:bg-black/5 dark:hover:bg-white/5'}`}>
                    <div className="font-medium text-text-primary">Default Assistant</div>
                    <div className="text-xs text-text-secondary mt-1 line-clamp-1">Uses your global system prompt settings.</div>
                  </div>
                  
                  {assistants.map(asst => (
                    <div key={asst.id} onClick={() => setSelectedAssistantId(asst.id)} 
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between group ${selectedAssistantId === asst.id ? 'border-accent-500 bg-accent-500/10' : 'border-border hover:bg-black/5 dark:hover:bg-white/5'}`}>
                      <div>
                        <div className="font-medium text-text-primary flex items-center gap-1.5"><Bot className="w-4 h-4" /> {asst.name}</div>
                        <div className="text-xs text-text-secondary mt-1 line-clamp-2">{asst.systemPrompt}</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(asst.id) }} 
                        className="p-1.5 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button onClick={() => setIsCreating(true)} className="w-full p-4 border border-dashed border-border rounded-xl text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                    <Plus className="w-4 h-4" /> Create New Persona
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
