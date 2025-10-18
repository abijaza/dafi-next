import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const periode = await db.periode.findFirst({
      where: {
        isActive: true
      }
    })
    
    return NextResponse.json(periode)
  } catch (error) {
    console.error('Error fetching active periode:', error)
    return NextResponse.json(null)
  }
}