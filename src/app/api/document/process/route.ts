import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

function getUser(request: Request) {
  const token = request.headers.get('cookie')?.match(/auth_token=([^;]+)/)?.[1]
  if (!token) return null
  const payload = verifyToken(token)
  return payload?.userId || null
}

function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = []
  let i = 0
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize))
    i += chunkSize - overlap
  }
  return chunks
}

export async function POST(request: Request) {
  try {
    const userId = getUser(request)
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { text, sessionId } = await request.json()
    if (!text || !sessionId) {
      return NextResponse.json({ message: 'Missing text or sessionId' }, { status: 400 })
    }

    // Verify session belongs to user
    const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } })
    if (!session) return NextResponse.json({ message: 'Session not found' }, { status: 404 })

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) return NextResponse.json({ message: 'GOOGLE_API_KEY not configured' }, { status: 500 })

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })

    const chunks = chunkText(text)
    let processedCount = 0

    // Process in batches of 5 to avoid rate limits
    for (let i = 0; i < chunks.length; i += 5) {
      const batch = chunks.slice(i, i + 5)
      
      await Promise.all(batch.map(async (chunkContent) => {
        try {
          const result = await model.embedContent(chunkContent)
          const embedding = result.embedding.values

          // Save to pgvector via raw query because Prisma preview feature handles insertion
          // However, Prisma doesn't natively support creating vectors via Prisma Client yet
          // So we use $executeRaw
          const vectorStr = `[${embedding.join(',')}]`
          await prisma.$executeRaw`
            INSERT INTO document_chunks (id, session_id, content, embedding, created_at)
            VALUES (gen_random_uuid(), ${sessionId}, ${chunkContent}, ${vectorStr}::vector, NOW())
          `
          processedCount++
        } catch (e) {
          console.error('Failed to embed chunk:', e)
        }
      }))
    }

    return NextResponse.json({ message: 'Processed', chunks: processedCount })
  } catch (error: any) {
    console.error('Document processing error:', error)
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
