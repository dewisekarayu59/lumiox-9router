import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import * as jose from 'jose'

async function getUserId() {
  const token = cookies().get('token')?.value
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-123')
    const { payload } = await jose.jwtVerify(token, secret)
    return payload.sub as string
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const assistants = await prisma.assistant.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(assistants)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, description, systemPrompt, icon } = body

    if (!name || !systemPrompt) {
      return NextResponse.json({ error: 'Name and System Prompt are required' }, { status: 400 })
    }

    const assistant = await prisma.assistant.create({
      data: {
        userId,
        name,
        description,
        systemPrompt,
        icon: icon || 'Bot'
      }
    })

    return NextResponse.json(assistant)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
