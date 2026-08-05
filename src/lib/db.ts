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
    // On Vercel, use the Neon serverless WebSocket pooler
    // This avoids TCP connection timeouts to port 5432 which can happen on Vercel Node.js functions
    if (!globalForPrisma.prisma) {
      const pool = new Pool({ connectionString: url })
      const adapter = new PrismaNeon(pool)
      globalForPrisma.prisma = new PrismaClient({ adapter })
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
