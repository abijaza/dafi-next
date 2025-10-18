import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const santriId = searchParams.get('santriId')
    const kamarId = searchParams.get('kamarId')
    const tipe = searchParams.get('tipe')

    let whereClause: any = {}
    if (santriId) whereClause.santriId = santriId
    if (tipe) whereClause.tipe = tipe

    let includeClause: any = {
      santri: {
        select: {
          id: true,
          nis: true,
          nama: true,
          status: true
        }
      }
    }

    // If kamarId is provided, filter by santri in that kamar
    if (kamarId) {
      includeClause.santri = {
        select: {
          id: true,
          nis: true,
          nama: true,
          status: true,
          kamar: {
            select: {
              id: true
            }
          }
        }
      }
    }

    const catatan = await db.catatan.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filter by kamar if needed (client-side filtering since we can't do nested where easily)
    let filteredCatatan = catatan
    if (kamarId) {
      filteredCatatan = catatan.filter(c => c.santri.kamar?.id === kamarId)
    }

    return NextResponse.json(filteredCatatan)
  } catch (error) {
    console.error('Error fetching catatan:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data catatan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { santriId, judul, isi, tipe } = await request.json()

    // Validate input
    if (!santriId || !judul || !isi || !tipe) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Check if santri exists
    const santri = await db.santri.findUnique({
      where: { id: santriId }
    })

    if (!santri) {
      return NextResponse.json(
        { message: 'Santri tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validate tipe
    const validTypes = ['CATATAN_BAIK', 'CATATAN_PENTING', 'CATATAN_PERINGATAN']
    if (!validTypes.includes(tipe)) {
      return NextResponse.json(
        { message: 'Tipe catatan tidak valid' },
        { status: 400 }
      )
    }

    // Create catatan
    const catatan = await db.catatan.create({
      data: {
        santriId,
        judul,
        isi,
        tipe
      },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            nama: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json(catatan, { status: 201 })
  } catch (error) {
    console.error('Error creating catatan:', error)
    return NextResponse.json(
      { message: 'Gagal membuat catatan' },
      { status: 500 }
    )
  }
}