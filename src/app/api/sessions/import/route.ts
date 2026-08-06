import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

function getUser(request: Request) {
  const token = request.headers.get('cookie')?.match(/auth_token=([^;]+)/)?.[1]
  if (!token) return null
  const payload = verifyToken(token)
  return payload?.userId || null
}

export async function POST(request: Request) {
  try {
    const userId = getUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { shareId, guestMessages } = await request.json()
    if (!shareId || !guestMessages || !Array.isArray(guestMessages)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Find the original shared session
    const originalSession = await prisma.chatSession.findUnique({
      where: { shareId },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    })

    if (!originalSession || !originalSession.isPublic) {
      return NextResponse.json({ error: 'Shared session not found or not public' }, { status: 404 })
    }

    // Create a new session for the current user based on the shared session
    const newSession = await prisma.chatSession.create({
      data: {
        userId: userId,
        title: `${originalSession.title} (Continued)`,
        provider: originalSession.provider,
        model: originalSession.model,
      }
    })

    // Combine messages: Original messages + Guest messages
    // Remove IDs from both arrays as they will be recreated by Prisma
    const messagesToInsert = []

    for (const msg of originalSession.messages) {
      messagesToInsert.push({
        sessionId: newSession.id,
        role: msg.role,
        content: msg.content,
        provider: msg.provider,
        model: msg.model,
        tokenInput: msg.tokenInput,
        tokenOutput: msg.tokenOutput,
        createdAt: msg.createdAt,
      })
    }

    for (const msg of guestMessages) {
      messagesToInsert.push({
        sessionId: newSession.id,
        role: msg.role,
        content: msg.content,
        provider: originalSession.provider,
        model: originalSession.model,
        createdAt: new Date(msg.createdAt),
      })
    }

    // Insert all messages in bulk
    if (messagesToInsert.length > 0) {
      await prisma.chatMessage.createMany({
        data: messagesToInsert
      })
    }

    return NextResponse.json({ success: true, sessionId: newSession.id })

  } catch (error) {
    console.error('Error importing guest session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
