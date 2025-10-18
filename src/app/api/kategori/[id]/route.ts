import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateKategoriSchema = z.object({
  nama: z.string().min(1, 'Nama kategori harus diisi').optional(),
  aspekId: z.string().min(1, 'Aspek harus dipilih').optional(),
  deskripsi: z.string().optional(),
  bobot: z.number().min(0).max(10).optional()
})

// GET kategori by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kategori = await db.kategori.findUnique({
      where: { id: params.id },
      include: {
        aspek: true
      }
    })

    if (!kategori) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(kategori)
  } catch (error) {
    console.error('Error fetching kategori:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data kategori' },
      { status: 500 }
    )
  }
}

// PUT update kategori
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateKategoriSchema.parse(body)

    // Check if kategori exists
    const existingKategori = await db.kategori.findUnique({
      where: { id: params.id }
    })

    if (!existingKategori) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      )
    }

    // If updating aspekId or nama, check for duplicates
    if (validatedData.aspekId || validatedData.nama) {
      const newAspekId = validatedData.aspekId || existingKategori.aspekId
      const newNama = validatedData.nama || existingKategori.nama

      const duplicateKategori = await db.kategori.findFirst({
        where: {
          aspekId: newAspekId,
          nama: newNama,
          id: { not: params.id } // Exclude current record
        }
      })

      if (duplicateKategori && duplicateKategori.id !== params.id) {
        const aspek = await db.aspekNilai.findUnique({
          where: { id: newAspekId }
        })
        
        return NextResponse.json(
          { 
            error: 'Kategori dengan nama ini sudah ada di aspek yang sama',
            details: `Kategori "${newNama}" sudah terdaftar di aspek "${aspek?.nama || 'Unknown'}"`
          },
          { status: 400 }
        )
      }
    }

    const kategori = await db.kategori.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        aspek: true
      }
    })

    return NextResponse.json(kategori)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating kategori:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate kategori' },
      { status: 500 }
    )
  }
}

// DELETE kategori
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if kategori exists
    const existingKategori = await db.kategori.findUnique({
      where: { id: params.id }
    })

    if (!existingKategori) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      )
    }

    // TODO: Check if there are related nilai records
    // For now, we'll allow deletion

    await db.kategori.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Kategori berhasil dihapus' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting kategori:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus kategori' },
      { status: 500 }
    )
  }
}