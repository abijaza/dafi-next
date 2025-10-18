import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const count = await db.gedung.count()
    return NextResponse.json(count)
  } catch (error) {
    console.error('Error counting gedung:', error)
    return NextResponse.json(0)
  }
}