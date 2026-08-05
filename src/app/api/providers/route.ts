import { NextResponse } from 'next/server'
import { PROVIDER_INFO } from '@/lib/providers'

const providers = [
  { id: 'groq', key: process.env.GROQ_API_KEY },
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
