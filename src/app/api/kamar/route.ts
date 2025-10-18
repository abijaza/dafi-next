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
    const { searchParams } = new URL(request.url)
    const gedungId = searchParams.get('gedungId')

    let whereClause = {}
    if (gedungId) {
      whereClause = { gedungId }
    }

    const kamar = await db.kamar.findMany({
      where: whereClause,
      include: {
        gedung: true,
        _count: {
          select: {
            santri: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(kamar)
  } catch (error) {
    console.error('Error fetching kamar:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user || (user.role !== 'ADMIN' && user.role !== 'KEPALA_KEPENGASUHAN')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { gedungId, nama, kapasitas, deskripsi } = await request.json()

    // Validate input
    if (!gedungId || !nama || !kapasitas) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Check if gedung exists
    const gedung = await db.gedung.findUnique({
      where: { id: gedungId }
    })

    if (!gedung) {
      return NextResponse.json(
        { message: 'Gedung tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if kamar already exists in this gedung
    const existingKamar = await db.kamar.findFirst({
      where: {
        gedungId,
        nama
      }
    })

    if (existingKamar) {
      return NextResponse.json(
        { message: 'Kamar dengan nama ini sudah ada di gedung ini' },
        { status: 400 }
      )
    }

    // Create kamar
    const kamar = await db.kamar.create({
      data: {
        gedungId,
        nama,
        kapasitas,
        deskripsi
      },
      include: {
        gedung: true
      }
    })

    return NextResponse.json({
      message: 'Kamar berhasil dibuat',
      kamar
    })

  } catch (error) {
    console.error('Error creating kamar:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}