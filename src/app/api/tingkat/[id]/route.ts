import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateTingkatSchema = z.object({
  nama: z.string().min(1, 'Nama tingkat harus diisi').optional(),
  deskripsi: z.string().optional()
})

// GET tingkat by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tingkat = await db.tingkat.findUnique({
      where: { id: params.id },
      include: {
        jenjang: {
          include: {
            kelas: true
          },
          orderBy: {
            nama: 'asc'
          }
        }
      }
    })

    if (!tingkat) {
      return NextResponse.json(
        { error: 'Tingkat tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(tingkat)
  } catch (error) {
    console.error('Error fetching tingkat:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data tingkat' },
      { status: 500 }
    )
  }
}

// PUT update tingkat
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateTingkatSchema.parse(body)

    // Check if tingkat exists
    const existingTingkat = await db.tingkat.findUnique({
      where: { id: params.id }
    })

    if (!existingTingkat) {
      return NextResponse.json(
        { error: 'Tingkat tidak ditemukan' },
        { status: 404 }
      )
    }

    // If updating nama, check for duplicates
    if (validatedData.nama && validatedData.nama !== existingTingkat.nama) {
      const duplicateTingkat = await db.tingkat.findUnique({
        where: { nama: validatedData.nama }
      })

      if (duplicateTingkat) {
        return NextResponse.json(
          { error: 'Tingkat dengan nama ini sudah ada' },
          { status: 400 }
        )
      }
    }

    const tingkat = await db.tingkat.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        jenjang: true
      }
    })

    return NextResponse.json(tingkat)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating tingkat:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate tingkat' },
      { status: 500 }
    )
  }
}

// DELETE tingkat
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if tingkat exists
    const existingTingkat = await db.tingkat.findUnique({
      where: { id: params.id },
      include: {
        jenjang: {
          include: {
            kelas: true
          }
        }
      }
    })

    if (!existingTingkat) {
      return NextResponse.json(
        { error: 'Tingkat tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if tingkat has jenjang with kelas
    const hasKelas = existingTingkat.jenjang.some(jenjang => jenjang.kelas.length > 0)
    
    if (hasKelas) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus tingkat yang masih memiliki kelas' },
        { status: 400 }
      )
    }

    // Check if tingkat has jenjang (even without kelas)
    if (existingTingkat.jenjang.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus tingkat yang masih memiliki jenjang' },
        { status: 400 }
      )
    }

    await db.tingkat.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Tingkat berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting tingkat:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus tingkat' },
      { status: 500 }
    )
  }
}