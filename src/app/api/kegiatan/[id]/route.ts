import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Schema validation
const kegiatanUpdateSchema = z.object({
  aspekId: z.string().min(1, 'Aspek harus dipilih').optional(),
  nama: z.string().min(1, 'Nama kegiatan harus diisi').optional(),
  deskripsi: z.string().optional(),
  frekuensi: z.string().optional(),
  target: z.string().optional(),
})

// PUT - Update kegiatan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = kegiatanUpdateSchema.parse(body)

    // Check if kegiatan exists
    const existingKegiatan = await db.kegiatan.findUnique({
      where: { id }
    })

    if (!existingKegiatan) {
      return NextResponse.json(
        { error: 'Kegiatan tidak ditemukan' },
        { status: 404 }
      )
    }

    // If changing aspek or nama, check for duplicates
    if (validatedData.aspekId || validatedData.nama) {
      const aspekId = validatedData.aspekId || existingKegiatan.aspekId
      const nama = validatedData.nama || existingKegiatan.nama

      const duplicateKegiatan = await db.kegiatan.findFirst({
        where: {
          aspekId,
          nama,
          id: { not: id }
        }
      })

      if (duplicateKegiatan) {
        return NextResponse.json(
          { error: 'Kegiatan dengan nama ini sudah ada dalam aspek yang sama' },
          { status: 400 }
        )
      }

      // If changing aspek, check if aspek exists
      if (validatedData.aspekId) {
        const aspek = await db.aspekNilai.findUnique({
          where: { id: validatedData.aspekId }
        })

        if (!aspek) {
          return NextResponse.json(
            { error: 'Aspek tidak ditemukan' },
            { status: 404 }
          )
        }
      }
    }

    const kegiatan = await db.kegiatan.update({
      where: { id },
      data: validatedData,
      include: {
        aspek: {
          select: {
            id: true,
            nama: true,
          }
        }
      }
    })

    return NextResponse.json(kegiatan)
  } catch (error) {
    console.error('Error updating kegiatan:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Gagal mengupdate kegiatan' },
      { status: 500 }
    )
  }
}

// DELETE - Delete kegiatan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if kegiatan exists
    const existingKegiatan = await db.kegiatan.findUnique({
      where: { id }
    })

    if (!existingKegiatan) {
      return NextResponse.json(
        { error: 'Kegiatan tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.kegiatan.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Kegiatan berhasil dihapus' }
    )
  } catch (error) {
    console.error('Error deleting kegiatan:', error)
    
    // Check for foreign key constraint error
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus kegiatan karena masih digunakan dalam data lain' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Gagal menghapus kegiatan' },
      { status: 500 }
    )
  }
}