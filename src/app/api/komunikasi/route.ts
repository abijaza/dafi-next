import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const santriId = searchParams.get('santriId')
    const waliSantriId = searchParams.get('waliSantriId')
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
          status: true,
          waliSantri: {
            select: {
              id: true
            }
          }
        }
      }
    }

    // If waliSantriId is provided, filter by santri assigned to this wali
    if (waliSantriId) {
      includeClause.santri = {
        select: {
          id: true,
          nis: true,
          nama: true,
          status: true,
          waliSantri: {
            select: {
              id: true
            }
          }
        }
      }
    }

    const komunikasi = await db.komunikasi.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filter by wali santri if needed (client-side filtering)
    let filteredKomunikasi = komunikasi
    if (waliSantriId) {
      filteredKomunikasi = komunikasi.filter(k => k.santri.waliSantri?.id === waliSantriId)
    }

    return NextResponse.json(filteredKomunikasi)
  } catch (error) {
    console.error('Error fetching komunikasi:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data komunikasi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { santriId, judul, isi, tipe, untukOrtu } = await request.json()

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
    const validTypes = ['INFO', 'PRESTASI', 'PERINGATAN']
    if (!validTypes.includes(tipe)) {
      return NextResponse.json(
        { message: 'Tipe komunikasi tidak valid' },
        { status: 400 }
      )
    }

    // Create komunikasi
    const komunikasi = await db.komunikasi.create({
      data: {
        santriId,
        judul,
        isi,
        tipe,
        untukOrtu: untukOrtu || false
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

    return NextResponse.json(komunikasi, { status: 201 })
  } catch (error) {
    console.error('Error creating komunikasi:', error)
    return NextResponse.json(
      { message: 'Gagal membuat komunikasi' },
      { status: 500 }
    )
  }
}