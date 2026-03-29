import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Upsert so duplicate emails don't error
    await prisma.emailLead.upsert({
      where: { email: email.toLowerCase().trim() },
      update: {},
      create: {
        email: email.toLowerCase().trim(),
        source: source || 'guidebook',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
