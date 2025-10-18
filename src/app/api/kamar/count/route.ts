import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const count = await db.kamar.count()
    return NextResponse.json(count)
  } catch (error) {
    console.error('Error counting kamar:', error)
    return NextResponse.json(0)
  }
}