import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

function getUser(request: Request) {
  const token = request.headers.get('cookie')?.match(/auth_token=([^;]+)/)?.[1]
  if (!token) return null
  const payload = verifyToken(token)
  return payload?.userId || null
}

function generateShareId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUser(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await prisma.chatSession.findUnique({
      where: { id: params.id }
    })

    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    if (session.isPublic && session.shareId) {
      // Already shared, return existing
      return NextResponse.json({ shareId: session.shareId })
    }

    const shareId = generateShareId()
    await prisma.chatSession.update({
      where: { id: params.id },
      data: { isPublic: true, shareId }
    })

    return NextResponse.json({ shareId })
  } catch (error) {
    console.error('Share error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
