import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createJenjangSchema = z.object({
  nama: z.string().min(1, 'Nama jenjang harus diisi'),
  tingkatId: z.string().min(1, 'Tingkat harus dipilih')
})

const updateJenjangSchema = z.object({
  nama: z.string().min(1, 'Nama jenjang harus diisi').optional(),
  tingkatId: z.string().min(1, 'Tingkat harus dipilih').optional()
})

// GET all jenjang
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const tingkatId = searchParams.get('tingkatId') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.nama = {
        contains: search,
        mode: 'insensitive' as const
      }
    }

    if (tingkatId) {
      where.tingkatId = tingkatId
    }

    const [jenjang, total] = await Promise.all([
      db.jenjang.findMany({
        where,
        include: {
          tingkat: true,
          kelas: {
            orderBy: {
              nama: 'asc'
            }
          }
        },
        orderBy: [
          {
            tingkat: {
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
      db.jenjang.count({ where })
    ])

    return NextResponse.json({
      data: jenjang,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching jenjang:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data jenjang' },
      { status: 500 }
    )
  }
}

// POST create jenjang
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createJenjangSchema.parse(body)

    // Check if tingkat exists
    const tingkat = await db.tingkat.findUnique({
      where: { id: validatedData.tingkatId }
    })

    if (!tingkat) {
      return NextResponse.json(
        { error: 'Tingkat tidak ditemukan' },
        { status: 400 }
      )
    }

    // Check if jenjang with same name and tingkat already exists
    const existingJenjang = await db.jenjang.findUnique({
      where: {
        tingkatId_nama: {
          tingkatId: validatedData.tingkatId,
          nama: validatedData.nama
        }
      }
    })

    if (existingJenjang) {
      return NextResponse.json(
        { error: 'Jenjang dengan nama ini sudah ada di tingkat yang sama' },
        { status: 400 }
      )
    }

    const jenjang = await db.jenjang.create({
      data: validatedData,
      include: {
        tingkat: true,
        kelas: true
      }
    })

    return NextResponse.json(jenjang, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating jenjang:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat jenjang' },
      { status: 500 }
    )
  }
}