import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Set the WebSocket constructor for the Neon serverless driver
neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = (() => {
  let url = process.env.DATABASE_URL || ''
  
  // Clean up accidental quotes from copy-pasting into Vercel
  url = url.replace(/^"|'/, '').replace(/"|'$/, '')

  if (process.env.NODE_ENV === 'production' && url) {
    // On Vercel, use standard Prisma Client but ensure pgbouncer is enabled for pooled connections
    if (url.includes('pooler') && !url.includes('pgbouncer=true')) {
      url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true'
    }
    
    // We avoid PrismaNeon here because standard Prisma with pgbouncer is often more stable 
    // against connection parsing quirks in Vercel Node.js Serverless.
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({ datasources: { db: { url } } })
    }
    return globalForPrisma.prisma
  } else {
    // Local
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({ datasources: { db: { url } } })
    }
    return globalForPrisma.prisma
  }
})()
