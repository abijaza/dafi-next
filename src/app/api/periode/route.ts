import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Middleware to verify token and admin role
function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const periodes = await db.periode.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(periodes)
  } catch (error) {
    console.error('Error fetching periodes:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { tahunAjaran, semester, midSemester } = await request.json()

    // Validate input
    if (!tahunAjaran || !semester || !midSemester) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Check if periode already exists
    const existingPeriode = await db.periode.findFirst({
      where: {
        tahunAjaran,
        semester,
        midSemester
      }
    })

    if (existingPeriode) {
      return NextResponse.json(
        { message: 'Periode sudah ada' },
        { status: 400 }
      )
    }

    // Create periode
    const periode = await db.periode.create({
      data: {
        tahunAjaran,
        semester,
        midSemester,
        isActive: false
      }
    })

    return NextResponse.json({
      message: 'Periode berhasil dibuat',
      periode
    })

  } catch (error) {
    console.error('Error creating periode:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}