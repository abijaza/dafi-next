import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kelasPeriodeId = searchParams.get('kelasPeriodeId')

    const whereClause = kelasPeriodeId ? { kelasPeriodeId } : {}

    const santriKelas = await db.santriKelas.findMany({
      where: whereClause,
      include: {
        santri: true,
        kelasPeriode: {
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
            periode: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(santriKelas)
  } catch (error) {
    console.error('Error fetching santri kelas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch santri kelas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { santriId, kelasPeriodeId } = body

    if (!santriId || !kelasPeriodeId) {
      return NextResponse.json(
        { error: 'santriId and kelasPeriodeId are required' },
        { status: 400 }
      )
    }

    // Check if already exists
    const existing = await db.santriKelas.findFirst({
      where: {
        santriId,
        kelasPeriodeId
      }
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const santriKelas = await db.santriKelas.create({
      data: {
        santriId,
        kelasPeriodeId
      },
      include: {
        santri: true,
        kelasPeriode: {
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
            periode: true
          }
        }
      }
    })

    return NextResponse.json(santriKelas, { status: 201 })
  } catch (error) {
    console.error('Error creating santri kelas:', error)
    return NextResponse.json(
      { error: 'Failed to create santri kelas' },
      { status: 500 }
    )
  }
}