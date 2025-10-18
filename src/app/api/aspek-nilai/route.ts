import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createAspekNilaiSchema = z.object({
  nama: z.string().min(1, 'Nama aspek harus diisi'),
  deskripsi: z.string().optional(),
  jenis: z.enum(['AKADEMIK', 'NON_AKADEMIK']).default('NON_AKADEMIK')
})

const updateAspekNilaiSchema = z.object({
  nama: z.string().min(1, 'Nama aspek harus diisi').optional(),
  deskripsi: z.string().optional(),
  jenis: z.enum(['AKADEMIK', 'NON_AKADEMIK']).optional()
})

// GET all aspek nilai
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const jenis = searchParams.get('jenis') || '' // AKADEMIK or NON_AKADEMIK

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.nama = {
        contains: search,
        mode: 'insensitive' as const
      }
    }

    if (jenis) {
      where.jenis = jenis
    }

    const [aspekNilai, total] = await Promise.all([
      db.aspekNilai.findMany({
        where,
        include: {
          kategori: true
        },
        orderBy: {
          nama: 'asc'
        },
        skip,
        take: limit
      }),
      db.aspekNilai.count({ where })
    ])

    return NextResponse.json({
      data: aspekNilai,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching aspek nilai:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data aspek nilai' },
      { status: 500 }
    )
  }
}

// POST create aspek nilai
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createAspekNilaiSchema.parse(body)

    const aspekNilai = await db.aspekNilai.create({
      data: validatedData,
      include: {
        kategori: true
      }
    })

    return NextResponse.json(aspekNilai, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating aspek nilai:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat aspek nilai' },
      { status: 500 }
    )
  }
}