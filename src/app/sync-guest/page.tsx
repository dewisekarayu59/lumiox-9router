'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bot, Loader2 } from 'lucide-react'

export default function SyncGuestPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Syncing your conversation...')

  useEffect(() => {
    const syncSession = async () => {
      try {
        const shareId = sessionStorage.getItem('pending_guest_share_id')
        if (!shareId) {
          router.push('/chat')
          return
        }

        const guestMessagesStr = sessionStorage.getItem(`pending_guest_session_${shareId}`)
        let guestMessages = []
        if (guestMessagesStr) {
          try {
            guestMessages = JSON.parse(guestMessagesStr)
          } catch (e) {}
        }

        setStatus('Importing your messages...')

        const res = await fetch('/api/sessions/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shareId,
            guestMessages
          })
        })

        if (!res.ok) {
          throw new Error('Failed to import')
        }

        const data = await res.json()
        
        // Clean up session storage
        sessionStorage.removeItem('pending_guest_share_id')
        sessionStorage.removeItem(`pending_guest_session_${shareId}`)

        setStatus('Success! Redirecting...')
        
        // Let state store re-fetch on its own when chat loads
        setTimeout(() => {
          router.push(`/chat?id=${data.sessionId}`)
        }, 1000)

      } catch (err) {
        console.error('Error syncing guest session:', err)
        // Clean up on error too to prevent infinite loops
        sessionStorage.removeItem('pending_guest_share_id')
        router.push('/chat')
      }
    }

    syncSession()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-accent-500/20 blur-xl rounded-full animate-pulse" />
          <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/30 relative z-10">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-surface rounded-full flex items-center justify-center shadow-md">
            <Loader2 className="w-4 h-4 text-accent-500 animate-spin" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Setting up your account</h2>
          <p className="text-text-secondary">{status}</p>
        </div>
      </div>
    </div>
  )
}
