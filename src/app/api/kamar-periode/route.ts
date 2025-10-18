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
    const periodeId = searchParams.get('periodeId')

    let kamarPeriodes
    
    if (periodeId) {
      kamarPeriodes = await db.kamarPeriode.findMany({
        where: {
          periodeId
        },
        include: {
          periode: true,
          kamar: {
            include: {
              gedung: true
            }
          },
          gedung: true,
          waliKamar: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      kamarPeriodes = await db.kamarPeriode.findMany({
        include: {
          periode: true,
          kamar: {
            include: {
              gedung: true
            }
          },
          gedung: true,
          waliKamar: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }
    
    return NextResponse.json(kamarPeriodes)
  } catch (error) {
    console.error('Error fetching kamar periodes:', error)
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

    const { periodeId, kamarId, waliKamarId } = await request.json()

    // Validate input
    if (!periodeId || !kamarId) {
      return NextResponse.json(
        { message: 'Periode dan kamar harus diisi' },
        { status: 400 }
      )
    }

    // Check if kamar periode already exists
    const existingKamarPeriode = await db.kamarPeriode.findFirst({
      where: {
        periodeId,
        kamarId
      }
    })

    if (existingKamarPeriode) {
      return NextResponse.json(
        { message: 'Kamar periode sudah ada' },
        { status: 400 }
      )
    }

    // Get kamar data to get gedung info
    const kamar = await db.kamar.findUnique({
      where: { id: kamarId },
      include: { gedung: true }
    })

    if (!kamar) {
      return NextResponse.json(
        { message: 'Kamar tidak ditemukan' },
        { status: 404 }
      )
    }

    // Create kamar periode with gedungId from kamar
    const kamarPeriode = await db.kamarPeriode.create({
      data: {
        periodeId,
        kamarId,
        gedungId: kamar.gedungId, // Get gedungId from kamar
        waliKamarId
      },
      include: {
        periode: true,
        kamar: {
          include: {
            gedung: true
          }
        },
        gedung: true,
        waliKamar: true
      }
    })

    return NextResponse.json({
      message: 'Kamar periode berhasil dibuat',
      kamarPeriode
    })

  } catch (error) {
    console.error('Error creating kamar periode:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}