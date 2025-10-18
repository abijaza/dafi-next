import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateJenjangSchema = z.object({
  nama: z.string().min(1, 'Nama jenjang harus diisi').optional(),
  tingkatId: z.string().min(1, 'Tingkat harus dipilih').optional()
})

// GET jenjang by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jenjang = await db.jenjang.findUnique({
      where: { id: params.id },
      include: {
        tingkat: true,
        kelas: {
          orderBy: {
            nama: 'asc'
          }
        }
      }
    })

    if (!jenjang) {
      return NextResponse.json(
        { error: 'Jenjang tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(jenjang)
  } catch (error) {
    console.error('Error fetching jenjang:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data jenjang' },
      { status: 500 }
    )
  }
}

// PUT update jenjang
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateJenjangSchema.parse(body)

    // Check if jenjang exists
    const existingJenjang = await db.jenjang.findUnique({
      where: { id: params.id }
    })

    if (!existingJenjang) {
      return NextResponse.json(
        { error: 'Jenjang tidak ditemukan' },
        { status: 404 }
      )
    }

    // If updating tingkatId, check if tingkat exists
    if (validatedData.tingkatId) {
      const tingkat = await db.tingkat.findUnique({
        where: { id: validatedData.tingkatId }
      })

      if (!tingkat) {
        return NextResponse.json(
          { error: 'Tingkat tidak ditemukan' },
          { status: 400 }
        )
      }
    }

    // Check for duplicates if updating nama or tingkatId
    const newNama = validatedData.nama || existingJenjang.nama
    const newTingkatId = validatedData.tingkatId || existingJenjang.tingkatId

    if (newNama !== existingJenjang.nama || newTingkatId !== existingJenjang.tingkatId) {
      const duplicateJenjang = await db.jenjang.findUnique({
        where: {
          tingkatId_nama: {
            tingkatId: newTingkatId,
            nama: newNama
          }
        }
      })

      if (duplicateJenjang && duplicateJenjang.id !== params.id) {
        return NextResponse.json(
          { error: 'Jenjang dengan nama ini sudah ada di tingkat yang sama' },
          { status: 400 }
        )
      }
    }

    const jenjang = await db.jenjang.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        tingkat: true,
        kelas: true
      }
    })

    return NextResponse.json(jenjang)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating jenjang:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate jenjang' },
      { status: 500 }
    )
  }
}

// DELETE jenjang
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if jenjang exists
    const existingJenjang = await db.jenjang.findUnique({
      where: { id: params.id },
      include: {
        kelas: true
      }
    })

    if (!existingJenjang) {
      return NextResponse.json(
        { error: 'Jenjang tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if jenjang has kelas
    if (existingJenjang.kelas.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus jenjang yang masih memiliki kelas' },
        { status: 400 }
      )
    }

    await db.jenjang.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Jenjang berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting jenjang:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus jenjang' },
      { status: 500 }
    )
  }
}