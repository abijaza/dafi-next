import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const count = await db.santri.count({
      where: {
        status: 'AKTIF'
      }
    })
    
    return NextResponse.json(count)
  } catch (error) {
    console.error('Error counting santri:', error)
    return NextResponse.json(0)
  }
}