import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createTingkatSchema = z.object({
  nama: z.string().min(1, 'Nama tingkat harus diisi'),
  deskripsi: z.string().optional()
})

const updateTingkatSchema = z.object({
  nama: z.string().min(1, 'Nama tingkat harus diisi').optional(),
  deskripsi: z.string().optional()
})

// GET all tingkat
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = search
      ? {
          nama: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      : {}

    const [tingkat, total] = await Promise.all([
      db.tingkat.findMany({
        where,
        include: {
          jenjang: {
            include: {
              kelas: true
            }
          }
        },
        orderBy: {
          nama: 'asc'
        },
        skip,
        take: limit
      }),
      db.tingkat.count({ where })
    ])

    return NextResponse.json({
      data: tingkat,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching tingkat:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data tingkat' },
      { status: 500 }
    )
  }
}

// POST create tingkat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTingkatSchema.parse(body)

    // Check if tingkat with same name already exists
    const existingTingkat = await db.tingkat.findUnique({
      where: { nama: validatedData.nama }
    })

    if (existingTingkat) {
      return NextResponse.json(
        { error: 'Tingkat dengan nama ini sudah ada' },
        { status: 400 }
      )
    }

    const tingkat = await db.tingkat.create({
      data: validatedData,
      include: {
        jenjang: true
      }
    })

    return NextResponse.json(tingkat, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating tingkat:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat tingkat' },
      { status: 500 }
    )
  }
}