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

    let santriKamar
    
    if (periodeId) {
      santriKamar = await db.santriKamar.findMany({
        where: {
          kamarPeriode: {
            periodeId
          }
        },
        include: {
          santri: true,
          kamarPeriode: {
            include: {
              kamar: true,
              gedung: true,
              waliKamar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      santriKamar = await db.santriKamar.findMany({
        include: {
          santri: true,
          kamarPeriode: {
            include: {
              kamar: true,
              gedung: true,
              waliKamar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }
    
    return NextResponse.json(santriKamar)
  } catch (error) {
    console.error('Error fetching santri kamar:', error)
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

    const { santriId, kamarPeriodeId } = await request.json()

    // Validate input
    if (!santriId || !kamarPeriodeId) {
      return NextResponse.json(
        { message: 'Santri dan kamar periode harus diisi' },
        { status: 400 }
      )
    }

    // Check if santri kamar already exists
    const existingSantriKamar = await db.santriKamar.findFirst({
      where: {
        santriId,
        kamarPeriodeId
      }
    })

    if (existingSantriKamar) {
      return NextResponse.json(
        { message: 'Santri sudah ada di kamar ini' },
        { status: 400 }
      )
    }

    // Get kamar periode to check capacity
    const kamarPeriode = await db.kamarPeriode.findUnique({
      where: { id: kamarPeriodeId },
      include: { 
        kamar: true,
        periode: true
      }
    })

    if (!kamarPeriode) {
      return NextResponse.json(
        { message: 'Kamar periode tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if santri is already in any room for the same periode
    const existingSantriInPeriode = await db.santriKamar.findFirst({
      where: {
        santriId,
        kamarPeriode: {
          periodeId: kamarPeriode.periodeId
        }
      }
    })

    if (existingSantriInPeriode) {
      return NextResponse.json(
        { message: 'Santri sudah ada di kamar lain untuk periode ini' },
        { status: 400 }
      )
    }

    // Check room capacity
    const currentOccupants = await db.santriKamar.count({
      where: {
        kamarPeriodeId
      }
    })

    if (currentOccupants >= kamarPeriode.kamar.kapasitas) {
      return NextResponse.json(
        { message: 'Kamar sudah penuh' },
        { status: 400 }
      )
    }

    // Create santri kamar
    const santriKamar = await db.santriKamar.create({
      data: {
        santriId,
        kamarPeriodeId
      },
      include: {
        santri: true,
        kamarPeriode: {
          include: {
            kamar: true,
            gedung: true,
            waliKamar: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Santri berhasil ditambahkan ke kamar',
      santriKamar
    })

  } catch (error) {
    console.error('Error creating santri kamar:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}