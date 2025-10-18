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
    const user = verifyAuth(request)
    if (!user || (user.role !== 'ADMIN' && user.role !== 'KEPALA_KEPENGASUHAN')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const kamar = await db.kamar.findUnique({
      where: { id: params.id },
      include: {
        gedung: true,
        _count: {
          select: {
            santri: true
          }
        }
      }
    })

    if (!kamar) {
      return NextResponse.json(
        { message: 'Kamar tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(kamar)
  } catch (error) {
    console.error('Error fetching kamar:', error)
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
    if (!user || (user.role !== 'ADMIN' && user.role !== 'KEPALA_KEPENGASUHAN')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { nama, kapasitas, deskripsi, gedungId } = await request.json()

    // Check if kamar exists
    const existingKamar = await db.kamar.findUnique({
      where: { id: params.id }
    })

    if (!existingKamar) {
      return NextResponse.json(
        { message: 'Kamar tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validate input
    if (!nama || !kapasitas || !gedungId) {
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

    // Check if kamar name already exists in this gedung (excluding current kamar)
    const duplicateKamar = await db.kamar.findFirst({
      where: {
        gedungId,
        nama,
        id: { not: params.id }
      }
    })

    if (duplicateKamar) {
      return NextResponse.json(
        { message: 'Kamar dengan nama ini sudah ada di gedung ini' },
        { status: 400 }
      )
    }

    // Update kamar
    const updatedKamar = await db.kamar.update({
      where: { id: params.id },
      data: {
        nama,
        kapasitas,
        deskripsi,
        gedungId
      },
      include: {
        gedung: true,
        _count: {
          select: {
            santri: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Kamar berhasil diperbarui',
      kamar: updatedKamar
    })

  } catch (error) {
    console.error('Error updating kamar:', error)
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
    if (!user || (user.role !== 'ADMIN' && user.role !== 'KEPALA_KEPENGASUHAN')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if kamar exists
    const existingKamar = await db.kamar.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            santri: true
          }
        }
      }
    })

    if (!existingKamar) {
      return NextResponse.json(
        { message: 'Kamar tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if kamar has santri
    if (existingKamar._count.santri > 0) {
      return NextResponse.json(
        { message: 'Tidak dapat menghapus kamar yang masih memiliki santri' },
        { status: 400 }
      )
    }

    // Delete kamar
    await db.kamar.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Kamar berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting kamar:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}