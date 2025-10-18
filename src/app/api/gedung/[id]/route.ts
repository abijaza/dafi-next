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
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const gedung = await db.gedung.findUnique({
      where: { id: params.id },
      include: {
        kamar: {
          include: {
            _count: {
              select: {
                santri: true
              }
            }
          }
        }
      }
    })

    if (!gedung) {
      return NextResponse.json(
        { message: 'Gedung tidak ditemukan' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(gedung)
  } catch (error) {
    console.error('Error fetching gedung:', error)
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

    const { nama, deskripsi } = await request.json()

    // Validate input
    if (!nama) {
      return NextResponse.json(
        { message: 'Nama gedung harus diisi' },
        { status: 400 }
      )
    }

    // Check if gedung exists
    const existingGedung = await db.gedung.findUnique({
      where: { id: params.id }
    })

    if (!existingGedung) {
      return NextResponse.json(
        { message: 'Gedung tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if nama already exists for other gedung
    const duplicateGedung = await db.gedung.findFirst({
      where: {
        nama,
        id: { not: params.id }
      }
    })

    if (duplicateGedung) {
      return NextResponse.json(
        { message: 'Gedung dengan nama ini sudah ada' },
        { status: 400 }
      )
    }

    // Update gedung
    const gedung = await db.gedung.update({
      where: { id: params.id },
      data: {
        nama,
        deskripsi
      },
      include: {
        kamar: {
          include: {
            _count: {
              select: {
                santri: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Gedung berhasil diperbarui',
      gedung
    })

  } catch (error) {
    console.error('Error updating gedung:', error)
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

    // Check if gedung exists
    const existingGedung = await db.gedung.findUnique({
      where: { id: params.id },
      include: {
        kamar: {
          include: {
            _count: {
              select: {
                santri: true
              }
            }
          }
        }
      }
    })

    if (!existingGedung) {
      return NextResponse.json(
        { message: 'Gedung tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if gedung has kamar with santri
    const totalSantri = existingGedung.kamar.reduce(
      (total, kamar) => total + kamar._count.santri, 
      0
    )

    if (totalSantri > 0) {
      return NextResponse.json(
        { 
          message: 'Tidak dapat menghapus gedung yang masih memiliki santri. Pindahkan terlebih dahulu semua santri dari gedung ini.' 
        },
        { status: 400 }
      )
    }

    // Check if gedung has kamar
    if (existingGedung.kamar.length > 0) {
      return NextResponse.json(
        { 
          message: 'Tidak dapat menghapus gedung yang masih memiliki kamar. Hapus terlebih dahulu semua kamar di gedung ini.' 
        },
        { status: 400 }
      )
    }

    // Delete gedung
    await db.gedung.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Gedung berhasil dihapus' }
    )

  } catch (error) {
    console.error('Error deleting gedung:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}