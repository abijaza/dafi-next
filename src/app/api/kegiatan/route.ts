import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Schema validation
const kegiatanSchema = z.object({
  aspekId: z.string().min(1, 'Aspek harus dipilih'),
  nama: z.string().min(1, 'Nama kegiatan harus diisi'),
  deskripsi: z.string().optional(),
  frekuensi: z.string().optional(),
  target: z.string().optional(),
})

// GET - Mendapatkan semua kegiatan
export async function GET() {
  try {
    const kegiatan = await db.kegiatan.findMany({
      include: {
        aspek: {
          select: {
            id: true,
            nama: true,
          }
        }
      },
      orderBy: {
        aspek: {
          nama: 'asc'
        }
      }
    })

    return NextResponse.json(kegiatan)
  } catch (error) {
    console.error('Error fetching kegiatan:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data kegiatan' },
      { status: 500 }
    )
  }
}

// POST - Membuat kegiatan baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = kegiatanSchema.parse(body)

    // Check if aspek exists
    const aspek = await db.aspekNilai.findUnique({
      where: { id: validatedData.aspekId }
    })

    if (!aspek) {
      return NextResponse.json(
        { error: 'Aspek tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if kegiatan already exists in the same aspek
    const existingKegiatan = await db.kegiatan.findFirst({
      where: {
        aspekId: validatedData.aspekId,
        nama: validatedData.nama
      }
    })

    if (existingKegiatan) {
      return NextResponse.json(
        { error: 'Kegiatan dengan nama ini sudah ada dalam aspek yang sama' },
        { status: 400 }
      )
    }

    const kegiatan = await db.kegiatan.create({
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

    return NextResponse.json(kegiatan, { status: 201 })
  } catch (error) {
    console.error('Error creating kegiatan:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Gagal membuat kegiatan baru' },
      { status: 500 }
    )
  }
}