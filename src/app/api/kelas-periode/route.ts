import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodeId = searchParams.get('periodeId')

    const whereClause = periodeId ? { periodeId } : {}

    const kelasPeriodes = await db.kelasPeriode.findMany({
      where: whereClause,
      include: {
        kelas: {
          include: {
            jenjang: {
              include: {
                tingkat: true
              }
            }
          }
        },
        periode: true,
        _count: {
          select: {
            santriKelas: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(kelasPeriodes)
  } catch (error) {
    console.error('Error fetching kelas periodes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kelas periodes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { kelasId, periodeId } = body

    if (!kelasId || !periodeId) {
      return NextResponse.json(
        { error: 'kelasId and periodeId are required' },
        { status: 400 }
      )
    }

    // Check if already exists
    const existing = await db.kelasPeriode.findFirst({
      where: {
        kelasId,
        periodeId
      }
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const kelasPeriode = await db.kelasPeriode.create({
      data: {
        kelasId,
        periodeId
      },
      include: {
        kelas: {
          include: {
            jenjang: {
              include: {
                tingkat: true
              }
            }
          }
        },
        periode: true,
        _count: {
          select: {
            santriKelas: true
          }
        }
      }
    })

    return NextResponse.json(kelasPeriode, { status: 201 })
  } catch (error) {
    console.error('Error creating kelas periode:', error)
    return NextResponse.json(
      { error: 'Failed to create kelas periode' },
      { status: 500 }
    )
  }
}