import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateKelasSchema = z.object({
  nama: z.string().min(1, 'Nama kelas harus diisi').optional(),
  jenjangId: z.string().min(1, 'Jenjang harus dipilih').optional(),
  deskripsi: z.string().optional()
})

// GET kelas by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kelas = await db.kelas.findUnique({
      where: { id: params.id },
      include: {
        jenjang: {
          include: {
            tingkat: true
          }
        }
      }
    })

    if (!kelas) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(kelas)
  } catch (error) {
    console.error('Error fetching kelas:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data kelas' },
      { status: 500 }
    )
  }
}

// PUT update kelas
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateKelasSchema.parse(body)

    // Check if kelas exists
    const existingKelas = await db.kelas.findUnique({
      where: { id: params.id }
    })

    if (!existingKelas) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      )
    }

    // If updating jenjangId, check if jenjang exists
    if (validatedData.jenjangId) {
      const jenjang = await db.jenjang.findUnique({
        where: { id: validatedData.jenjangId },
        include: {
          tingkat: true
        }
      })

      if (!jenjang) {
        return NextResponse.json(
          { error: 'Jenjang tidak ditemukan' },
          { status: 400 }
        )
      }
    }

    // Check for duplicates if updating nama or jenjangId
    const newNama = validatedData.nama || existingKelas.nama
    const newJenjangId = validatedData.jenjangId || existingKelas.jenjangId

    if (newNama !== existingKelas.nama || newJenjangId !== existingKelas.jenjangId) {
      const duplicateKelas = await db.kelas.findUnique({
        where: {
          jenjangId_nama: {
            jenjangId: newJenjangId,
            nama: newNama
          }
        }
      })

      if (duplicateKelas && duplicateKelas.id !== params.id) {
        return NextResponse.json(
          { error: 'Kelas dengan nama ini sudah ada di jenjang yang sama' },
          { status: 400 }
        )
      }
    }

    const kelas = await db.kelas.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        jenjang: {
          include: {
            tingkat: true
          }
        }
      }
    })

    return NextResponse.json(kelas)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating kelas:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate kelas' },
      { status: 500 }
    )
  }
}

// DELETE kelas
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if kelas exists
    const existingKelas = await db.kelas.findUnique({
      where: { id: params.id },
      include: {
        kelasPeriodes: true
      }
    })

    if (!existingKelas) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if kelas is used in any periode
    if (existingKelas.kelasPeriodes.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus kelas yang masih digunakan dalam periode' },
        { status: 400 }
      )
    }

    await db.kelas.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Kelas berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting kelas:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus kelas' },
      { status: 500 }
    )
  }
}