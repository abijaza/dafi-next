import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateAspekNilaiSchema = z.object({
  nama: z.string().min(1, 'Nama aspek harus diisi').optional(),
  deskripsi: z.string().optional(),
  jenis: z.enum(['AKADEMIK', 'NON_AKADEMIK']).optional()
})

// GET aspek nilai by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const aspekNilai = await db.aspekNilai.findUnique({
      where: { id: params.id },
      include: {
        kategori: true
      }
    })

    if (!aspekNilai) {
      return NextResponse.json(
        { error: 'Aspek nilai tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(aspekNilai)
  } catch (error) {
    console.error('Error fetching aspek nilai:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data aspek nilai' },
      { status: 500 }
    )
  }
}

// PUT update aspek nilai
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateAspekNilaiSchema.parse(body)

    // Check if aspek nilai exists
    const existingAspek = await db.aspekNilai.findUnique({
      where: { id: params.id }
    })

    if (!existingAspek) {
      return NextResponse.json(
        { error: 'Aspek nilai tidak ditemukan' },
        { status: 404 }
      )
    }

    const aspekNilai = await db.aspekNilai.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        kategori: true
      }
    })

    return NextResponse.json(aspekNilai)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating aspek nilai:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate aspek nilai' },
      { status: 500 }
    )
  }
}

// DELETE aspek nilai
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if aspek nilai exists
    const existingAspek = await db.aspekNilai.findUnique({
      where: { id: params.id },
      include: {
        kategori: true
      }
    })

    if (!existingAspek) {
      return NextResponse.json(
        { error: 'Aspek nilai tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if there are related kategori
    if (existingAspek.kategori.length > 0) {
      return NextResponse.json(
        { 
          error: 'Tidak dapat menghapus aspek yang memiliki kategori',
          details: `Hapus terlebih dahulu ${existingAspek.kategori.length} kategori yang terkait`
        },
        { status: 400 }
      )
    }

    await db.aspekNilai.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Aspek nilai berhasil dihapus' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting aspek nilai:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus aspek nilai' },
      { status: 500 }
    )
  }
}