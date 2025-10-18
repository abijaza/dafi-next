import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const catatan = await db.catatan.findUnique({
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

    if (!catatan) {
      return NextResponse.json(
        { message: 'Catatan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(catatan)
  } catch (error) {
    console.error('Error fetching catatan:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data catatan' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { judul, isi, tipe } = await request.json()

    // Validate input
    if (!judul || !isi || !tipe) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Check if catatan exists
    const existingCatatan = await db.catatan.findUnique({
      where: { id: params.id }
    })

    if (!existingCatatan) {
      return NextResponse.json(
        { message: 'Catatan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validate tipe
    const validTypes = ['CATATAN_BAIK', 'CATATAN_PENTING', 'CATATAN_PERINGATAN']
    if (!validTypes.includes(tipe)) {
      return NextResponse.json(
        { message: 'Tipe catatan tidak valid' },
        { status: 400 }
      )
    }

    // Update catatan
    const catatan = await db.catatan.update({
      where: { id: params.id },
      data: {
        judul,
        isi,
        tipe
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

    return NextResponse.json(catatan)
  } catch (error) {
    console.error('Error updating catatan:', error)
    return NextResponse.json(
      { message: 'Gagal memperbarui catatan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if catatan exists
    const existingCatatan = await db.catatan.findUnique({
      where: { id: params.id }
    })

    if (!existingCatatan) {
      return NextResponse.json(
        { message: 'Catatan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete catatan
    await db.catatan.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Catatan berhasil dihapus' }
    )
  } catch (error) {
    console.error('Error deleting catatan:', error)
    return NextResponse.json(
      { message: 'Gagal menghapus catatan' },
      { status: 500 }
    )
  }
}