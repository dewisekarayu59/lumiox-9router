import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { Bot } from 'lucide-react'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export default async function SharedChatPage({ params }: { params: { id: string } }) {
  const session = await prisma.chatSession.findUnique({
    where: { shareId: params.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  })

  if (!session || !session.isPublic) {
    notFound()
  }

  // Check if current user is the owner
  const token = cookies().get('auth_token')?.value
  let isOwner = false
  if (token) {
    try {
      const payload = verifyToken(token)
      if (payload?.userId === session.userId) {
        isOwner = true
      }
    } catch (e) {
      // Ignore token verification errors
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center py-10 px-4">
      <div className="max-w-3xl w-full">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg shadow-accent-500/20 mb-4">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{session.title}</h1>
          <p className="text-text-secondary text-sm">
            Shared from Lumiox • {new Date(session.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {session.messages.map((message) => (
            <MessageBubble key={message.id} message={message as any} />
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center">
          {isOwner ? (
            <p className="text-text-secondary text-sm">
              This is your shared chat. <a href={`/chat?id=${session.id}`} className="text-accent-500 hover:underline font-medium">Return to chat</a>.
            </p>
          ) : (
            <p className="text-text-secondary text-sm">
              Want to start your own AI conversation? <a href="/" className="text-accent-500 hover:underline font-medium">Try Lumiox for free</a>.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
