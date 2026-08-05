import { NextResponse } from 'next/server'
import { getModelsForProvider } from '@/lib/providers'
import type { AIModel } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const provider = url.searchParams.get('provider')

    if (!provider) {
      return NextResponse.json({ message: 'provider parameter required' }, { status: 400 })
    }

    const models = getModelsForProvider(provider as any)
    return NextResponse.json(models)
  } catch (error: any) {
    console.error("CRITICAL ERROR IN GET /api/models:", error)
    return NextResponse.json({ message: error?.message || String(error) }, { status: 500 })
  }
}
