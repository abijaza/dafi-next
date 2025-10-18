import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createKelasSchema = z.object({
  nama: z.string().min(1, 'Nama kelas harus diisi'),
  jenjangId: z.string().min(1, 'Jenjang harus dipilih'),
  deskripsi: z.string().optional()
})

const updateKelasSchema = z.object({
  nama: z.string().min(1, 'Nama kelas harus diisi').optional(),
  jenjangId: z.string().min(1, 'Jenjang harus dipilih').optional(),
  deskripsi: z.string().optional()
})

// GET all kelas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const jenjangId = searchParams.get('jenjangId') || ''
    const tingkatId = searchParams.get('tingkatId') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.nama = {
        contains: search,
        mode: 'insensitive' as const
      }
    }

    if (jenjangId) {
      where.jenjangId = jenjangId
    }

    if (tingkatId) {
      where.jenjang = {
        tingkatId: tingkatId
      }
    }

    const [kelas, total] = await Promise.all([
      db.kelas.findMany({
        where,
        include: {
          jenjang: {
            include: {
              tingkat: true
            }
          }
        },
        orderBy: [
          {
            jenjang: {
              tingkat: {
                nama: 'asc'
              }
            }
          },
          {
            jenjang: {
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
      db.kelas.count({ where })
    ])

    return NextResponse.json({
      data: kelas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching kelas:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data kelas' },
      { status: 500 }
    )
  }
}

// POST create kelas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createKelasSchema.parse(body)

    // Check if jenjang exists
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

    // Check if kelas with same name and jenjang already exists
    const existingKelas = await db.kelas.findUnique({
      where: {
        jenjangId_nama: {
          jenjangId: validatedData.jenjangId,
          nama: validatedData.nama
        }
      }
    })

    if (existingKelas) {
      return NextResponse.json(
        { 
          error: 'Kelas dengan nama ini sudah ada di jenjang yang sama',
          details: `Kelas "${validatedData.nama}" sudah terdaftar di jenjang "${jenjang.nama}" (Tingkat ${jenjang.tingkat.nama})`
        },
        { status: 400 }
      )
    }

    const kelas = await db.kelas.create({
      data: validatedData,
      include: {
        jenjang: {
          include: {
            tingkat: true
          }
        }
      }
    })

    return NextResponse.json(kelas, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating kelas:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat kelas' },
      { status: 500 }
    )
  }
}