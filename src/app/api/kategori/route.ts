import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createKategoriSchema = z.object({
  nama: z.string().min(1, 'Nama kategori harus diisi'),
  aspekId: z.string().min(1, 'Aspek harus dipilih'),
  deskripsi: z.string().optional(),
  bobot: z.number().min(0).max(10).default(1.0)
})

const updateKategoriSchema = z.object({
  nama: z.string().min(1, 'Nama kategori harus diisi').optional(),
  aspekId: z.string().min(1, 'Aspek harus dipilih').optional(),
  deskripsi: z.string().optional(),
  bobot: z.number().min(0).max(10).optional()
})

// GET all kategori
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const aspekId = searchParams.get('aspekId') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.nama = {
        contains: search,
        mode: 'insensitive' as const
      }
    }

    if (aspekId) {
      where.aspekId = aspekId
    }

    const [kategori, total] = await Promise.all([
      db.kategori.findMany({
        where,
        include: {
          aspek: true
        },
        orderBy: [
          {
            aspek: {
              nama: 'asc'
            }
          },
          {
            nama: 'asc'
          }
        ],
        skip,
        take: limit
      }),
      db.kategori.count({ where })
    ])

    return NextResponse.json({
      data: kategori,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching kategori:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data kategori' },
      { status: 500 }
    )
  }
}

// POST create kategori
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createKategoriSchema.parse(body)

    // Check if aspek exists
    const aspek = await db.aspekNilai.findUnique({
      where: { id: validatedData.aspekId }
    })

    if (!aspek) {
      return NextResponse.json(
        { error: 'Aspek tidak ditemukan' },
        { status: 400 }
      )
    }

    // Check if kategori with same name and aspek already exists
    const existingKategori = await db.kategori.findFirst({
      where: {
        aspekId: validatedData.aspekId,
        nama: validatedData.nama
      }
    })

    if (existingKategori) {
      return NextResponse.json(
        { 
          error: 'Kategori dengan nama ini sudah ada di aspek yang sama',
          details: `Kategori "${validatedData.nama}" sudah terdaftar di aspek "${aspek.nama}"`
        },
        { status: 400 }
      )
    }

    const kategori = await db.kategori.create({
      data: validatedData,
      include: {
        aspek: true
      }
    })

    return NextResponse.json(kategori, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating kategori:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat kategori' },
      { status: 500 }
    )
  }
}