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
    const user = verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const gedung = await db.gedung.findMany({
      include: {
        kamar: {
          include: {
            _count: {
              select: {
                santriHistories: {
                  where: {
                    periode: {
                      isActive: true
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(gedung)
  } catch (error) {
    console.error('Error fetching gedung:', error)
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

    const { nama, deskripsi } = await request.json()

    // Validate input
    if (!nama) {
      return NextResponse.json(
        { message: 'Nama gedung harus diisi' },
        { status: 400 }
      )
    }

    // Check if gedung already exists
    const existingGedung = await db.gedung.findUnique({
      where: { nama }
    })

    if (existingGedung) {
      return NextResponse.json(
        { message: 'Gedung dengan nama ini sudah ada' },
        { status: 400 }
      )
    }

    // Create gedung
    const gedung = await db.gedung.create({
      data: {
        nama,
        deskripsi
      },
      include: {
        kamar: true
      }
    })

    return NextResponse.json({
      message: 'Gedung berhasil dibuat',
      gedung
    })

  } catch (error) {
    console.error('Error creating gedung:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}