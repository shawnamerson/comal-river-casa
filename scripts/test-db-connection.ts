import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local file
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      process.env[key] = value
    }
  })
  console.log('✅ Loaded .env.local\n')
}

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  console.log('🔍 Testing Supabase database connection...\n')

  try {
    // Test 1: Basic connection
    console.log('Test 1: Testing basic connection...')
    await prisma.$connect()
    console.log('✅ Connected to database successfully!\n')

    // Test 2: Query the database
    console.log('Test 2: Running test query...')
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`
    console.log('✅ Query executed successfully!')
    console.log('Database info:', result)
    console.log()

    // Test 3: Check if tables exist
    console.log('Test 3: Checking if Prisma tables need to be created...')
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ User table exists with ${userCount} records`)
    } catch (error: any) {
      if (error.code === 'P2021') {
        console.log('⚠️  Tables do not exist yet. Run "npm run db:push" to create them.')
      } else {
        throw error
      }
    }

    console.log('\n🎉 All connection tests passed!')
    console.log('\nNext steps:')
    console.log('1. Run "npm run db:push" to create database tables')
    console.log('2. Run "npm run db:seed" to add sample data (optional)')
    console.log('3. Run "npm run dev" to start your development server')

  } catch (error) {
    console.error('❌ Connection test failed:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
