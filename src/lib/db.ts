import {PrismaClient} from "@prisma/client"
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Next.js hot reload creates multiple Prisma instances
// PostgreSQL crashes after ~10 connections
// This stores Prisma in global memory
// Without this → ❌ DB connection overflow
const globalForPrisma = global as unknown as { prisma: PrismaClient }


// connectiion pooling is connecting a single connection for multiple request we don't need to connect connection again & again.
const connectionString = process.env.DATABASE_URL!

// Use a global variable to prevent multiple instances in development

export const prisma = globalForPrisma.prisma || (() => {
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  
  return new PrismaClient({ 
    adapter,
    log: ['query', 'error', 'warn'] 
  })
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma