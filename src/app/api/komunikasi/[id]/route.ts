import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const komunikasi = await db.komunikasi.findUnique({
      where: { id: params.id },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            nama: true,
            status: true
          }
        }
      }
    })

    if (!komunikasi) {
      return NextResponse.json(
        { message: 'Komunikasi tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(komunikasi)
  } catch (error) {
    console.error('Error fetching komunikasi:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data komunikasi' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { judul, isi, tipe, untukOrtu } = await request.json()

    // Validate input
    if (!judul || !isi || !tipe) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Check if komunikasi exists
    const existingKomunikasi = await db.komunikasi.findUnique({
      where: { id: params.id }
    })

    if (!existingKomunikasi) {
      return NextResponse.json(
        { message: 'Komunikasi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validate tipe
    const validTypes = ['INFO', 'PRESTASI', 'PERINGATAN']
    if (!validTypes.includes(tipe)) {
      return NextResponse.json(
        { message: 'Tipe komunikasi tidak valid' },
        { status: 400 }
      )
    }

    // Update komunikasi
    const komunikasi = await db.komunikasi.update({
      where: { id: params.id },
      data: {
        judul,
        isi,
        tipe,
        untukOrtu
      },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            nama: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json(komunikasi)
  } catch (error) {
    console.error('Error updating komunikasi:', error)
    return NextResponse.json(
      { message: 'Gagal memperbarui komunikasi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if komunikasi exists
    const existingKomunikasi = await db.komunikasi.findUnique({
      where: { id: params.id }
    })

    if (!existingKomunikasi) {
      return NextResponse.json(
        { message: 'Komunikasi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete komunikasi
    await db.komunikasi.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Komunikasi berhasil dihapus' }
    )
  } catch (error) {
    console.error('Error deleting komunikasi:', error)
    return NextResponse.json(
      { message: 'Gagal menghapus komunikasi' },
      { status: 500 }
    )
  }
}