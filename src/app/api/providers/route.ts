import { NextResponse } from 'next/server'
import { PROVIDER_INFO } from '@/lib/providers'

const providers = [
  { id: 'gemini', key: process.env.GEMINI_API_KEY },
  { id: 'groq', key: process.env.GROQ_API_KEY },
  { id: 'openrouter', key: process.env.OPENROUTER_API_KEY },
]

export async function GET() {
  const result = providers
    .filter(p => PROVIDER_INFO[p.id as keyof typeof PROVIDER_INFO]?.enabled !== false)
    .map(p => ({
      id: p.id,
      configured: !!p.key, 
    }))
  return NextResponse.json(result)
}
