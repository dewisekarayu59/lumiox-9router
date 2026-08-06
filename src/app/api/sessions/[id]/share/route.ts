import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import * as jose from 'jose'

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
    const token = cookies().get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-123')
    const { payload } = await jose.jwtVerify(token, secret)
    const userId = payload.sub as string

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
