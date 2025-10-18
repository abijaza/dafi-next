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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kamarPeriode = await db.kamarPeriode.findUnique({
      where: {
        id: params.id
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

    if (!kamarPeriode) {
      return NextResponse.json(
        { message: 'Kamar periode tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(kamarPeriode)
  } catch (error) {
    console.error('Error fetching kamar periode:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { kamarId, waliKamarId } = await request.json()

    // Validate input
    if (!kamarId) {
      return NextResponse.json(
        { message: 'Kamar harus diisi' },
        { status: 400 }
      )
    }

    // Check if kamar periode exists
    const existingKamarPeriode = await db.kamarPeriode.findUnique({
      where: {
        id: params.id
      }
    })

    if (!existingKamarPeriode) {
      return NextResponse.json(
        { message: 'Kamar periode tidak ditemukan' },
        { status: 404 }
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

    // Update kamar periode with gedungId from kamar
    const kamarPeriode = await db.kamarPeriode.update({
      where: {
        id: params.id
      },
      data: {
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
      message: 'Kamar periode berhasil diperbarui',
      kamarPeriode
    })

  } catch (error) {
    console.error('Error updating kamar periode:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if kamar periode exists
    const existingKamarPeriode = await db.kamarPeriode.findUnique({
      where: {
        id: params.id
      }
    })

    if (!existingKamarPeriode) {
      return NextResponse.json(
        { message: 'Kamar periode tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete kamar periode
    await db.kamarPeriode.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({
      message: 'Kamar periode berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting kamar periode:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}